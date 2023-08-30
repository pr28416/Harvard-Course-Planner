import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import colors from "./colors";
import Dropdown from "./dropdown";
import DescriptionView from "./descriptionView";
import { Cancel, CloseRounded } from "@mui/icons-material";
import ExportCalendarView from "./exportCalendarView";

function bsearch(arr, target, comp) {
  let lo = 0;
  let up = arr.length;
  while (lo < up) {
    let mid = Math.floor((lo + up) / 2);
    if (comp(target, arr[mid])) {
      up = mid;
    } else {
      lo = mid + 1;
    }
  }
  return lo;
}

function formatCourses({ terms, courses }) {
  let unused = [];
  let used = [];
  // Filter by term/day
  let termSplit = {};
  for (let term of terms) {
    termSplit[term] = { Su: [], M: [], T: [], W: [], Th: [], F: [], Sa: [] };
  }

  let colorIdx = 0;

  for (let course of courses) {
    if (
      course.days === null ||
      course.start_date === null ||
      course.end_date === null
    ) {
      // Add to unused
      unused.push(course);
      continue;
    }
    course.color = colors[colorIdx];
    colorIdx = (colorIdx + 1) % colors.length;
    for (let day of course.days) {
      course.num_overlaps = 1;
      // Get raw time
      if (course.start_time && course.end_time) {
        let split = course.start_time.split(":");
        course.raw_start_time = parseInt(split[0]);
        course.raw_start_time =
          ((parseInt(split[0]) % 12) +
            (split[1][split[1].length - 2] == "p" ? 12 : 0)) *
            60 +
          parseInt(split[1].slice(0, 2));
        split = course.end_time.split(":");
        course.raw_end_time = parseInt(split[0]);
        course.raw_end_time =
          ((parseInt(split[0]) % 12) +
            (split[1][split[1].length - 2] == "p" ? 12 : 0)) *
            60 +
          parseInt(split[1].slice(0, 2));
        // Add to the terms
        termSplit[course.term][day].push({ ...course });
      } else {
        // Add to unused
        course.raw_start_time = null;
        course.raw_end_time = null;
        continue;
      }
    }
    used.push(course);
  }
  // Divide into groups; iterate by term first
  // Iterate by term
  for (let term of terms) {
    // Iterate by day
    for (let day of ["Su", "M", "T", "W", "Th", "F", "Sa"]) {
      let classes = termSplit[term][day];

      // Sort by start time and find number of chunks
      classes.sort((a, b) => a.raw_start_time - b.raw_start_time);
      let greatestEndTime = 0;
      let chunks = [[]];
      if (classes.length > 0) {
        classes[0].chunk = 0;
        greatestEndTime = classes[0].raw_end_time;
        chunks[chunks.length - 1].push(classes[0]);
      }

      for (let courseIdx = 1; courseIdx < classes.length; courseIdx++) {
        let course = classes[courseIdx];
        let prevCourse = classes[courseIdx - 1];
        greatestEndTime = Math.max(greatestEndTime, prevCourse.raw_end_time);
        if (course.raw_start_time >= greatestEndTime) {
          course.chunk = prevCourse.chunk + 1;
          greatestEndTime = course.raw_end_time;
          chunks.push([]);
        } else {
          course.chunk = prevCourse.chunk;
        }
        chunks[chunks.length - 1].push(course);
      }

      // Every element in chunkGroups is an array of groups
      let chunkGroups = [];

      // For each chunk, add column groups
      for (let chunk of chunks) {
        // Sort by end time
        chunk.sort((a, b) => a.raw_end_time - b.raw_end_time);
        // chunkGroups.push([])

        let colGroups = [];
        let courseCount = 0;
        let totalCourses = chunk.length;

        // Iterate until there are no items left
        while (courseCount < totalCourses) {
          // Add new group
          colGroups.push([]);
          let usedCourses = new Set();
          let end = -1;

          // Schedule most courses possible
          for (let course of chunk) {
            if (end <= course.raw_start_time) {
              end = course.raw_end_time;
              course.width = 1;
              colGroups[colGroups.length - 1].push(course);
              usedCourses.add(course.uuid);
              courseCount++;
              // console.log("Scheduled", course.class_tag);
            }
          }

          // Removed scheduled courses
          chunk = chunk.filter((course) => !usedCourses.has(course.uuid));
        }
        // For each column group in chunk, expand width of each course to fill
        for (
          let colGroupIdx = 0;
          colGroupIdx < colGroups.length - 1;
          colGroupIdx++
        ) {
          for (let course of colGroups[colGroupIdx]) {
            for (
              let compareIdx = colGroupIdx + 1;
              compareIdx < colGroups.length;
              compareIdx++
            ) {
              let idx = bsearch(
                colGroups[compareIdx],
                course,
                (a, b) => a.raw_start_time <= b.raw_start_time
              );
              let prevIdx = idx - 1;
              if (
                prevIdx >= 0 &&
                colGroups[compareIdx][prevIdx].raw_end_time >=
                  course.raw_start_time
              ) {
                break;
              }
              if (
                idx < colGroups[compareIdx].length &&
                colGroups[compareIdx][idx].raw_start_time <= course.raw_end_time
              ) {
                break;
              }
              course.width++;
            }
          }
        }

        // Add column group to chunkGroups
        chunkGroups.push(colGroups);
      }

      termSplit[term][day] = chunkGroups;
    }
  }

  return { formatted: termSplit, used: used, unused: unused };
}

export default function ScheduleMatrix({
  terms,
  starredCourses,
  visible,
  handler,
  setDescriptionViewCourse,
  setDescriptionViewOpen,
}) {
  const dayHeaders = ["Su", "M", "T", "W", "Th", "F", "Sa"];
  const dayHeaderMap = {
    Su: "Sun",
    M: "Mon",
    T: "Tue",
    W: "Wed",
    Th: "Thu",
    F: "Fri",
    Sa: "Sat",
  };
  const [selectedTerm, setSelectedTerm] = useState(
    terms !== null && terms !== undefined && terms.length ? terms[0] : null
  );
  const dayColWidthRef = useRef(null);
  const [dayColWidth, setDayColWidth] = useState(0);
  const [formattedCourses, setFormattedCourses] = useState([]);
  const [usedCourses, setUsedCourses] = useState([]);
  const [unusedCourses, setUnusedCourses] = useState([]);
  const [descIsOpen, setDescIsOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [exportViewIsOpen, setExportViewIsOpen] = useState(false);

  useEffect(() => {
    function handleCalendarResize() {
      setDayColWidth(dayColWidthRef.current.offsetWidth);
    }
    window.addEventListener("resize", handleCalendarResize);
    return () => {
      window.removeEventListener("resize", handleCalendarResize);
    };
  }, []);

  useLayoutEffect(() => {
    setDayColWidth(dayColWidthRef.current.offsetWidth);
  }, [visible]);

  let timeLabels = Array.from({ length: 48 }, (_, i) => i)
    .filter((time) => time >= 14 && time < 40)
    .map((hour) =>
      hour % 2
        ? ""
        : Math.floor(hour / 2) === 0
        ? "12AM"
        : Math.floor(hour / 2) < 12
        ? `${Math.floor(hour / 2)}AM`
        : Math.floor(hour / 2) === 12
        ? `12PM`
        : `${Math.floor(hour / 2) - 12}PM`
    );
  timeLabels.push("");

  useEffect(() => {
    const { formatted, used, unused } = formatCourses({
      terms: terms,
      courses: Object.values(starredCourses),
    });
    setFormattedCourses(formatted);
    setUsedCourses(used);
    setUnusedCourses(unused);
    // setFormattedCourses(
    //   formatCourses({ terms: terms, courses: Object.values(starredCourses) })
    // );
  }, [starredCourses]);

  const getNumCourses = (term) => {
    if (formattedCourses[term] === undefined || formattedCourses[term] === null)
      return 0;
    let uuids = new Set();
    for (let day of dayHeaders) {
      // numCourses += formattedCourses[term][day].length;
      for (let chunk of formattedCourses[term][day]) {
        for (let group of chunk) {
          for (let course of group) {
            uuids.add(course.uuid);
          }
        }
      }
    }
    return uuids.size;
  };

  return (
    <div className="flex flex-col h-full items-start gap-4">
      {/* Filter */}
      <div className="w-full flex flex-row items-center gap-4 flex-wrap justify-between">
        <Dropdown
          datasource={terms}
          handler={(_, newTerm) => setSelectedTerm(newTerm)}
          customLabel={(term) => `${term} (${getNumCourses(term)})`}
          tag="term"
          single
        />

        <button
          className="flex flex-row items-center px-3 py-2 gap-2 text-sm font-semibold bg-zinc-100 dark:bg-zinc-800 rounded-lg text-zinc-950 dark:text-zinc-100 disabled:text-zinc-300 dark:disabled:text-zinc-600 disabled:bg-zinc-50 dark:disabled:bg-zinc-800"
          onClick={() => {
            setExportViewIsOpen(true);
          }}
          disabled={
            !usedCourses.reduce((p, c) => p || c.term === selectedTerm, false)
          }
        >
          Export calendar for selected term
        </button>
      </div>
      {/* Calendar + details */}
      <div className="flex flex-col max-w-full max-h-full border border-zinc-200 dark:border-zinc-700 overflow-clip rounded-lg text-zinc-700 dark:text-zinc-300">
        {/* Calendar */}
        <div
          className={`${
            unusedCourses.length > 0
              ? "border-b border-b-blue-200 dark:border-b-zinc-700"
              : ""
          } flex flex-row w-full h-full`}
        >
          {/* First column */}
          <table className="h-full table-fixed bg-white dark:bg-zinc-950 rounded-lg">
            <thead>
              {/* Days header */}
              <tr className="bg-zinc-100 dark:bg-zinc-800">
                <th className="py-2 font-medium text-sm border-b-zinc-100 dark:border-b-zinc-800">
                  &nbsp;
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Times */}
              {timeLabels
                .filter((_, idx) => !(idx % 2))
                .map((time, key) => (
                  <tr
                    key={key}
                    className={`divide-zinc-100 dark:divide-zinc-800 divide-x ${
                      time === "" ? "h-6" : "h-12"
                    }`}
                  >
                    <td className="pl-4 pr-2 py-2 font-light text-xs text-end text-zinc-400">
                      {time}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          {/* Main calendar content */}
          <table className="w-full h-full table-fixed bg-white dark:bg-zinc-950 rounded-lg border-l border-l-zinc-100 dark:border-l-zinc-800 overflow-x-scroll">
            <thead>
              {/* Days header */}
              <tr className="bg-zinc-100 dark:bg-zinc-800">
                {dayHeaders.map((day, idx) => (
                  <th
                    key={idx}
                    style={{ minWidth: "4.5rem" }}
                    className=" py-2 font-medium text-sm"
                  >
                    {dayHeaderMap[day]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {/* Times */}
              {timeLabels.map((time, key) => (
                <tr
                  key={key}
                  className="divide-x divide-zinc-100 dark:divide-zinc-800"
                >
                  {dayHeaders.map((day, idx) => (
                    <td
                      // style={{ width: "20rem" }}
                      key={idx}
                      className="w-12 relative py-2 font-medium text-sm h-6"
                    >
                      {time !== "7AM" ? null : (
                        // Day column where classes are scheduled
                        <div
                          className="absolute top-6 w-full"
                          style={{
                            height: `${(6 * (timeLabels.length - 1)) / 4}rem`,
                          }}
                          ref={dayColWidthRef}
                        >
                          {formattedCourses.length === 0
                            ? null
                            : formattedCourses[selectedTerm][day].map((chunk) =>
                                chunk.map((colGroup, colGroupIdx) =>
                                  colGroup.map((course) => (
                                    // Course
                                    <div
                                      key={course.uuid}
                                      className={`absolute text-xs break-words font-semibold rounded-sm overflow-y-auto no-scrollbar z-10 hover:cursor-pointer ${course.color.border} ${course.color.bg} ${course.color.text}`}
                                      style={{
                                        fontSize: "0.55rem",
                                        lineHeight: "0.75rem",
                                        top: `${
                                          (course.raw_start_time - 420) / 20
                                        }rem`,
                                        height: `${
                                          (course.raw_end_time -
                                            course.raw_start_time) /
                                          20
                                        }rem`,
                                        width: `${
                                          (dayColWidth / chunk.length) *
                                          course.width
                                        }px`,
                                        left: `${
                                          (colGroupIdx * dayColWidth) /
                                          chunk.length
                                        }px`,
                                      }}
                                      onClick={(e) => {
                                        setDescriptionViewCourse(course),
                                          setDescriptionViewOpen(true);
                                        // setSelectedCourse(course);
                                        // setDescIsOpen(true);
                                      }}
                                    >
                                      <div className="flex flex-col">
                                        <div>{course.class_tag}</div>
                                        <div className="font-normal">
                                          {course.start_time} -{" "}
                                          {course.end_time}
                                        </div>
                                      </div>
                                    </div>
                                  ))
                                )
                              )}
                          {/* {time} */}
                        </div>
                      )}
                      {/* <div className="absolute top-6 left-0 bg-blue-100">
                    {time}
                  </div> */}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Details */}
        {unusedCourses.length === 0 ? null : (
          <div className="flex flex-row flex-wrap gap-2 p-2 items-center">
            <div className="px-2 py-1 text-xs font-semibold">Not shown:</div>
            {unusedCourses.map((course, courseIdx) => (
              <button
                className="flex flex-row gap-2 items-center px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full text-xs font-semibold"
                key={courseIdx}
                onClick={() => {
                  setDescriptionViewCourse(course);
                  setDescriptionViewOpen(true);
                }}
              >
                {course.class_tag}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handler(course.uuid, course);
                  }}
                >
                  <Cancel
                    className="text-zinc-400 dark:text-zinc-600"
                    fontSize="small"
                  />
                </button>
              </button>
            ))}
          </div>
        )}
      </div>
      {usedCourses.filter((course) => course.term === selectedTerm).length ===
      0 ? null : (
        <ExportCalendarView
          courses={usedCourses.filter((course) => course.term === selectedTerm)}
          isOpen={exportViewIsOpen}
          setOpen={setExportViewIsOpen}
        />
      )}
    </div>
  );
}

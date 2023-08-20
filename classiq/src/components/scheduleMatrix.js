import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import colors from "./colors";
import Dropdown from "./dropdown";

function formatCourses({ terms, courses }) {
  // Filter by term/day
  let termSplit = {};
  for (let term of terms) {
    termSplit[term] = { Su: [], M: [], T: [], W: [], Th: [], F: [], Sa: [] };
  }
  // console.log("terms", terms);

  let colorIdx = 0;

  for (let course of courses) {
    if (course.days === null) {
      // console.log(course.class_tag, "didn't have days");
      continue;
    }
    // console.log(course.class_tag);
    course.color = colors[colorIdx];
    colorIdx = (colorIdx + 1) % colors.length;
    for (let day of course.days) {
      // console.log(day);
      course.num_overlaps = 1;
      // Get raw time
      if (course.start_time && course.end_time) {
        let split = course.start_time.split(":");
        course.raw_start_time = parseInt(split[0]);
        course.raw_start_time =
          (parseInt(split[0]) +
            (split[1][split[1].length - 2] == "p" &&
            course.raw_start_time !== 12
              ? 12
              : 0)) *
            60 +
          parseInt(split[1].slice(0, 2));
        split = course.end_time.split(":");
        course.raw_end_time = parseInt(split[0]);
        course.raw_end_time =
          (parseInt(split[0]) +
            (split[1][split[1].length - 2] == "p" && course.raw_end_time !== 12
              ? 12
              : 0)) *
            60 +
          parseInt(split[1].slice(0, 2));
      } else {
        course.raw_start_time = null;
        course.raw_end_time = null;
      }
      // Add to the terms
      termSplit[course.term][day].push(course);
    }
    // Sort by end time
    for (let day of course.days) {
      termSplit[course.term][day].sort(
        (a, b) => a.raw_end_time - b.raw_end_time
      );
    }
  }
  console.log("Preformatted:", termSplit);
  // Divide into groups; iterate by term first
  // Iterate by term
  for (let term of terms) {
    // Iterate by day
    for (let day of ["Su", "M", "T", "W", "Th", "F", "Sa"]) {
      let groups = [];
      let courseCount = 0;
      let totalCourses = termSplit[term][day].length;
      // Iterate until there are no items left
      while (courseCount < totalCourses) {
        // Add new group
        groups.push([]);
        let usedCourses = new Set();
        let end = -1;

        // Schedule most courses possible
        for (let course of termSplit[term][day]) {
          if (end <= course.raw_start_time) {
            end = course.raw_end_time;
            groups[groups.length - 1].push(course);
            usedCourses.add(course.uuid);
            courseCount++;
            console.log("Scheduled", course.class_tag);
          }
        }

        // Removed scheduled courses
        termSplit[term][day] = termSplit[term][day].filter(
          (course) => !usedCourses.has(course.uuid)
        );
      }
      termSplit[term][day] = groups;
    }
  }

  console.log("Formatted courses:", termSplit);
  return termSplit;
}

export default function ScheduleMatrix({ terms, starredCourses }) {
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
  const [courses, setCourses] = useState([]);
  const [selectedTerm, setSelectedTerm] = useState(
    terms !== null && terms !== undefined && terms.length ? terms[0] : null
  );
  const dayColWidthRef = useRef(null);
  const [dayColWidth, setDayColWidth] = useState(0);
  const [formattedCourses, setFormattedCourses] = useState([]);

  useEffect(() => {
    function handleCalendarResize() {
      console.log("RESIZE WIDTH:", dayColWidthRef.current.offsetWidth);
      setDayColWidth(dayColWidthRef.current.offsetWidth);
    }
    window.addEventListener("resize", handleCalendarResize);
    console.log("Added event listener");
    return () => {
      console.log("Removed event listener");
      window.removeEventListener("resize", handleCalendarResize);
    };
  }, []);

  useLayoutEffect(() => {
    console.log("LAYOUT WIDTH:", dayColWidthRef.current.offsetWidth);
    setDayColWidth(dayColWidthRef.current.offsetWidth);
  }, []);

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
    console.log("COURSES:", courses);
    setFormattedCourses(formatCourses({ terms: terms, courses: courses }));
    // formatCourses({ terms: terms, courses: courses });
  }, [courses]);

  useEffect(() => {
    console.log("FORMAT:", formattedCourses);
  }, [formattedCourses]);

  useEffect(() => {
    console.log(starredCourses);

    setCourses(
      Object.values(starredCourses).map((item) => ({
        class_name: item.class_name,
        class_tag: item.class_tag,
        days: item.days,
        start_time: item.start_time,
        end_time: item.end_time,
        term: item.term,
        uuid: item.uuid,
      }))
    );
  }, [starredCourses]);

  return (
    <div className="flex flex-col h-full items-start gap-4">
      {/* Filter */}
      <Dropdown
        datasource={terms}
        handler={(_, newTerm) => setSelectedTerm(newTerm)}
        tag="term"
        single
      />
      {/* Calendar */}
      <div className="flex flex-row max-w-full max-h-full border border-slate-200 overflow-clip rounded-lg text-zinc-700">
        {/* First column */}
        <table className="h-full table-fixed bg-white rounded-lg">
          {/* Days header */}
          <thead className="divide-slate-100 divide-x bg-slate-100">
            <th className="py-2 font-medium text-sm border-b border-b-slate-100">
              &nbsp;
            </th>
          </thead>
          {/* Times */}
          {timeLabels
            .filter((_, idx) => !(idx % 2))
            .map((time, key) => (
              <tr
                key={key}
                className={`divide-slate-100 divide-x ${
                  time === "" ? "h-6" : "h-12"
                }`}
              >
                <td className="pl-4 pr-2 py-2 font-light text-xs text-end text-slate-400">
                  {time}
                </td>
              </tr>
            ))}
        </table>

        {/* Main calendar content */}
        <table className="w-full h-full table-fixed bg-white rounded-lg divide-y divide-slate-100 border-l border-l-slate-100 overflow-x-scroll">
          {/* Days header */}
          <thead className=" divide-slate-100 divide-x bg-slate-100">
            {dayHeaders.map((day, idx) => (
              <th
                key={idx}
                style={{ minWidth: "4.5rem" }}
                className=" py-2 font-medium text-sm"
              >
                {dayHeaderMap[day]}
              </th>
            ))}
          </thead>
          {/* Times */}
          {timeLabels.map((time, key) => (
            <tr key={key} className="divide-slate-100 divide-x">
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
                        : formattedCourses[selectedTerm][day].map(
                            (group, groupIdx) =>
                              group.map((course, courseIdx) => (
                                // Course
                                <div
                                  key={groupIdx * group.length + courseIdx}
                                  className={`absolute text-xs break-words font-semibold rounded-sm overflow-y-auto no-scrollbar ${course.color.border} ${course.color.bg} ${course.color.text}`}
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
                                      dayColWidth /
                                      formattedCourses[selectedTerm][day].length
                                    }px`,
                                    left: `${
                                      (groupIdx * dayColWidth) /
                                      formattedCourses[selectedTerm][day].length
                                    }px`,
                                  }}
                                >
                                  <div className="flex flex-col">
                                    <div>{course.class_tag}</div>
                                    <div className="font-normal">
                                      {course.start_time} - {course.end_time}
                                    </div>
                                  </div>
                                </div>
                              ))
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
        </table>
      </div>
    </div>
  );
}

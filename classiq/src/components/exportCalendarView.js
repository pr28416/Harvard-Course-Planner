import { Dialog, Transition } from "@headlessui/react";
import {
  AccessTime,
  Close,
  EventAvailable,
  RemoveCircle,
  RemoveCircleOutline,
  SchoolRounded,
} from "@mui/icons-material";
import React, { Fragment, useEffect, useState } from "react";
import WeekBar from "./weekBar";
import { Alert } from "@mui/material";
import { saveAs } from "file-saver";

export default function ExportCalendarView({ courses, isOpen, setOpen }) {
  const [myCourses, setMyCourses] = useState([]);
  const [exportFailed, setExportFailed] = useState(false);

  useEffect(() => {
    setMyCourses([...courses].map((course) => ({ ...course, selected: true })));
  }, [courses]);

  const exportToICal = () => {
    const exp = async () => {
      await fetch("/api/download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courses: myCourses.filter((course) => course.selected),
        }),
      }).then(async (res) => {
        if (res.status !== 200) {
          setExportFailed(true);
        } else {
          const json = await res.json();
          const blob = new Blob([json.value], {
            type: "text/calendar;charset=utf-8",
          });
          const calendarElem = document.createElement("a");
          const url = URL.createObjectURL(blob);
          calendarElem.href = url;
          calendarElem.download = "calendar.ics";
          document.body.appendChild(calendarElem);
          calendarElem.click();
          setTimeout(() => {
            document.body.removeChild(calendarElem);
            window.URL.revokeObjectURL(url);
          }, 0);
          // saveAs(blob, "calendar.ics");
          setExportFailed(false);
        }
      });
    };
    exp();
  };

  /* Dialog */
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={() => setOpen(false)}>
        {/* Dimming background */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div
            className="fixed inset-0 bg-black bg-opacity-25"
            onClick={(e) => e.stopPropagation()}
          />
        </Transition.Child>

        {/* Content */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              {/* Panel */}
              <Dialog.Panel className="flex flex-col gap-2 w-full max-w-xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                {/* Panel title */}
                <Dialog.Title>
                  <div className="flex flex-row justify-between items-start gap-4">
                    <div className="text-zinc-900 text-xl sm:text-2xl font-extrabold flex flex-row gap-2 items-center">
                      Export classes
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpen(false);
                      }}
                    >
                      <Close className="text-zinc-700" />
                    </button>
                  </div>
                </Dialog.Title>

                {/* Panel content */}
                <div className="flex flex-col gap-3 text-sm text-zinc-700">
                  The following classes will be exported. Unselect the courses
                  that you do not want to export:
                  <div className="grid grid-cols-1 sm:grid-cols-2 flex-row gap-2 flex-wrap text-zinc-950">
                    {myCourses.map((course, idx) => (
                      // Course view
                      <div
                        key={idx}
                        className={`cursor-pointer flex flex-col gap-1 border border-zinc-200 rounded-lg p-3 ${
                          course.selected ? "" : "bg-zinc-200 text-zinc-500"
                        }`}
                        onClick={() =>
                          setMyCourses((old) => {
                            return old.map((c) => {
                              if (c.uuid === course.uuid) {
                                return { ...c, selected: !c.selected };
                              } else {
                                return c;
                              }
                            });
                          })
                        }
                      >
                        {/* Title, unselect */}
                        <div className="flex flex-row justify-between gap-2 items-start">
                          <div className="font-bold">{course.class_name}</div>
                          <div>
                            {course.selected ? (
                              <RemoveCircleOutline
                                fontSize="small"
                                className="text-zinc-700"
                              />
                            ) : (
                              <RemoveCircle
                                fontSize="small"
                                className="text-zinc-700"
                              />
                            )}
                          </div>
                        </div>
                        {/* Course tag */}
                        <div className="text-xs text-zinc-500">
                          {course.class_tag}
                        </div>
                        {/* Other details */}
                        <div className="flex flex-col gap-2 mt-1 items-start">
                          {/* Class time */}
                          {course.days === null ? null : (
                            <WeekBar minimal days={course.days} />
                          )}
                          {/* Course instructors + time */}
                          <div className="flex flex-col flex-wrap items-start gap-2 text-xs">
                            {/* Course instructors */}
                            {course.instructors !== null ? (
                              <div className="flex flex-row gap-2 items-center">
                                <SchoolRounded
                                  fontSize="small"
                                  className="text-zinc-700"
                                />

                                <div className="text-zinc-600">
                                  {course.instructors.join(", ")}
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-row gap-2 items-center">
                                <SchoolRounded
                                  fontSize="small"
                                  className="text-zinc-300"
                                />

                                <div className="text-zinc-300">
                                  No instructors
                                </div>
                              </div>
                            )}
                            {/* Course times */}
                            {course.start_time !== null &&
                            course.end_time !== null ? (
                              <div className="flex flex-row gap-2 items-center">
                                <AccessTime
                                  fontSize="small"
                                  className="text-zinc-700"
                                />
                                <div className="text-zinc-600">
                                  {course.start_time} - {course.end_time}
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-row gap-2 items-center">
                                <AccessTime
                                  fontSize="small"
                                  className="text-zinc-300"
                                />
                                <div className="text-zinc-300 italic">
                                  No times
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Export panel */}
                  {exportFailed ? (
                    <Alert severity="error">
                      There was an issue exporting. Please remove courses and
                      retry or contact the developer.
                    </Alert>
                  ) : null}
                  <div className="flex flex-row w-full sm:justify-end">
                    {myCourses.reduce((p, c) => p || c.selected, false) ? (
                      <button
                        className="flex flex-row items-center justify-center gap-2 text-zinc-100 w-full sm:w-auto font-semibold bg-red-500 px-3 py-2 rounded-lg"
                        onClick={() => exportToICal()}
                      >
                        <EventAvailable />
                        Export to iCal
                      </button>
                    ) : (
                      <button
                        disabled={true}
                        className="flex flex-row items-center justify-center gap-2 text-zinc-400 w-full sm:w-auto font-semibold bg-zinc-100 px-3 py-2 rounded-lg"
                      >
                        <EventAvailable />
                        Select at least one course
                      </button>
                    )}
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

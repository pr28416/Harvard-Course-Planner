import { Dialog, Transition } from "@headlessui/react";
import {
  AccessTime,
  AccountBalanceOutlined,
  Assessment,
  BookOutlined,
  Close,
  InfoOutlined,
  SchoolRounded,
} from "@mui/icons-material";
import React, { Fragment, useState } from "react";
import WeekBar from "./weekBar";
import Link from "next/link";

export default function DescriptionView({ course, isOpen, setOpen }) {
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
              <Dialog.Panel className="flex flex-col gap-2 w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                {/* Panel title */}
                <Dialog.Title>
                  <div className="flex flex-row justify-between items-start gap-4">
                    <div className="flex flex-col gap-0">
                      <div className="text-xs text-zinc-600 font-medium">
                        {course.class_tag}
                      </div>
                      <div className="text-zinc-900 font-bold">
                        {course.class_name}
                      </div>
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
                <div className="flex flex-col gap-2">
                  <div className="flex flex-col gap-2 md:flex-row justify-between items-start">
                    {/* Course instructors, time */}
                    <div className="flex flex-col gap-2">
                      {/* Course instructors */}
                      <div className="flex flex-row flex-wrap items-center gap-2 text-xs">
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

                            <div className="text-zinc-300">No instructors</div>
                          </div>
                        )}
                      </div>
                      {/* Course time */}
                      <div className="flex flex-row flex-wrap items-center gap-2 text-xs">
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
                            <div className="text-zinc-300 italic">No times</div>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Weekbar */}
                    {course.days === null ? null : (
                      <WeekBar days={course.days} />
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-sm mt-2 text-zinc-800">
                    {course.description}
                  </p>

                  {/* More details */}
                  <div className="flex flex-row items-end justify-between gap-4 flex-wrap mt-4 w-full">
                    {/* School, subject */}
                    <div className="flex flex-col gap-2">
                      {course.school === null ? null : (
                        <div className="flex flex-row gap-2 items-center text-zinc-600 text-xs">
                          <AccountBalanceOutlined
                            fontSize="small"
                            className="text-zinc-700"
                          />
                          {course.school}
                        </div>
                      )}
                      {course.subject === null ? null : (
                        <div className="flex flex-row gap-2 items-center text-zinc-600 text-xs">
                          <BookOutlined
                            fontSize="small"
                            className="text-zinc-700"
                          />
                          {course.subject}
                        </div>
                      )}
                    </div>
                    <div className="grow flex flex-row justify-end">
                      <Link
                        href={
                          course.q_report !== null
                            ? course.q_report
                            : `https://qreports.fas.harvard.edu/search/courses?search=${course.class_tag}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-row items-center gap-2 text-zinc-100 font-semibold text-sm bg-red-500 px-3 py-2 rounded-lg"
                      >
                        <Assessment
                          fontSize="small"
                          className="text-zinc-100"
                        />
                        View Q Report
                      </Link>
                    </div>
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

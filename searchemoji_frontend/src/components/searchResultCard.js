import Link from "next/link";
import WeekBar from "./weekBar";
import {
  AccessTime,
  Assessment,
  SchoolRounded,
  Star,
  StarBorder,
} from "@mui/icons-material";
import { Button, IconButton } from "@mui/material";
import { useState } from "react";

const ClassNameView = ({ class_name, style }) => (
  <div className={`font-bold ${style}`}>{class_name}</div>
);

const ClassTagView = ({ class_tag, style }) => (
  <div
    className={`rounded-md bg-slate-200 font-bold text-xs px-2 py-1 shrink-0 ${style}`}
  >
    {class_tag}
  </div>
);

const StarView = ({ starred, handler, style, uuid }) => (
  <button className={`${style}`} onClick={() => handler(uuid)}>
    {starred ? <Star className="text-orange-500" /> : <StarBorder />}
  </button>
);

export default function SearchResultCard({
  class_name,
  class_tag,
  instructors,
  term,
  days,
  description,
  start_time,
  end_time,
  q_report,
  starred,
  handler,
  uuid,
}) {
  // console.log(instructors);
  const parsedInstructors = instructors === null ? null : instructors;

  // .slice(1, instructors.length - 1)
  // .split(",")
  // .join(", ");
  return (
    <div className="flex flex-col gap-4 text-slate-800">
      {/* Header */}
      <div className="flex flex-row items-start justify-between gap-4">
        <div className="flex flex-row gap-2 items-start">
          <StarView starred={starred} uuid={uuid} handler={handler} />
          <ClassTagView class_tag={class_tag} />
          <ClassNameView class_name={class_name} />
        </div>
        <div className="flex flex-row gap-4 items-center">
          <div className="text-xs font-medium shrink-0">{term}</div>
          {days === null ? null : (
            <WeekBar days={days} start_time={start_time} end_time={end_time} />
          )}
        </div>
      </div>
      {/* Instructors */}
      <div className="flex flex-row flex-wrap gap-4 items-center">
        {start_time === null || end_time === null ? null : (
          <div className="flex flex-row text-xs font-medium gap-2 items-center">
            <AccessTime />
            {start_time} - {end_time}
          </div>
        )}
        {instructors === null ? null : (
          <div className="flex flex-row text-xs font-medium gap-2 items-center">
            <SchoolRounded />
            {instructors.join(", ")}
          </div>
        )}
        {q_report === null ? null : (
          <div className="flex flex-row text-xs font-medium gap-2 items-center">
            <Assessment />
            <Link href={q_report} target="_blank" rel="noopener noreferrer">
              View Q Report
            </Link>
          </div>
        )}
      </div>
      {/* Description */}
      <div className="text-slate-600 text-sm">{description}</div>
    </div>
  );
}

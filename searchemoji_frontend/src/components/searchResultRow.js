import React from "react";
import WeekBar from "./weekBar";
import StarButton from "./starButton";

export default function SearchResultRow({ result, handler, starred }) {
  return (
    <tr>
      {/* Course */}
      <td className="py-3 flex flex-row gap-4">
        <StarButton starred={starred} uuid={result.uuid} handler={handler} />
        <div className="flex flex-col mr-8">
          <div className="text-xs font-medium text-zinc-500">
            {result.class_tag}
          </div>
          <div className="font-bold text-zinc-800">{result.class_name}</div>
        </div>
      </td>

      {/* Instructors */}
      <td className="py-2 text-sm">
        {result.instructors !== null ? (
          <div className="mr-8 text-zinc-500">
            {result.instructors.join(", ")}
          </div>
        ) : (
          <div className="mr-8 text-sm italic text-zinc-300">None</div>
        )}
      </td>

      {/* Term */}
      <td className="py-2 text-sm text-zinc-500">
        <div className="mr-8">{result.term}</div>
      </td>

      {/* Time */}
      <td className="py-2 text-sm text-zinc-500">
        <div className="flex flex-col gap-1 items-center justify-center mr-8">
          {result.days === null ? null : <WeekBar days={result.days} />}
          {result.start_time && result.end_time ? (
            <div>
              {result.start_time} - {result.end_time}
            </div>
          ) : (
            <div className="italic text-zinc-300">None</div>
          )}
        </div>
      </td>
    </tr>
  );
}

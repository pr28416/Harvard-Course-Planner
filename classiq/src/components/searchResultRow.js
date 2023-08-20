import React from "react";
import WeekBar from "./weekBar";
import StarButton from "./starButton";
import { AccessTime, SchoolRounded } from "@mui/icons-material";
import InfoButton from "./infoButton";
import results from "./results";

export default function SearchResultRow({ result, handler, starred }) {
  return (
    <tr>
      {/* Course */}
      <td className="py-3 flex flex-row gap-4">
        <StarButton starred={starred} result={result} handler={handler} />
        <div className="flex flex-col md:mr-8 gap-1 md:gap-0 w-full">
          <div className="flex flex-row w-full justify-between items-center">
            <div className="md:bg-transparent text-xs font-bold md:font-medium text-zinc-600">
              {result.class_tag}
            </div>
            {/* Mobile: Days */}
            <div className="md:hidden">
              {result.days === null ? null : (
                <WeekBar minimal days={result.days} />
              )}
            </div>
          </div>
          <div className="font-bold text-zinc-900">{result.class_name}</div>
          <div className="md:hidden flex flex-row gap-4 items-end w-full">
            <div className="md:hidden flex flex-row flex-wrap w-full items-center gap-2 text-xs">
              {/* Mobile: Instructors */}
              {result.instructors !== null &&
              result.instructors !== undefined ? (
                <div className="flex flex-row gap-2 items-center">
                  <SchoolRounded fontSize="small" className="text-zinc-700" />
                  {/* {console.log("TYPE", typeof result.instructors)} */}
                  <div className="text-zinc-600">
                    {result.instructors.join(", ")}
                  </div>
                </div>
              ) : (
                <div className="flex flex-row gap-2 items-center">
                  <SchoolRounded fontSize="small" className="text-zinc-300" />

                  <div className="text-zinc-300">No instructors</div>
                </div>
              )}

              {/* Mobile: Times */}
              {result.start_time !== null && result.end_time !== null ? (
                <div className="flex flex-row gap-2 items-center">
                  <AccessTime fontSize="small" className="text-zinc-700" />
                  <div className="text-zinc-600">
                    {result.start_time} - {result.end_time}
                  </div>
                </div>
              ) : (
                <div className="flex flex-row gap-2 items-center">
                  <AccessTime fontSize="small" className="text-zinc-300" />
                  <div className="text-zinc-300 italic">No times</div>
                </div>
              )}
            </div>
            <div className="md:hidden">
              <InfoButton course={result} />
            </div>
          </div>
        </div>
      </td>

      {/* Instructors */}
      <td className="py-2 text-sm hidden md:table-cell">
        {result.instructors !== null ? (
          <div className="mr-8 text-zinc-500">
            {result.instructors.join(", ")}
          </div>
        ) : (
          <div className="mr-8 text-sm italic text-zinc-300">None</div>
        )}
      </td>

      {/* Term */}
      <td className="hidden xl:table-cell h-full py-2 text-sm text-zinc-500">
        <div className="mr-8 h-full flex">{result.term}</div>
      </td>

      {/* Time */}
      <td className="py-2 text-sm text-zinc-500 hidden md:table-cell">
        <div className="flex flex-col mr-8 gap-1 items-center justify-center">
          <div className="xl:hidden">{result.term}</div>
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

      <td className="hidden md:table-cell">
        <InfoButton course={result} />
      </td>
    </tr>
  );
}

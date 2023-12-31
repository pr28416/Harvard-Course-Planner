import React from "react";
import WeekBar from "./weekBar";
import StarButton from "./starButton";
import {
  AccessTime,
  EmojiEvents,
  Info,
  InfoOutlined,
  SchoolRounded,
  Today,
  TodayRounded,
} from "@mui/icons-material";
import InfoButton from "./infoButton";
import { Q_MeanHoursView, Q_OverallScoreFASMeanView } from "./qGuideLabels";

export default function SearchResultRow({
  result,
  handler,
  starred,
  setDescriptionViewCourse,
  setDescriptionViewOpen,
}) {
  return (
    <tr
      className="hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:cursor-pointer"
      onClick={() => handler(result.uuid, result)}
      title={`${starred ? "Remove from" : "Add to"} starred courses`}
    >
      {/* Course */}
      <td className="py-3 flex flex-row gap-4">
        <StarButton starred={starred} result={result} handler={handler} />
        <div className="flex flex-col md:mr-8 gap-1 md:gap-0 w-full">
          <div className="flex flex-row w-full justify-between items-center gap-4">
            {/* Class tag, Q-guide rating */}
            <div className="flex flex-row flex-wrap items-center gap-2">
              {/* Class tag */}
              <div className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                {result.class_tag}
              </div>
            </div>
            {/* Mobile: Days */}
            <div className="md:hidden">
              {result.days === null ? null : (
                <WeekBar minimal days={result.days} />
              )}
            </div>
          </div>

          {/* Class name */}
          <div className="font-bold text-zinc-900 dark:text-zinc-50 text-start">
            {result.class_name}
            {result.topic ? `: ${result.topic}` : ""}
          </div>

          {result["Overall score Course Mean"] || result.mean_hours ? (
            <div className="flex flex-row flex-wrap items-center gap-1 md:mt-2 mb-1 md:mb-0">
              <Q_OverallScoreFASMeanView result={result} />
              <Q_MeanHoursView result={result} />
            </div>
          ) : null}

          {/* Mobile */}
          <div className="md:hidden flex flex-row gap-4 items-end w-full">
            <div className="md:hidden flex flex-row flex-wrap w-full items-center gap-2 text-xs">
              {/* Mobile: Instructors */}
              {result.instructors !== null &&
              result.instructors !== undefined ? (
                <div className="flex flex-row gap-2 items-center">
                  <SchoolRounded
                    fontSize="small"
                    className="text-zinc-700 dark:text-zinc-400"
                  />
                  {/* {console.log("TYPE", typeof result.instructors)} */}
                  <div className="text-zinc-600 dark:text-zinc-400">
                    {result.instructors.join(", ")}
                  </div>
                </div>
              ) : (
                <div className="flex flex-row gap-2 items-center">
                  <SchoolRounded
                    fontSize="small"
                    className="text-zinc-300 dark:text-zinc-600"
                  />

                  <div className="text-zinc-300 dark:text-zinc-600 italic">
                    No instructors
                  </div>
                </div>
              )}

              {/* Mobile: Times */}
              {result.start_time !== null && result.end_time !== null ? (
                <div className="flex flex-row gap-2 items-center">
                  <AccessTime
                    fontSize="small"
                    className="text-zinc-700 dark:text-zinc-400"
                  />
                  <div className="text-zinc-600 dark:text-zinc-400">
                    {result.start_time} - {result.end_time}
                  </div>
                </div>
              ) : (
                <div className="flex flex-row gap-2 items-center">
                  <AccessTime
                    fontSize="small"
                    className="text-zinc-300 dark:text-zinc-600"
                  />
                  <div className="text-zinc-300 dark:text-zinc-600 italic">
                    No times
                  </div>
                </div>
              )}

              {/* Mobile: Term */}
              <div className="flex flex-row gap-2 items-center">
                <Today
                  fontSize="small"
                  className="text-zinc-700 dark:text-zinc-400"
                />
                <div className="text-zinc-600 dark:text-zinc-400">
                  {result.term}
                </div>
              </div>
            </div>
            <div className="md:hidden">
              <InfoButton
                course={result}
                setDescriptionViewCourse={setDescriptionViewCourse}
                setDescriptionViewOpen={setDescriptionViewOpen}
              />
            </div>
          </div>
        </div>
      </td>

      {/* Instructors */}
      <td className="py-2 text-sm hidden md:table-cell">
        {result.instructors ? (
          <div className="mr-8 text-zinc-500 dark:text-zinc-300">
            {result.instructors.join(", ")}
          </div>
        ) : (
          <div className="mr-8 text-sm italic text-zinc-300 dark:text-zinc-600">
            None
          </div>
        )}
      </td>

      {/* Term */}
      <td className="hidden xl:table-cell h-full py-2 text-sm text-zinc-500 dark:text-zinc-300">
        <div className="mr-8 h-full flex">{result.term}</div>
      </td>

      {/* Time */}
      <td className="py-2 text-sm text-zinc-500 dark:text-zinc-300 hidden md:table-cell">
        <div className="flex flex-col mr-8 gap-1 items-center justify-center">
          <div className="xl:hidden">{result.term}</div>
          {result.days === null ? null : <WeekBar days={result.days} />}
          {result.start_time && result.end_time ? (
            <div>
              {result.start_time} - {result.end_time}
            </div>
          ) : (
            <div className="italic text-zinc-300 dark:text-zinc-600">None</div>
          )}
        </div>
      </td>

      {/* Q-guide rating */}
      {/* <td className="py-2 text-sm hidden xl:table-cell">
        <div className="flex flex-col gap-1 items-center">
          <Q_OverallScoreFASMeanView result={result} />
          <Q_MeanHoursView result={result} />
        </div>
      </td> */}

      {/* Info button */}
      <td className="hidden md:table-cell">
        <InfoButton
          course={result}
          setDescriptionViewCourse={setDescriptionViewCourse}
          setDescriptionViewOpen={setDescriptionViewOpen}
        />
      </td>
    </tr>
  );
}

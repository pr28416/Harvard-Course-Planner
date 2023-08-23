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

function Q_OverallScoreFASMeanView({ result, forMobile }) {
  const score = result["Overall score Course Mean"];
  if (score) {
    return (
      <div
        className={`${
          // forMobile ? "flex xl:hidden" : "hidden xl:flex"
          "flex"
        } flex flex-row gap-1 p-1 items-center ${
          score < 1.5
            ? "text-red-700 bg-red-50"
            : score < 2.5
            ? "text-orange-600 bg-orange-50"
            : score < 3.5
            ? "text-yellow-600 bg-yellow-50"
            : score < 4.5
            ? "text-emerald-600 bg-emerald-50"
            : "text-blue-600 bg-blue-50"
        } font-semibold rounded-md text-xs`}
      >
        <EmojiEvents fontSize="small" />
        <div className="flex flex-row items-end">
          <div>{score}</div>
          <div className="font-normal">&nbsp;/ 5.00</div>
        </div>
      </div>
    );
  } else {
    return null;
  }
}

function Q_MeanHoursView({ result, forMobile }) {
  const score = result.mean_hours;
  if (score) {
    return (
      <div
        className={`${
          // forMobile ? "flex xl:hidden" : "hidden xl:flex"
          "flex"
        } flex-row gap-1 p-1 items-center ${
          score > 24
            ? "text-zinc-700 bg-zinc-100"
            : score > 19
            ? "text-red-700 bg-red-50"
            : score > 14
            ? "text-orange-600 bg-orange-50"
            : score > 9
            ? "text-yellow-600 bg-yellow-50"
            : score > 4
            ? "text-emerald-600 bg-emerald-50"
            : "text-blue-600 bg-blue-50"
        } font-semibold rounded-md text-xs`}
      >
        <AccessTime fontSize="small" />
        <div className="flex flex-row items-end">
          <div>{score}</div>
          <div className="font-normal">&nbsp;hrs/week</div>
        </div>
      </div>
    );
  } else {
    return null;
  }
}

export default function SearchResultRow({ result, handler, starred }) {
  return (
    <tr
      className="hover:bg-zinc-50 hover:cursor-pointer"
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
              <div className="text-xs font-medium text-zinc-600">
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
          <div className="font-bold text-zinc-900 text-start">
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

              {/* Mobile: Term */}
              <div className="flex flex-row gap-2 items-center">
                <Today fontSize="small" className="text-zinc-700" />
                <div className="text-zinc-600">{result.term}</div>
              </div>
            </div>
            <div className="md:hidden">
              <InfoButton course={result} />
            </div>
          </div>
        </div>
      </td>

      {/* Instructors */}
      <td className="py-2 text-sm hidden md:table-cell">
        {result.instructors ? (
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

      {/* Q-guide rating */}
      {/* <td className="py-2 text-sm hidden xl:table-cell">
        <div className="flex flex-col gap-1 items-center">
          <Q_OverallScoreFASMeanView result={result} />
          <Q_MeanHoursView result={result} />
        </div>
      </td> */}

      {/* Info button */}
      <td className="hidden md:table-cell">
        <InfoButton course={result} />
      </td>
    </tr>
  );
}

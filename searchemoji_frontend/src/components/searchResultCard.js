import WeekBar from "./weekBar";
import { SchoolRounded } from "@mui/icons-material";

export default function SearchResultCard({
  class_name,
  class_tag,
  instructors,
  term,
  days,
  description,
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
          <div className="rounded-md bg-slate-200 font-bold text-sm px-2 py-1 shrink-0">
            {class_tag}
          </div>
          <div className="text-lg font-bold">{class_name}</div>
        </div>
        <div className="flex flex-row gap-4 items-center">
          <div className="text-sm font-medium shrink-0">{term}</div>
          {days === null ? null : <WeekBar days={days} />}
        </div>
      </div>
      {/* Instructors */}
      <div className="flex flex-row text-sm font-medium gap-2 items-center">
        <SchoolRounded />
        {parsedInstructors}
      </div>
      {/* Description */}
      <div className="text-slate-600">{description}</div>
    </div>
  );
}

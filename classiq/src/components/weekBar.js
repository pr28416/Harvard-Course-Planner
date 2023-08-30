import React, { use, useEffect, useState } from "react";

export default function WeekBar({
  days,
  minimal,
  handler,
  selectable = false,
}) {
  const [selected, setSelected] = useState(days);

  useEffect(() => {
    if (selectable && handler) handler("days", selected);
  }, [selected]);

  const handleDaySelected = (day) => {
    if (selected.includes(day)) {
      setSelected(selected.filter((d) => d != day));
    } else {
      setSelected([...selected, day]);
    }
  };
  // console.log(days, typeof days);
  return selectable ? (
    <div className="flex flex-col gap-1 items-center dark:text-zinc-500">
      <div className="flex flex-row divide-x divide-zinc-200 dark:divide-zinc-700 border border-zinc-200 dark:border-zinc-700 rounded-sm">
        {["Su", "M", "T", "W", "Th", "F", "Sa"].map((day, idx) => (
          <button
            disabled={!selectable}
            onClick={(e) => {
              e.stopPropagation();
              handleDaySelected(day);
            }}
            key={idx}
            className={`flex items-center justify-center w-6 h-6 text-xs ${
              selected.includes(day)
                ? "bg-red-600 text-white font-bold"
                : "font-semibold"
            }`}
          >
            {day}
          </button>
        ))}
      </div>
    </div>
  ) : !minimal ? (
    <div className="flex flex-col gap-1 items-center dark:text-zinc-500">
      <div className="flex flex-row divide-x divide-zinc-200 dark:divide-zinc-700 border border-zinc-200 dark:border-zinc-700 rounded-sm">
        {["Su", "M", "T", "W", "Th", "F", "Sa"].map((day, idx) => (
          <div
            key={idx}
            className={`flex items-center justify-center w-6 h-6 text-xs ${
              days.includes(day)
                ? "bg-red-600 text-white font-bold"
                : "font-semibold"
            }`}
          >
            {day}
          </div>
        ))}
      </div>
    </div>
  ) : (
    <div className="flex flex-col gap-1 items-center dark:text-zinc-500">
      <div className="flex flex-row divide-x divide-zinc-200 dark:divide-zinc-700 border border-zinc-200 dark:border-zinc-700 rounded-sm">
        {["Su", "M", "T", "W", "Th", "F", "Sa"].map((day, idx) => (
          <div
            key={idx}
            style={{ fontSize: "0.6rem", width: "1.1rem", height: "1.1rem" }}
            className={`flex text-center items-center justify-center ${
              selected.includes(day)
                ? "bg-red-600 text-white font-bold"
                : "font-semibold"
            }`}
          >
            {day}
          </div>
        ))}
      </div>
    </div>
  );
}

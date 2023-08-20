import React from "react";

export default function WeekBar({ days, minimal }) {
  // console.log(days, typeof days);
  return !minimal ? (
    <div className="flex flex-col gap-1 items-center">
      <div className="flex flex-row divide-x divide-zinc-200 border border-zinc-200 rounded-sm">
        {["Su", "M", "T", "W", "Th", "F", "Sa"].map((day, idx) => (
          <div
            key={idx}
            className={`flex items-center justify-center w-6 h-6 text-xs ${
              days.includes(day)
                ? "bg-zinc-700 text-white font-bold"
                : "font-semibold"
            }`}
          >
            {day}
          </div>
        ))}
      </div>
    </div>
  ) : (
    <div className="flex flex-col gap-1 items-center">
      <div className="flex flex-row divide-x divide-zinc-200 border border-zinc-200 rounded-sm">
        {["Su", "M", "T", "W", "Th", "F", "Sa"].map((day, idx) => (
          <div
            key={idx}
            style={{ fontSize: "0.6rem", width: "1.1rem", height: "1.1rem" }}
            className={`flex text-center items-center justify-center ${
              days.includes(day)
                ? "bg-zinc-700 text-white font-bold"
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

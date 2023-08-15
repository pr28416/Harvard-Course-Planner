import React from "react";

export default function WeekBar({ days }) {
  return (
    <div className="flex flex-row divide-x divide-slate-200 border border-slate-200 rounded-sm">
      {["Su", "M", "T", "W", "Th", "F", "Sa"].map((day, idx) => (
        <div
          key={idx}
          className={`flex items-center justify-center w-6 h-6 text-xs ${
            days.includes(day)
              ? "bg-orange-500 text-white font-bold"
              : "font-semibold"
          }`}
        >
          {day}
        </div>
      ))}
    </div>
  );
}

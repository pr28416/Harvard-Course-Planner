import { StarBorderRounded, StarRounded } from "@mui/icons-material";
import React from "react";

export default function StarButton({ starred, handler, result, full = false }) {
  return full ? (
    starred ? (
      <button
        className="focus:outline-none flex flex-row gap-1 px-3 py-2 items-center font-semibold rounded-lg text-sm bg-amber-100 dark:bg-amber-950"
        onClick={(e) => {
          e.stopPropagation();
          handler(result.uuid, result);
        }}
      >
        <StarRounded
          className="text-amber-500 dark:text-amber-400"
          fontSize="small"
        />
        <div className="text-amber-600 dark:text-amber-400">
          Unselect course
        </div>
      </button>
    ) : (
      <button
        className="focus:outline-none flex flex-row gap-1 px-3 py-2 items-center font-semibold rounded-lg text-sm bg-zinc-100 dark:bg-zinc-800"
        onClick={(e) => {
          e.stopPropagation();
          handler(result.uuid, result);
        }}
      >
        <StarBorderRounded fontSize="small" className="dark:text-zinc-100" />
        <div className="text-zinc-950 dark:text-zinc-100">Select course</div>
      </button>
    )
  ) : (
    <button
      className="focus:outline-none"
      onClick={(e) => {
        e.stopPropagation();
        handler(result.uuid, result);
      }}
    >
      {starred ? (
        <StarRounded className="text-amber-500" />
      ) : (
        <StarBorderRounded />
      )}
    </button>
  );
}

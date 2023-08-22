import { StarBorderRounded, StarRounded } from "@mui/icons-material";
import React from "react";

export default function StarButton({ starred, handler, result }) {
  return (
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

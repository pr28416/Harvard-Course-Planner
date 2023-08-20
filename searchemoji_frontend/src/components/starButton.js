import { StarBorderRounded, StarRounded } from "@mui/icons-material";
import React from "react";

export default function StarButton({ starred, handler, result }) {
  return (
    <button
      className="focus:outline-none"
      onClick={() => handler(result.uuid, result)}
    >
      {starred ? (
        <StarRounded className="text-zinc-900" />
      ) : (
        <StarBorderRounded />
      )}
    </button>
  );
}

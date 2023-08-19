import { StarBorderRounded, StarRounded } from "@mui/icons-material";
import React from "react";

export default function StarButton({ starred, handler, uuid }) {
  return (
    <button className="focus:outline-none" onClick={() => handler(uuid)}>
      {starred ? (
        <StarRounded className="text-orange-500" />
      ) : (
        <StarBorderRounded />
      )}
    </button>
  );
}

import { Dialog, Transition } from "@headlessui/react";
import {
  AccessTime,
  AccountBalanceOutlined,
  Assessment,
  BookOutlined,
  Close,
  InfoOutlined,
  SchoolRounded,
} from "@mui/icons-material";
import React, { Fragment, useState } from "react";
import WeekBar from "./weekBar";
import Link from "next/link";
import DescriptionView from "./descriptionView";

export default function InfoButton({
  course,
  starred,
  handler,
  setDescriptionViewCourse,
  setDescriptionViewOpen,
}) {
  // let [isOpen, setOpen] = useState(false);
  return (
    <div onClick={(e) => e.stopPropagation()}>
      {/* Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setDescriptionViewCourse(course);
          setDescriptionViewOpen(true);
          // handler(course.uuid, course);
        }}
        className="focus:outline-none"
      >
        <InfoOutlined className="text-zinc-700 dark:text-zinc-200" />
      </button>
      {/* <DescriptionView
        course={course}
        isOpen={isOpen}
        setOpen={setOpen}
        starred={starred}
        handler={handler}
      /> */}
    </div>
  );
}

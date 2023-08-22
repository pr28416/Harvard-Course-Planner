import { Listbox, Transition } from "@headlessui/react";
import { Check, KeyboardArrowDownRounded } from "@mui/icons-material";
import React, { Fragment, useState } from "react";
import Dropdown from "./dropdown";

export default function FilterPane({ term, school, subject, handler }) {
  return (
    <div className="flex flex-row flex-wrap gap-4 text-zinc-700 text-sm shrink-0 items-center">
      {/* Title */}
      {/* <div className="text-lg font-bold">Filters</div> */}
      {/* Select term */}
      {term === null || term === undefined ? null : (
        <div className="flex flex-row items-center gap-2">
          <div className="font-medium">Term</div>
          <Dropdown datasource={term.toSorted()} handler={handler} tag="term" />
        </div>
      )}
      {/* Select school */}
      {/* {school === null || school === undefined ? null : (
        <div className="flex flex-row items-center gap-2">
          <div className="font-medium">School</div>
          <Dropdown datasource={school} handler={handler} tag="school" />
        </div>
      )} */}
      {/* Select subject */}
      {subject === null || subject === undefined ? null : (
        <div className="flex flex-row items-center gap-2">
          <div className="font-medium">Subject</div>
          <Dropdown datasource={subject} handler={handler} tag="subject" />
        </div>
      )}
    </div>
  );
}

// { "name": "class_name", "type": "string" },
// { "name": "class_tag", "type": "string" },
// { "name": "instructors", "type": "string" },
// { "name": "term", "type": "string" },
// { "name": "session", "type": "string" },
// { "name": "start_date", "type": "string" },
// { "name": "end_date", "type": "string" },
// { "name": "days", "type": "string" },
// { "name": "start_time", "type": "string" },
// { "name": "end_time", "type": "string" },
// { "name": "class_number", "type": "integer" },
// { "name": "course_id", "type": "integer" },
// { "name": "consent", "type": "string" },
// { "name": "enrolled", "type": "string" },
// { "name": "description", "type": "string" },
// { "name": "q_report", "type": "string" },
// { "name": "school", "type": "string" },
// { "name": "department", "type": "string" },
// { "name": "subject", "type": "string" },
// { "name": "location", "type": "string" },
// { "name": "units", "type": "string" },
// { "name": "course_component", "type": "string" },
// { "name": "grading_basis", "type": "string" },
// { "name": "cross_reg", "type": "string" },
// { "name": "exam/final_deadline", "type": "string" },
// { "name": "class_capacity", "type": "string" },
// { "name": "joint_offerings", "type": "string" },
// { "name": "class_notes", "type": "string" },
// { "name": "course_notes", "type": "string" },
// { "name": "course_requirements", "type": "string" },
// { "name": "recommended_prep", "type": "string" },
// { "name": "waitlist", "type": "string" },
// { "name": "topic", "type": "string" },
// { "name": "uuid", "type": "string" }

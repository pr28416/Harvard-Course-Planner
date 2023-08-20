import { Listbox, Transition } from "@headlessui/react";
import { Check, KeyboardArrowDownRounded } from "@mui/icons-material";
import React, { Fragment, useState } from "react";

function Dropdown({ datasource, handler, tag }) {
  const [selectedData, setSelectedData] = useState([...datasource]);

  const handleSelect = (newTerm) => {
    setSelectedData(newTerm);
    handler(tag, newTerm);
  };

  return (
    <Listbox
      as="div"
      className="relative w-48"
      value={selectedData}
      onChange={handleSelect}
      multiple
    >
      <Listbox.Button className="flex flex-row items-center w-full rounded-lg bg-white pl-3 pr-2 py-1 text-left justify-between border border-zinc-200">
        {selectedData.length === datasource.length
          ? "All"
          : selectedData.length === 0
          ? "None"
          : "Multiple selected"}
        <KeyboardArrowDownRounded />
      </Listbox.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Listbox.Options className="absolute z-10 left-0 top-12 bg-white shadow-lg rounded-lg overflow-auto no-scrollbar w-full max-h-48">
          {/* Selected data */}
          <div className="flex flex-row items-center text-xs font-bold px-4 py-2 bg-slate-50 justify-between">
            Selected
            <button onClick={() => handleSelect([])} className="text-rose-500">
              Clear all
            </button>
          </div>
          {datasource
            .filter((data) => selectedData.includes(data))
            .map((data, idx) => (
              <Listbox.Option
                key={idx}
                value={data}
                className="flex flex-row items-center pl-4 py-2 hover:bg-orange-100 hover:text-orange-800 justify-between text-sm"
              >
                {data}
                <Check className="mr-4" fontSize="small" />
                {/* {selectedData.includes(data) ? (
                ) : null} */}
              </Listbox.Option>
            ))}
          {/* Unselected data */}
          <div className="flex flex-row items-center text-xs font-bold px-4 py-2 bg-zinc-50 justify-between">
            Unselected
            <button
              onClick={() => handleSelect([...datasource])}
              className="text-emerald-600"
            >
              Select all
            </button>
          </div>
          {datasource
            .filter((data) => !selectedData.includes(data))
            .map((data, idx) => (
              <Listbox.Option
                key={idx}
                value={data}
                className="flex flex-row items-center pl-4 py-2 hover:bg-orange-100 hover:text-orange-800 justify-between text-sm"
              >
                {data}
                {/* {selectedData.includes(data) ? (
                ) : null} */}
              </Listbox.Option>
            ))}
        </Listbox.Options>
      </Transition>
    </Listbox>
  );
}

export default function FilterPane({ term, school, subject, handler }) {
  return (
    <div className="flex flex-row flex-wrap gap-4 text-zinc-700 text-sm shrink-0 items-center">
      {/* Title */}
      {/* <div className="text-lg font-bold">Filters</div> */}
      {/* Select term */}
      {term === null || term === undefined ? null : (
        <div className="flex flex-row items-center gap-2">
          <div className="font-medium">Term</div>
          <Dropdown datasource={term} handler={handler} tag="term" />
        </div>
      )}
      {/* Select school */}
      {school === null || school === undefined ? null : (
        <div className="flex flex-row items-center gap-2">
          <div className="font-medium">School</div>
          <Dropdown datasource={school} handler={handler} tag="school" />
        </div>
      )}
      {/* Select subject */}
      {school === null || school === undefined ? null : (
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

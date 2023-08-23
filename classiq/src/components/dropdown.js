import { Combobox, Listbox, Transition } from "@headlessui/react";
import { Check, KeyboardArrowDownRounded } from "@mui/icons-material";
import React, { Fragment, useState } from "react";

export default function Dropdown({
  customLabel,
  single,
  datasource,
  handler,
  tag,
}) {
  const [selectedData, setSelectedData] = useState(
    single ? datasource[0] : [...datasource]
  );
  const [query, setQuery] = useState("");

  const handleSelect = (newTerm) => {
    setSelectedData(newTerm);
    handler(tag, newTerm);
  };

  return (
    <Listbox
      as="div"
      className="relative w-48 text-zinc-700 text-sm"
      value={selectedData}
      onChange={handleSelect}
      multiple={!single}
    >
      <Listbox.Button className="flex flex-row items-center w-full rounded-lg bg-white pl-3 pr-2 py-1 text-left justify-between border border-zinc-200">
        {single
          ? customLabel
            ? customLabel(selectedData)
            : selectedData
          : selectedData.length === datasource.length
          ? "All"
          : selectedData.length === 0
          ? "None"
          : selectedData.length === 1
          ? selectedData[0]
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
        {single ? (
          <Listbox.Options className="absolute z-10 left-0 top-12 bg-white shadow-lg rounded-lg overflow-auto no-scrollbar w-full max-h-48">
            {datasource.map((data, idx) => (
              <Listbox.Option
                key={idx}
                value={data}
                className="flex flex-row items-center pl-4 py-2 hover:bg-orange-100 hover:text-orange-800 justify-between text-sm"
              >
                {customLabel ? customLabel(data) : data}
                {selectedData.includes(data) ? (
                  <Check className="mr-4" fontSize="small" />
                ) : null}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        ) : (
          <Listbox.Options className="absolute z-10 left-0 top-12 bg-white shadow-lg rounded-lg overflow-auto no-scrollbar w-full max-h-48">
            {/* Selected data */}
            <div className="flex flex-row items-center text-xs font-bold px-4 py-2 bg-zinc-50 justify-between">
              Selected
              {single ? null : (
                <button
                  onClick={() => handleSelect([])}
                  className="text-rose-500"
                >
                  Clear all
                </button>
              )}
            </div>
            {datasource
              .filter((data) => selectedData.includes(data))
              .map((data, idx) => (
                <Listbox.Option
                  key={idx}
                  value={data}
                  className="flex flex-row items-center pl-4 py-2 hover:bg-orange-100 hover:text-orange-800 justify-between text-sm"
                >
                  {customLabel ? customLabel(data) : data}
                  <Check className="mr-4" fontSize="small" />
                  {/* {selectedData.includes(data) ? (
                ) : null} */}
                </Listbox.Option>
              ))}
            {/* Unselected data */}
            <div className="flex flex-row items-center text-xs font-bold px-4 py-2 bg-zinc-50 justify-between">
              Unselected
              {single ? null : (
                <button
                  onClick={() => handleSelect([...datasource])}
                  className="text-emerald-600"
                >
                  Select all
                </button>
              )}
            </div>
            {datasource
              .filter((data) => !selectedData.includes(data))
              .map((data, idx) => (
                <Listbox.Option
                  key={idx}
                  value={data}
                  className="flex flex-row items-center px-4 py-2 hover:bg-orange-100 hover:text-orange-800 justify-between text-sm"
                >
                  {customLabel ? customLabel(data) : data}
                  {/* {selectedData.includes(data) ? (
                ) : null} */}
                </Listbox.Option>
              ))}
          </Listbox.Options>
        )}
      </Transition>
    </Listbox>
  );
}

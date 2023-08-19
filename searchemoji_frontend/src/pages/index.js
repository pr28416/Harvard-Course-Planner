import FilterPane from "@/components/filterPane";
import results from "@/components/results";
import SearchResultCard from "@/components/searchResultCard";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import Fuse from "fuse.js";
import courses from "@/data/courses.js";
import useSWR from "swr";
import ScheduleMatrix from "@/components/scheduleMatrix";
import StarButton from "@/components/starButton";
import WeekBar from "@/components/weekBar";
import SearchResultRow from "@/components/searchResultRow";

export default function Home() {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [starredCourses, setStarredCourses] = useState([]);
  const [filters, setFilters] = useState([]);
  const [filterTags, setFilterTags] = useState([]);
  const [render, setRender] = useState(false);
  const [showFilter, setShowFilter] = useState(true);
  const [showScheduleMatrix, setShowScheduleMatrix] = useState(true);

  useEffect(() => {
    const getFilters = async () => {
      await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ request: "filters" }),
      })
        .then(async (res) => {
          setFilterTags(await res.json());
        })
        .catch((err) => {
          console.log(err);
          setShowFilter(false);
        });
      setRender(true);
    };

    getFilters();
  }, []);

  useEffect(() => {
    handleSearch();
  }, [query, filters]);

  const handleStarred = (uuid) => {
    // console.log("Reset");
    setStarredCourses((old) => {
      if (old.includes(uuid)) {
        return old.filter((id) => id !== uuid);
      } else {
        return [...old, uuid];
      }
    });
  };

  const handleSearch = async () => {
    if (query.length === 0) {
      setSearchResults([]);
      return;
    }

    // const data = new URLSearchParams();
    // data.append("query", query);
    // data.append("filters", filters);
    // console.log({ query: query, filters: filters });

    const response = await fetch("/api/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: query,
        filters: filters,
        request: "search",
      }),
    });
    const json = await response.json();
    // console.log(json);
    setSearchResults(json.items);
  };

  const handleFilter = (tag, items) => {
    // console.log(tag, items);
    setFilters((old) => {
      let mod = old.filter((item) => item.tag !== tag);
      mod.push({ tag: tag, items: items });
      return mod;
    });
  };

  return !render ? null : (
    <main className="flex flex-col min-h-screen items-center bg-white">
      {/* Top card */}
      <div className="flex flex-row gap-16 w-full rounded-2xl p-4">
        {/* Title */}
        <div className="flex flex-row gap-2 items-center">
          <Image
            alt="RemyNet logo"
            src="/remy.png"
            width="1024"
            height="1024"
            className="w-12 aspect-square"
          />
          <div className="flex flex-row text-3xl font-extrabold">
            <div className="text-orange-500">Remy</div>
            <div className="text-slate-700">Net</div>
          </div>
        </div>
        {/* Search bar */}
        <input
          className="p-4 bg-white border border-slate-200 placeholder:text-slate-500 rounded-lg w-full focus:outline-none"
          placeholder="Search course"
          onChange={(event) => setQuery(event.target.value)}
        />
        {/* Toggle schedule matrix */}
        <button
          className="shrink-0 font-semibold text-slate-700"
          onClick={() => setShowScheduleMatrix(!showScheduleMatrix)}
        >
          {showScheduleMatrix ? "Hide" : "Show"} schedule matrix
        </button>
      </div>

      {/* Main content */}
      <div
        className={`${
          searchResults.length ? "" : "hidden"
        } flex flex-row w-full justify-center`}
      >
        <table className="table table-auto divide-y-2 w-full mx-12">
          {/* Header */}
          <thead className="">
            <th className="text-start py-2">Course</th>
            <th className="text-start py-2">Instructors</th>
            <th className="text-start py-2">Term</th>
            <th className="text-start py-2">Time</th>
          </thead>
          <tbody className="divide-y">
            {/* Content */}
            {searchResults.map((result, idx) => (
              <SearchResultRow
                key={idx}
                result={result}
                handler={handleStarred}
                starred={starredCourses.includes(result.uuid)}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* OLD Main content */}
      <div className="flex flex-row grow w-full mt-8 h-full gap-8">
        {/* Filter panel and search results */}
        <div
          className={`flex flex-col gap-8 ${
            showScheduleMatrix ? "w-1/3" : "w-full"
          }`}
        >
          {/* Filter panel */}
          {showFilter ? (
            <FilterPane
              // term={["2023 Fall", "2024 Spring"]}
              {...filterTags}
              handler={handleFilter}
            />
          ) : null}
          {/* Search results */}
          <div className="flex flex-col gap-8 px-8 h-full mb-8">
            {searchResults.map((result, idx) => (
              <SearchResultCard
                key={idx}
                {...result}
                handler={handleStarred}
                starred={starredCourses.includes(result.uuid)}
              />
            ))}
          </div>
        </div>
        {/* Schedule matrix */}
        <div
          className={`flex flex-col ${
            showScheduleMatrix ? "w-2/3" : "hidden"
          } `}
        >
          <ScheduleMatrix
            starredCourses={starredCourses}
            terms={filterTags.term}
          />
        </div>
      </div>
    </main>
  );
}

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
import SearchResultTable from "@/components/searchResultTable";

export default function Home() {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [starredCourses, setStarredCourses] = useState({});
  const [filters, setFilters] = useState([]);
  const [filterTags, setFilterTags] = useState([]);
  const [render, setRender] = useState(false);
  const [showFilter, setShowFilter] = useState(true);
  const [showScheduleMatrix, setShowScheduleMatrix] = useState(false);

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

  const handleStarred = (uuid, course) => {
    // console.log("Reset");
    setStarredCourses((old) => {
      if (uuid in old) {
        return (({ [uuid]: _, ...obj }) => obj)(old);
      } else {
        return { ...old, [uuid]: course };
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
    <main className="flex flex-col min-h-screen items-center bg-white w-full">
      {/* Nav bar */}
      <div className="flex flex-col md:flex-row items-center gap-4 w-full pt-8 md:pt-4 pb-4 px-4 md:px-12">
        {/* Title */}
        <div className="text-3xl font-extrabold text-zinc-950">Classiq.</div>
        {/* Search bar */}
        <input
          className="p-4 bg-zinc-50 border border-zinc-200 placeholder:text-zinc-500 text-sm rounded-lg w-full focus:outline-none"
          placeholder="Search course"
          onChange={(event) => setQuery(event.target.value)}
        />
        {/* Toggle schedule matrix */}
        <button
          className="shrink-0 font-semibold text-zinc-700"
          onClick={() => setShowScheduleMatrix(!showScheduleMatrix)}
        >
          {showScheduleMatrix ? "Hide" : "Show"} schedule matrix
        </button>
      </div>

      {/* Main content */}
      <div className="flex flex-col-reverse lg:flex-row gap-4 lg:gap-12 px-4 md:px-12 w-full">
        {/* Search and starred */}
        <div className="flex flex-col w-full justify-center">
          {!showFilter ? null : (
            <FilterPane {...filterTags} handler={handleFilter} />
          )}
          {/* Starred */}
          {Object.keys(starredCourses).length === 0 ? null : (
            <div className="mt-8 mb-2 text-2xl font-extrabold text-zinc-900">
              Starred courses
            </div>
          )}

          {Object.keys(starredCourses).length === 0 ? null : (
            <SearchResultTable
              searchResults={Object.values(starredCourses)}
              starredCourses={starredCourses}
              handler={handleStarred}
            />
          )}

          {/* Search */}
          {searchResults.length === 0 ? null : (
            <div className="mt-8 mb-2 text-2xl font-extrabold text-zinc-900">
              Search results
            </div>
          )}

          {searchResults.length === 0 ? null : (
            <SearchResultTable
              searchResults={searchResults}
              starredCourses={starredCourses}
              handler={handleStarred}
            />
          )}
        </div>

        {/* Schedule matrix */}
        <div className={`${showScheduleMatrix ? "" : "hidden"} flex w-full`}>
          <ScheduleMatrix
            starredCourses={starredCourses}
            terms={filterTags.term}
          />
        </div>
      </div>
    </main>
  );
}

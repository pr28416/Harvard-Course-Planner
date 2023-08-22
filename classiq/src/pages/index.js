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
import {
  CalendarMonth,
  KeyboardArrowDown,
  KeyboardArrowUp,
} from "@mui/icons-material";
import { CircularProgress } from "@mui/material";

export default function Home() {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [starredCourses, setStarredCourses] = useState({});
  const [filters, setFilters] = useState([]);
  const [allTerms, setAllTerms] = useState([]);
  const [filterTags, setFilterTags] = useState([]);
  const [render, setRender] = useState(false);
  const [showFilter, setShowFilter] = useState(true);
  const [showScheduleMatrix, setShowScheduleMatrix] = useState(false);
  const [canPaginate, setCanPaginate] = useState(true);
  const [showStarredCourses, setShowStarredCourses] = useState(true);

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
          const json = await res.json();
          setAllTerms(json.term);
          setFilterTags(json);
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

  useEffect(() => {
    if (starredCourses.length === 0) {
      setShowStarredCourses(true);
    }
  }, [starredCourses]);

  const handleSearch = async () => {
    // if (query.length === 0) {
    //   setSearchResults([]);
    //   return;
    // }

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
        limit: 25,
      }),
    });
    const json = await response.json();
    // console.log(json);
    setSearchResults(json.items);
    setCanPaginate(json.canPaginate);
  };

  const handleLoadMoreResults = async () => {
    const response = await fetch("/api/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: query,
        filters: filters,
        request: "paginate",
        limit: 25,
        offset: searchResults.length,
      }),
    });
    const json = await response.json();
    // console.log(json);
    setSearchResults((old) => [...old, ...json.items]);
    setCanPaginate(json.canPaginate);
  };

  const handleFilter = (tag, items) => {
    // console.log(tag, items);
    setFilters((old) => {
      let mod = old.filter((item) => item.tag !== tag);
      mod.push({ tag: tag, items: items });
      return mod;
    });
  };

  return !render ? (
    <main className="flex flex-col h-screen items-center justify-center gap-12">
      <div className="text-5xl sm:text-5xl font-extrabold text-red-600">
        Classiq.
      </div>
      <CircularProgress color="inherit" size="2rem" />
    </main>
  ) : (
    <main className="flex flex-col min-h-screen items-center bg-white w-full text-zinc-950">
      {/* Title */}
      <div className="w-full mt-8 sm:mt-16 mb-8 text-4xl sm:text-5xl px-4 md:px-12 text-center md:text-start font-extrabold text-red-600">
        Classiq.
      </div>

      {/* Main content */}
      <div className="h-full flex flex-col-reverse lg:flex-row gap-4 lg:gap-12 px-4 md:px-12 w-full">
        {/* Search and starred */}
        <div className="flex flex-col h-full w-full justify-start">
          {/* Selected courses */}
          <div className="mb-2 flex flex-row items-center justify-between gap-4 font-extrabold text-zinc-900">
            {/* Selected courses title */}
            <div className="flex flex-row justify-start items-center flex-wrap gap-2">
              {/* Title */}
              <div className="text-xl sm:text-2xl ">Selected courses</div>
              {/* Show/hide button */}
              <button
                className="flex flex-row items-end rounded-full aspect-square hover:bg-zinc-100"
                onClick={() => setShowStarredCourses((old) => !old)}
              >
                {showStarredCourses ? (
                  <KeyboardArrowUp />
                ) : (
                  <KeyboardArrowDown />
                )}
              </button>
            </div>

            {/* Show schedule matrix button */}
            <button
              className={`flex shrink-0 font-semibold ${
                showScheduleMatrix
                  ? "text-zinc-100 bg-zinc-900"
                  : "text-zinc-700 bg-zinc-100"
              } text-sm px-3 py-2 rounded-lg flex-row items-center gap-2 w-fit`}
              onClick={() => setShowScheduleMatrix(!showScheduleMatrix)}
            >
              <CalendarMonth />
              <div className="hidden sm:flex">
                {showScheduleMatrix ? "Hide" : "Show"} schedule matrix
              </div>
            </button>
          </div>
          {/* )} */}

          {/* Starred courses */}
          {Object.keys(starredCourses).length === 0 ? (
            <div className="h-full flex flex-col text-zinc-400 mb-4 font-medium text-md sm:text-xl">
              Your selected courses will appear here.
            </div>
          ) : !showStarredCourses ? null : (
            <SearchResultTable
              searchResults={Object.values(starredCourses)}
              starredCourses={starredCourses}
              handler={handleStarred}
            />
          )}

          {/* Mobile: Show schedule matrix button */}
          {/* <div className="w-full flex sm:hidden flex-row justify-center">
            <button
              className="shrink-0 font-semibold text-zinc-700 text-sm px-3 py-2 bg-zinc-100 rounded-lg flex flex-row items-center gap-2 w-fit"
              onClick={() => setShowScheduleMatrix(!showScheduleMatrix)}
            >
              <CalendarMonth />
              {showScheduleMatrix ? "Hide" : "Show"} schedule matrix
            </button>
          </div> */}

          {/* Mobile: Schedule matrix */}
          <div
            className={`${
              showScheduleMatrix ? "flex lg:hidden" : "hidden"
            } w-full mt-4`}
          >
            {/* {console.log("All terms:", allTerms)} */}
            <ScheduleMatrix
              starredCourses={starredCourses}
              terms={allTerms}
              visible={showScheduleMatrix}
            />
          </div>

          {/* Search */}
          {searchResults.length === 0 ? null : (
            <div className="mt-8 mb-2 sm:mb-2 text-xl sm:text-2xl font-extrabold text-zinc-900">
              Search courses
            </div>
          )}

          {/* Search bar */}
          <input
            className="placeholder:text-zinc-400 font-medium text-sm sm:text-lg mb-4 w-full focus:outline-none border border-zinc-200 rounded-lg px-3 py-2"
            placeholder="Type a course name or number to start."
            onChange={(event) => setQuery(event.target.value)}
          />

          {/* Filter panel */}
          {!showFilter ? null : (
            <FilterPane {...filterTags} handler={handleFilter} />
          )}

          {/* Search result table */}
          {searchResults.length === 0 ? null : (
            <SearchResultTable
              searchResults={searchResults}
              starredCourses={starredCourses}
              handler={handleStarred}
            />
          )}

          {/* Paginate button */}
          {searchResults.length === 0 || !canPaginate ? null : (
            <div className="flex flex-row justify-center mt-4 pb-8">
              <button
                className="bg-zinc-100 font-medium text-sm  px-3 py-2 rounded-lg"
                onClick={handleLoadMoreResults}
              >
                Load more
              </button>
            </div>
          )}
        </div>

        {/* Schedule matrix */}
        <div
          className={`${
            showScheduleMatrix ? "hidden lg:flex" : "hidden"
          } w-full`}
        >
          {/* {console.log("All terms:", allTerms)} */}
          <ScheduleMatrix
            starredCourses={starredCourses}
            terms={allTerms}
            visible={showScheduleMatrix}
          />
        </div>
      </div>
    </main>
  );
}

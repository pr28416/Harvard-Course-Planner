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
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";

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

  return !render ? null : (
    <main className="flex flex-col min-h-screen items-center bg-white w-full text-zinc-950">
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
      <div className="h-full flex flex-col-reverse lg:flex-row gap-4 lg:gap-12 px-4 md:px-12 w-full">
        {/* Search and starred */}
        <div className="flex flex-col h-full w-full justify-start">
          {!showFilter ? null : (
            <FilterPane {...filterTags} handler={handleFilter} />
          )}
          {/* Starred */}
          {Object.keys(starredCourses).length === 0 ? null : (
            <div className="mt-8 mb-2 text-2xl font-extrabold text-zinc-900 flex flex-row justify-between items-center flex-wrap">
              Starred courses
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
          )}

          {Object.keys(starredCourses).length === 0 ||
          !showStarredCourses ? null : (
            <SearchResultTable
              searchResults={Object.values(starredCourses)}
              starredCourses={starredCourses}
              handler={handleStarred}
            />
          )}

          {/* Search */}
          {searchResults.length === 0 ? null : (
            <div className="mt-8 mb-2 text-2xl font-extrabold text-zinc-900">
              {query.length === 0 ? "All courses" : "Search results"}
            </div>
          )}

          {query.length !== 0 ? null : (
            <div className="h-full flex flex-col text-zinc-400 mb-4 font-semibold text-lg">
              Type a course name or number above to start.
            </div>
          )}

          {searchResults.length === 0 ? null : (
            <SearchResultTable
              searchResults={searchResults}
              starredCourses={starredCourses}
              handler={handleStarred}
            />
          )}
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
        <div className={`${showScheduleMatrix ? "" : "hidden"} flex w-full`}>
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

import FilterPane from "@/components/filterPane";
import results from "@/components/results";
import SearchResultCard from "@/components/searchResultCard";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import Fuse from "fuse.js";
import courses from "@/data/courses.js";
import useSWR from "swr";

export default function Home() {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [starredCourses, setStarredCourses] = useState([]);
  const [filters, setFilters] = useState([]);
  const [filterTags, setFilterTags] = useState([]);
  const [render, setRender] = useState(false);
  const [showFilter, setShowFilter] = useState(true);

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
    console.log("Reset");
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
    console.log({ query: query, filters: filters });

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
    console.log(json);
    setSearchResults(json.items);
  };

  const handleFilter = (tag, items) => {
    console.log(tag, items);
    setFilters((old) => {
      let mod = old.filter((item) => item.tag !== tag);
      mod.push({ tag: tag, items: items });
      return mod;
    });
  };

  return !render ? null : (
    <main className="flex flex-col min-h-screen items-center bg-slate-100">
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
      </div>

      {/* Main content */}
      <div className="flex flex-row grow w-full mt-8 h-full">
        {/* Filter panel */}
        {showFilter ? (
          <FilterPane
            // term={["2023 Fall", "2024 Spring"]}
            {...filterTags}
            handler={handleFilter}
          />
        ) : null}
        {/* Search results */}
        <div className="flex flex-col w-full gap-8 px-8 h-full mb-8">
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
    </main>
  );
}

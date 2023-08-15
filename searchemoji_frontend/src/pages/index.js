import FilterPane from "@/components/filterPane";
import results from "@/components/results";
import SearchResultCard from "@/components/searchResultCard";
import Image from "next/image";
import React, { useState } from "react";
import Fuse from "fuse.js";
import courses from "@/data/courses.js";
import useSWR from "swr";

export default function Home() {
  const [searchResults, setSearchResults] = useState(results);

  // const options = {
  //   // includeScore: true,
  //   // includeMatches: true,
  //   threshold: 0.95,
  //   keys: ["class_name", "class_tag", "subject"],
  // };

  // const fuse = new Fuse(courses.data, options);

  const handleSearch = async (event) => {
    const { value } = event.target;
    if (value.length === 0) {
      setSearchResults([]);
      return;
    }

    const data = new URLSearchParams();
    data.append("query", value);

    const response = await fetch("/api/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: data,
    });
    const json = await response.json();
    console.log(json);
    // const results = fuse.search(value);
    // const items = results.map((result) => result.item);
    // console.log(items.slice(0, 10));
    setSearchResults(json.items);
  };

  return (
    <main className="flex min-h-screen flex-col items-center bg-slate-100">
      {/* Top card */}
      <div className="flex flex-row gap-16 w-full rounded-2xl p-4">
        {/* Title */}
        <div className="flex flex-row gap-2 items-center">
          <Image
            alt="RemyNet logo"
            src="/remy.png"
            width="64"
            height="64"
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
          onChange={handleSearch}
        />
      </div>

      {/* Main content */}
      <div className="flex flex-row w-full mt-8 h-full">
        {/* Filter panel */}
        {/* <FilterPane /> */}
        {/* <div className="flex flex-col border-r border-r-slate-200 px-12 py-8 w-64">
          Filter
        </div> */}
        {/* Search results */}
        <div className="flex flex-col w-full gap-8 px-8">
          {searchResults.map((result, idx) => (
            <SearchResultCard key={idx} {...result} />
          ))}
        </div>
      </div>
    </main>
  );
}

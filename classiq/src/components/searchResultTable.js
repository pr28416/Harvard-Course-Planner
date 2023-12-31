import React from "react";
import SearchResultRow from "./searchResultRow";

export default function SearchResultTable({
  searchResults,
  starredCourses,
  handler,
  setDescriptionViewCourse,
  setDescriptionViewOpen,
}) {
  // console.log("SRT:", starredCourses);
  return (
    <table className="table table-auto md:divide-y-2 dark:md:divide-zinc-700 w-full">
      {/* Header */}
      <thead className="hidden md:table-header-group">
        <tr>
          <th className="text-start py-2">Course</th>
          <th className="text-start py-2">Instructors</th>
          <th className="text-start py-2 hidden xl:table-cell">Term</th>
          <th className="text-start py-2">Time</th>
          {/* <th className="text-start py-2 hidden xl:table-cell">QReport</th> */}
        </tr>
      </thead>
      <tbody className="divide-y dark:divide-zinc-700">
        {/* Content */}
        {searchResults.map((result, idx) => (
          <SearchResultRow
            key={idx}
            result={result}
            handler={handler}
            starred={result.uuid in starredCourses}
            setDescriptionViewCourse={setDescriptionViewCourse}
            setDescriptionViewOpen={setDescriptionViewOpen}
          />
        ))}
      </tbody>
    </table>
  );
}

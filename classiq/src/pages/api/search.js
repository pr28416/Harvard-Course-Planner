import path from "path";
import { promises as fs } from "fs";
// const Fuse = require("fuse.js");
import Fuse from "fuse.js";
import MiniSearch from "minisearch";
import fuzzysort from "fuzzysort";
import FlexSearch, { Document } from "flexsearch";

let fileContents = [];
let didUpdateData = false;

let fuse = null;
let ms = null;
let flexIndex = null;
let filterTags = { sortOption: "Relevance" };
let points = [];
let dayToNumMap = {
  Su: 0,
  M: 1,
  T: 2,
  W: 3,
  Th: 4,
  F: 5,
  Sa: 6,
};
let termMap = {};

async function loadData() {
  console.log("Loading data...");
  const jsonDirectory = path.join(process.cwd(), "src/json");
  fileContents = await fs.readFile(jsonDirectory + "/qcomb.json", "utf8");
  fileContents = JSON.parse(fileContents);
  // flexIndex = new Document({
  //   document: {
  //     id: "id",
  //     index: ["class_name", "class_tag"],
  //   },
  // });
  let i = 0;
  for (let item of fileContents.data) {
    if (!(item.term in termMap)) {
      termMap[item.term] = i++;
    }
  }
  fileContents.data.forEach((item, idx) => {
    item.id = idx;

    if (
      // item.subject &&
      item.subject[0] === "[" &&
      item.subject[item.subject.length - 1] === "]"
    ) {
      item.subject = item.subject.replace(/[\[\]']+/g, "");
    }

    if (
      item.days &&
      item.days[0] === "[" &&
      item.days[item.days.length - 1] === "]"
    ) {
      item.days = item.days
        .slice(1, item.days.length - 1)
        .replaceAll("'", "")
        .split(", ");
      item.days = item.days.filter((day) => day.length > 0);
    }

    if (
      item.instructors &&
      item.instructors[0] === "[" &&
      item.instructors[item.instructors.length - 1] === "]"
    ) {
      item.instructors = item.instructors
        .slice(1, item.instructors.length - 1)
        .replaceAll("'", "")
        .split(", ");
    }

    if (item.start_time && item.end_time) {
      let timeSplit = item.start_time.split(":");
      timeSplit[0] = parseInt(timeSplit[0]) % 12;
      if (timeSplit[1][timeSplit[1].length - 2] == "p") timeSplit[0] += 12;
      timeSplit[1] = parseInt(timeSplit[1].slice(0, timeSplit[1].length - 2));
      item.raw_start_time = 60 * timeSplit[0] + timeSplit[1];

      timeSplit = item.end_time.split(":");
      timeSplit[0] = parseInt(timeSplit[0]) % 12;
      if (timeSplit[1][timeSplit[1].length - 2] == "p") timeSplit[0] += 12;
      timeSplit[1] = parseInt(timeSplit[1].slice(0, timeSplit[1].length - 2));
      item.raw_end_time = 60 * timeSplit[0] + timeSplit[1];

      for (let day of item.days || []) {
        points.push({
          uuid: item.uuid,
          time:
            item.raw_start_time +
            60 * 24 * dayToNumMap[day] +
            60 * 24 * 7 * 180 * termMap[item.term],
          is_start: true,
        });
        points.push({
          uuid: item.uuid,
          time:
            item.raw_end_time +
            60 * 24 * dayToNumMap[day] +
            60 * 24 * 7 * 180 * termMap[item.term],
          is_start: false,
        });
      }
    } else {
      item.raw_start_time = null;
      item.raw_end_time = null;
    }

    // flexIndex.add(item);
  });
  points.sort((a, b) => {
    if (a.time === b.time) {
      return a.is_start ? -1 : 1;
    }
    return a.time - b.time;
  });
  // flexIndex.add(fileContents.data);
  const tagHeaders = ["term", "school", "subject"];
  const tags = tagHeaders.map((field) => [
    ...new Set(fileContents.data.map((item) => item[field])),
  ]);
  for (let tagIdx = 0; tagIdx < tagHeaders.length; tagIdx++) {
    filterTags[tagHeaders[tagIdx]] = tags[tagIdx];
  }
  // console.log(filterTags);
  ms = new MiniSearch({
    fields: ["class_name", "class_tag", "ab0", "ab1", "ab2"],
    storeFields: Object.keys(fileContents.data[0]),
    searchOptions: { fuzzy: 0.3 },
  });
  ms.addAll(fileContents.data);

  // console.log("Done loading data");
  // console.log(typeof fileContents);
  // fuse = new Fuse(fileContents.data, {
  //   threshold: 0.95,
  //   keys: ["class_name", "class_tag"],
  // });
  didUpdateData = true;
}

let fullResults = [];

let filterFunc = (result, filters) =>
  filters
    .map((filt) => {
      if (filt.tag === "sortOption") {
        return true;
      } else if (filt.tag === "show_only_q") {
        if (filt.items) {
          return result["Overall score Course Mean"] && result.mean_hours;
        } else {
          return true;
        }
      } else {
        return filt.items.includes(result[filt.tag]);
      }
    })
    .reduce((a, b) => a && b, true);

export default async function handler(req, res) {
  // console.log("Request received:", req.body.request);
  if (!didUpdateData) {
    await loadData();
    // console.log("Finished loading");
    // console.log(typeof fileContents.data);
    // console.log(fileContents);
  }
  // console.log(req.body);
  if (req.body.request === "filters") {
    res.status(200).json({ filterTags: filterTags, points: points });
  } else if (req.body.request === "retrieve") {
    res.status(200).json({
      items: fileContents.data.filter((item) =>
        req.body.ids.includes(item.uuid)
      ),
    });
  } else if (req.body.request === "search") {
    // console.log("FILTERS", req.body.filters, typeof req.body.filters);

    // Filters
    if (req.body.query.length === 0) {
      fullResults = fileContents.data.filter((result) =>
        filterFunc(result, req.body.filters)
      );
    } else {
      fullResults = ms.search(req.body.query, {
        filter: (result) => filterFunc(result, req.body.filters),
      });
    }

    // // Overlaps
    // for (let result of fullResults) {
    //   result.overlaps = false;
    // }

    // for (let selectedCourse of req.body.selected) {
    //   for (let result of fullResults) {
    //     if (
    //       result.term === selectedCourse.term &&
    //       result.uuid !== selectedCourse.uuid
    //     ) {
    //       for (let day of selectedCourse.days || []) {
    //         if (
    //           result.days &&
    //           result.days.includes(day) &&
    //           result.raw_start_time &&
    //           result.raw_end_time &&
    //           selectedCourse.raw_start_time &&
    //           selectedCourse.raw_end_time
    //         ) {
    //           console.log(
    //             "selected course:",
    //             selectedCourse.class_name,
    //             selectedCourse.days,
    //             selectedCourse.start_time,
    //             selectedCourse.end_time,
    //             "| result:",
    //             result.class_name,
    //             result.days,
    //             result.start_time,
    //             result.end_time
    //           );
    //           if (
    //             !(
    //               result.raw_start_time >= selectedCourse.raw_end_time ||
    //               result.raw_end_time <= selectedCourse.raw_start_time
    //             )
    //           ) {
    //             result.overlaps = true;
    //             break;
    //           }
    //         }
    //       }
    //     }
    //   }
    // }

    for (let result of fullResults) {
      if (result.overlaps) console.log("OVERLAP", result.class_name);
    }

    // Sort
    const sortOption = req.body.filters.find(
      (filt) => filt.tag === "sortOption"
    ) || { items: "Relevance" };
    if (sortOption.items === "Q rating (high to low)") {
      fullResults.sort((a, b) => {
        const acm = a["Overall score Course Mean"] || 0;
        const bcm = b["Overall score Course Mean"] || 0;
        if (acm === bcm) {
          return (a.mean_hours || 1000) - (b.mean_hours || 1000);
        }
        return bcm - acm;
      });
    } else if (sortOption.items === "Q rating (low to high)") {
      fullResults.sort((a, b) => {
        const acm = a["Overall score Course Mean"] || 0;
        const bcm = b["Overall score Course Mean"] || 0;
        if (acm === bcm) {
          return (a.mean_hours || 1000) - (b.mean_hours || 1000);
        }
        return acm - bcm;
      });
    } else if (sortOption.items === "Q hrs/week (busy to light)") {
      fullResults.sort((a, b) => {
        const amh = a.mean_hours || 1000;
        const bmh = b.mean_hours || 1000;
        if (amh === bmh) {
          return (
            (b["Overall score Course Mean"] || 0) -
            (a["Overall score Course Mean"] || 0)
          );
        }
        return bmh - amh;
      });
    } else if (sortOption.items === "Q hrs/week (light to busy)") {
      fullResults.sort((a, b) => {
        const amh = a.mean_hours || 1000;
        const bmh = b.mean_hours || 1000;
        if (amh === bmh) {
          return (
            (b["Overall score Course Mean"] || 0) -
            (a["Overall score Course Mean"] || 0)
          );
        }
        return amh - bmh;
      });
    }

    res.status(200).json({
      items: fullResults.slice(0, req.body.limit),
      canPaginate: fullResults.length > req.body.limit,
    });
  } else if (req.body.request === "paginate") {
    // console.log("PAGINATE", req.body);
    res.status(200).json({
      items: fullResults.slice(
        req.body.offset,
        req.body.offset + req.body.limit
      ),
      canPaginate: req.body.offset + req.body.limit < fullResults.length,
    });
  } else {
    res.status(500).json({ message: "Invalid request" });
  }
}

import path, { format } from "path";
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
let filterTags = {
  sortOption: "Relevance",
  days: ["Su", "M", "T", "W", "Th", "F", "Sa"],
};

function parseArrayStr(arrayStr) {
  let elements = [];
  let currentElement = "";
  let inString = false;
  let quoteChar = null;

  for (let i = 1; i < arrayStr.length; i++) {
    // Starting from 1 to skip initial [
    const char = arrayStr[i];

    if (inString) {
      if (char === quoteChar && arrayStr[i - 1] !== "\\") {
        // Replace escaped quotes with quotes
        currentElement = currentElement.replace(
          new RegExp(`\\\\${quoteChar}`, "g"),
          quoteChar
        );

        elements.push(currentElement);
        currentElement = "";
        inString = false;
      } else {
        currentElement += char;
      }
    } else if (char === '"' || char === "'") {
      inString = true;
      quoteChar = char;
    }
  }

  return elements;
}
 
function formatDate(raw_date) {
  let date = new Date(raw_date);
  let hours = date.getHours();
  let minutes = date.getMinutes();
  let ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours ? hours : 12;
  minutes = minutes < 10 ? "0" + minutes : minutes;
  return hours + ":" + minutes + "" + ampm;
}

async function loadData() {
  console.log("Loading data...");
  const jsonDirectory = path.join(process.cwd(), "public");
  // const jsonDirectory = path.join(process.cwd(), "src/json");
  fileContents = await fs.readFile(jsonDirectory + "/final.json", "utf8");
  fileContents = JSON.parse(fileContents);
  // flexIndex = new Document({
  //   document: {
  //     id: "id",
  //     index: ["class_name", "class_tag"],
  //   },
  // });
  fileContents.data.forEach((item, idx) => {
    item.id = idx;

    if (item.start_time) {
      item.start_time = formatDate(item.start_time);
    }
    if (item.end_time) {
      item.end_time = formatDate(item.end_time);
    }

    try {
      if (
        // item.subject &&
        item.subject[0] === "[" &&
        item.subject[item.subject.length - 1] === "]"
      ) {
        item.subject = item.subject.replace(/[\[\]']+/g, "");
      }
    } catch (err) {
      console.log(item.class_tag, err);
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

    if (
      item.comments &&
      item.comments[0] === "[" &&
      item.comments[item.comments.length - 1] === "]"
    ) {
      item.comments = parseArrayStr(item.comments);
    }

    // flexIndex.add(item);
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
    fields: ["class_name", "class_tag", "ab0", "ab1", "ab2", "instructors"],
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
      } else if (filt.tag === "days") {
        return (
          !result.days || result.days.every((day) => filt.items.includes(day))
        );
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
  if (req.body.request == "all") {
    res.status(200).json(fileContents.data);
  } else if (req.body.request === "filters") {
    res.status(200).json(filterTags);
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

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
let filterTags = {};

async function loadData() {
  console.log("Loading data...");
  const jsonDirectory = path.join(process.cwd(), "src/json");
  fileContents = await fs.readFile(jsonDirectory + "/combined.json", "utf8");
  fileContents = JSON.parse(fileContents);
  // flexIndex = new Document({
  //   document: {
  //     id: "id",
  //     index: ["class_name", "class_tag"],
  //   },
  // });
  fileContents.data.forEach((item, idx) => {
    item.id = idx;

    if (
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
    fields: ["class_name", "class_tag", "ab0", "ab1", "ab2"],
    storeFields: [
      "class_name",
      "class_tag",
      "instructors",
      "term",
      "days",
      "description",
      "start_time",
      "end_time",
      "q_report",
      "uuid",
      "school",
      "subject",
    ],
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
    res.status(200).json(filterTags);
  } else if (req.body.request === "retrieve") {
    res.status(200).json({
      items: fileContents.data.filter((item) =>
        req.body.ids.includes(item.uuid)
      ),
    });
  } else if (req.body.request === "search") {
    // console.log("FILTERS", req.body.filters, typeof req.body.filters);
    if (req.body.query.length === 0) {
      fullResults = fileContents.data.filter((result) =>
        req.body.filters
          .map((filt) => filt.items.includes(result[filt.tag]))
          .reduce((a, b) => a && b, true)
      );
    } else {
      fullResults = ms.search(req.body.query, {
        filter: (result) =>
          req.body.filters
            .map((filt) => filt.items.includes(result[filt.tag]))
            .reduce((a, b) => a && b, true),
      });
    }
    // const results = fuzzysort
    //   .go(req.body.query, fileContents.data, {
    //     keys: ["class_tag", "class_name"],
    //     limit: 25,
    //     all: true,
    //     threshold: -Infinity,
    //     scoreFn: (a) =>
    //       Math.max(a[0] ? a[0].score : -1000, a[1] ? a[1].score - 300 : -1000),
    //   })
    //   .map((result) => result.obj);
    // let results = flexIndex.search(req.body.query, {
    //   index: ["class_name", "class_tag"],
    //   limit: 25,
    //   tokenizer: "full",
    //   encoder: "extra",
    // });
    // let actual = [];
    // for (let res of results) {
    //   res.result.forEach((resIdx) => actual.push(fileContents.data[resIdx]));
    // }
    // results = actual;
    // console.log(results);
    res.status(200).json({
      items: fullResults.slice(0, req.body.limit),
      canPaginate: fullResults.length > req.body.limit,
    });
    // res.status(200).json({ items: [] });
    // let myFuse = new Fuse(fileContents.data, {
    //   threshold: 0.95,
    //   keys: ["class_name", "class_tag"],
    // });
    // const results = myFuse.search(req.body.query);
    // // console.log(results);
    // const items = results.map((result) => result.item);
    // res.status(200).json({ items: items.slice(0, 15) });
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

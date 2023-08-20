import path from "path";
import { promises as fs } from "fs";
// const Fuse = require("fuse.js");
import Fuse from "fuse.js";
import MiniSearch from "minisearch";

let fileContents = [];
let didUpdateData = false;

let fuse = null;
let ms = null;
let filterTags = {};

async function loadData() {
  console.log("Loading data...");
  const jsonDirectory = path.join(process.cwd(), "src/json");
  fileContents = await fs.readFile(jsonDirectory + "/fas.json", "utf8");
  fileContents = JSON.parse(fileContents);
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
    }
  });
  const tagHeaders = ["term", "school", "subject"];
  const tags = tagHeaders.map((field) => [
    ...new Set(fileContents.data.map((item) => item[field])),
  ]);
  for (let tagIdx = 0; tagIdx < tagHeaders.length; tagIdx++) {
    filterTags[tagHeaders[tagIdx]] = tags[tagIdx];
  }
  // console.log(filterTags);
  ms = new MiniSearch({
    fields: ["class_name", "class_tag", "instructors"],
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

export default async function handler(req, res) {
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
    let results = ms.search(req.body.query, {
      filter: (result) =>
        req.body.filters
          .map((filt) => filt.items.includes(result[filt.tag]))
          .reduce((a, b) => a && b, true),
    });
    // console.log(results.slice(0, 15));
    res.status(200).json({ items: results.slice(0, 100) });
    // let myFuse = new Fuse(fileContents.data, {
    //   threshold: 0.95,
    //   keys: ["class_name", "class_tag"],
    // });
    // const results = myFuse.search(req.body.query);
    // // console.log(results);
    // const items = results.map((result) => result.item);
    // res.status(200).json({ items: items.slice(0, 15) });
  } else {
    res.status(500).json({ message: "Invalid request" });
  }
}

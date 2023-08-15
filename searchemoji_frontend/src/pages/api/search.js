import path from "path";
import { promises as fs } from "fs";
// const Fuse = require("fuse.js");
import Fuse from "fuse.js";

let fileContents = [];
let didUpdateData = false;

let fuse = null;

async function loadData() {
  console.log("Loading data...");
  const jsonDirectory = path.join(process.cwd(), "src/json");
  fileContents = await fs.readFile(jsonDirectory + "/fas.json", "utf8");
  fileContents = JSON.parse(fileContents);
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
  let myFuse = new Fuse(fileContents.data, {
    threshold: 0.95,
    keys: ["class_name", "class_tag"],
  });
  const results = myFuse.search(req.body.query);
  console.log(results);
  const items = results.map((result) => result.item);
  res.status(200).json({ items: items.slice(0, 15) });
}

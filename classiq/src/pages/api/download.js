import { writeFileSync } from "fs";
import { saveAs } from "file-saver";
const ics = require("ics");

const dayMap = {
  Su: "SU",
  M: "MO",
  T: "TU",
  W: "WE",
  Th: "TH",
  F: "FR",
  Sa: "SA",
};

export default async function handler(req, res) {
  if (req.body.courses) {
    const { error, value } = ics.createEvents(
      req.body.courses.map((course) => {
        const rawStartDate = new Date(Date.parse(course.start_date));

        for (let dateOffset = 0; dateOffset < 7; dateOffset++) {
          if (
            course.days.includes(
              Object.keys(dayMap)[(rawStartDate.getDay() + dateOffset) % 7]
            )
          ) {
            rawStartDate.setDate(rawStartDate.getDate() + dateOffset);
            break;
          }
        }

        const startDate = [
          rawStartDate.getMonth() + 1,
          rawStartDate.getDate(),
          rawStartDate.getFullYear(),
        ];

        let rawEndDate = new Date(Date.parse(course.end_date));
        rawEndDate.setDate(rawEndDate.getDate() + 1);

        // for (
        //   let dateOffset = rawEndDate.getDay();
        //   dateOffset < 7;
        //   dateOffset++
        // ) {
        //   if (course.days.includes(Object.keys(dayMap)[dateOffset % 7])) {
        //     rawEndDate.setDate(rawEndDate.getDate() + (dateOffset % 7));
        //     break;
        //   }
        // }

        const endDate = [
          rawEndDate.getMonth() + 1,
          rawEndDate.getDate(),
          rawEndDate.getFullYear(),
        ];

        let startTime = course.start_time.split(":");
        startTime[0] = parseInt(startTime[0]) % 12;
        if (startTime[1][startTime[1].length - 2] == "p") startTime[0] += 12;
        startTime[1] = parseInt(startTime[1].slice(0, startTime[1].length - 2));

        let endTime = course.end_time.split(":");
        endTime[0] = parseInt(endTime[0]) % 12;
        if (endTime[1][endTime[1].length - 2] == "p") endTime[0] += 12;
        endTime[1] = parseInt(endTime[1].slice(0, endTime[1].length - 2));

        const rawTimeDiff =
          60 * (endTime[0] - startTime[0]) + endTime[1] - startTime[1];

        const event = {
          title: `${course.class_tag} - ${course.class_name}`,
          start: [startDate[2], startDate[0], startDate[1], ...startTime],
          duration: {
            hours: Math.floor(rawTimeDiff / 60),
            minutes: rawTimeDiff % 60,
          },
          recurrenceRule: `FREQ=WEEKLY;BYDAY=${course.days
            .map((day) => dayMap[day])
            .join(",")};INTERVAL=1;UNTIL=${endDate[2]}${
            endDate[0] < 10 ? "0" : ""
          }${endDate[0]}${endDate[1] < 10 ? "0" : ""}${endDate[1]}T000000Z`,
          //   end: [endDate[2], endDate[0], endDate[1], ...endTime],
        };
        console.log(event);
        return event;
      })
    );
    if (error) {
      console.log("ERROR:", error);
      res.status(400).json({ error: error });
    } else {
      // writeFileSync("calendar.ics", value);
      //   console.log("VALUE:", value);

      try {
        res.status(200).json({ value: value });
      } catch (error) {
        console.log(error);
        res.status(400).json({ error: "File failed to save" });
      }
    }
  } else {
    res.status(400).json({ error: "No file" });
  }
}

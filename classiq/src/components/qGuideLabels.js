import { AccessTime, EmojiEvents } from "@mui/icons-material";

function Q_OverallScoreFASMeanView({ result }) {
  const score = result["Overall score Course Mean"];
  if (score) {
    return (
      <div
        className={`flex flex-row gap-1 p-1 items-center ${
          score < 1.5
            ? "text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950"
            : score < 2.5
            ? "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950"
            : score < 3.5
            ? "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950"
            : score < 4.5
            ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950"
            : "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950"
        } font-semibold rounded-md text-xs`}
      >
        <EmojiEvents fontSize="small" />
        <div className="flex flex-row items-end">
          <div>{score}</div>
          <div className="font-normal">&nbsp;/ 5.00</div>
        </div>
      </div>
    );
  } else {
    return null;
  }
}

function Q_MeanHoursView({ result }) {
  const score = result.mean_hours;
  if (score) {
    return (
      <div
        className={`flex flex-row gap-1 p-1 items-center ${
          score > 24
            ? "text-zinc-700 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-950"
            : score > 19
            ? "text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950"
            : score > 14
            ? "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950"
            : score > 9
            ? "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950"
            : score > 4
            ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950"
            : "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950"
        } font-semibold rounded-md text-xs`}
      >
        <AccessTime fontSize="small" />
        <div className="flex flex-row items-end">
          <div>{score}</div>
          <div className="font-normal">&nbsp;hrs/week</div>
        </div>
      </div>
    );
  } else {
    return null;
  }
}

export { Q_OverallScoreFASMeanView, Q_MeanHoursView };

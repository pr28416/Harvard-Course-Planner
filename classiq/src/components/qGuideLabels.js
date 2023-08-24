import { AccessTime, EmojiEvents } from "@mui/icons-material";

function Q_OverallScoreFASMeanView({ result }) {
  const score = result["Overall score Course Mean"];
  if (score) {
    return (
      <div
        className={`flex flex-row gap-1 p-1 items-center ${
          score < 1.5
            ? "text-red-700 bg-red-50"
            : score < 2.5
            ? "text-orange-600 bg-orange-50"
            : score < 3.5
            ? "text-yellow-600 bg-yellow-50"
            : score < 4.5
            ? "text-emerald-600 bg-emerald-50"
            : "text-blue-600 bg-blue-50"
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
            ? "text-zinc-700 bg-zinc-100"
            : score > 19
            ? "text-red-700 bg-red-50"
            : score > 14
            ? "text-orange-600 bg-orange-50"
            : score > 9
            ? "text-yellow-600 bg-yellow-50"
            : score > 4
            ? "text-emerald-600 bg-emerald-50"
            : "text-blue-600 bg-blue-50"
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

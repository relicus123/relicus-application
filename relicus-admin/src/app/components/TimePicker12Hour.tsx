import React, { useMemo } from "react";
import { Clock } from "lucide-react";

interface TimePicker12HourProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  required?: boolean;
  disabled?: boolean;
}

// Parses 24h ("13:30") or 12h ("01:30 PM", "10:00 AM") or defaults
function parseTimeString(raw: string): { hour: string; minute: string; meridiem: "AM" | "PM" } {
  if (!raw || !raw.trim()) {
    return { hour: "10", minute: "00", meridiem: "AM" };
  }
  const s = raw.trim();

  // Try 12-hour match: "10:00 AM", "1:30 pm"
  const match12 = s.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (match12) {
    const h = parseInt(match12[1], 10);
    const m = match12[2];
    const meridiem = match12[3].toUpperCase() as "AM" | "PM";
    const padH = (h < 1 ? 12 : h > 12 ? ((h % 12) || 12) : h).toString().padStart(2, "0");
    return { hour: padH, minute: m, meridiem };
  }

  // Try 24-hour match: "13:30", "09:00", "00:15"
  const match24 = s.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    let h = parseInt(match24[1], 10);
    const m = match24[2];
    const meridiem: "AM" | "PM" = h >= 12 ? "PM" : "AM";
    if (h === 0) {
      h = 12;
    } else if (h > 12) {
      h = h - 12;
    }
    const padH = h.toString().padStart(2, "0");
    return { hour: padH, minute: m, meridiem };
  }

  return { hour: "10", minute: "00", meridiem: "AM" };
}

export const TimePicker12Hour: React.FC<TimePicker12HourProps> = ({
  label,
  value,
  onChange,
  disabled = false,
}) => {
  const { hour, minute, meridiem } = useMemo(() => parseTimeString(value), [value]);

  const update = (newH: string, newM: string, newMeridiem: "AM" | "PM") => {
    onChange(`${newH}:${newM} ${newMeridiem}`);
  };

  const hoursList = [
    "01", "02", "03", "04", "05", "06",
    "07", "08", "09", "10", "11", "12",
  ];

  const minutesList = [
    "00", "05", "10", "15", "20", "25",
    "30", "35", "40", "45", "50", "55",
  ];

  return (
    <div className="space-y-1 w-full min-w-0">
      <div className="flex items-center justify-between">
        <label className="block text-[9px] uppercase font-bold text-slate-500 dark:text-slate-400 truncate">
          {label}
        </label>
        <span className="text-[9px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-900/40 px-1 py-0.5 rounded flex items-center gap-0.5 shrink-0">
          <Clock className="w-2.5 h-2.5" />
          {hour}:{minute} {meridiem}
        </span>
      </div>

      <div className="flex items-center gap-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-1 shadow-sm w-full min-w-0">
        {/* Hour Select */}
        <select
          disabled={disabled}
          value={hour}
          onChange={(e) => update(e.target.value, minute, meridiem)}
          className="bg-transparent text-[11px] font-semibold text-slate-800 dark:text-slate-200 outline-none cursor-pointer py-0.5 px-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 flex-1 min-w-0 text-center"
          title="Select Hour (12-hour format)"
        >
          {hoursList.map((h) => (
            <option key={h} value={h} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
              {h}
            </option>
          ))}
        </select>

        <span className="text-[11px] font-bold text-slate-400 shrink-0 px-0.5">:</span>

        {/* Minute Select */}
        <select
          disabled={disabled}
          value={minute}
          onChange={(e) => update(hour, e.target.value, meridiem)}
          className="bg-transparent text-[11px] font-semibold text-slate-800 dark:text-slate-200 outline-none cursor-pointer py-0.5 px-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 flex-1 min-w-0 text-center"
          title="Select Minute"
        >
          {minutesList.map((m) => (
            <option key={m} value={m} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
              {m}
            </option>
          ))}
        </select>

        {/* AM / PM Toggle */}
        <div className="flex items-center shrink-0 bg-slate-100 dark:bg-slate-800 rounded p-0.5 border border-slate-200 dark:border-slate-700 ml-1">
          <button
            type="button"
            disabled={disabled}
            onClick={() => update(hour, minute, "AM")}
            className={`px-1 py-0.5 text-[9px] font-bold rounded transition-colors ${
              meridiem === "AM"
                ? "bg-amber-500 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            AM
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => update(hour, minute, "PM")}
            className={`px-1 py-0.5 text-[9px] font-bold rounded transition-colors ${
              meridiem === "PM"
                ? "bg-amber-500 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            PM
          </button>
        </div>
      </div>
    </div>
  );
};

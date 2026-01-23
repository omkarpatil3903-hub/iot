import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { CloudRain, CloudOff } from "lucide-react";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const RainBarChart = ({ data = [] }) => {
  // Intensity color mapping
  const getBarColor = (intensity) => {
    switch (intensity) {
      case "heavy":
        return "#3B82F6";
      case "moderate":
        return "#60A5FA";
      case "light":
        return "#93C5FD";
      default:
        return "rgba(255,255,255,0.15)";
    }
  };

  // Format date for display
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { weekday: "short" });
  };

  // Calculate statistics
  const totalRainHours = data.reduce((sum, d) => sum + (d.duration || 0), 0);
  const rainyDays = data.filter((d) => d.duration > 0).length;
  const avgRainPerDay =
    rainyDays > 0 ? (totalRainHours / rainyDays).toFixed(1) : 0;
  const hasData = data.length > 0;
  const hasRain = totalRainHours > 0;

  // Chart.js configuration
  const chartData = {
    labels: data.map((d) => formatDate(d.date)),
    datasets: [
      {
        label: "Rain Duration (hours)",
        data: data.map((d) => d.duration || 0),
        backgroundColor: data.map((d) => getBarColor(d.intensity)),
        borderRadius: 4,
        maxBarThickness: 40,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(17, 24, 39, 0.95)",
        titleColor: "#f3f4f6",
        bodyColor: "#e5e7eb",
        padding: 12,
        displayColors: false,
        callbacks: {
          title: (items) => {
            if (items.length > 0) {
              const idx = items[0].dataIndex;
              const d = data[idx];
              return new Date(d.date).toLocaleDateString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric",
              });
            }
            return "";
          },
          label: (item) => {
            const idx = item.dataIndex;
            const d = data[idx];
            return [
              `Duration: ${d.duration}h`,
              `Intensity: ${d.intensity || "none"}`,
            ];
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "rgba(255,255,255,0.5)",
          font: { size: 11 },
        },
        border: {
          color: "rgba(255,255,255,0.1)",
        },
      },
      y: {
        grid: {
          color: "rgba(255,255,255,0.1)",
          drawBorder: false,
        },
        ticks: {
          color: "rgba(255,255,255,0.5)",
          font: { size: 11 },
          callback: (v) => `${v}h`,
        },
        border: {
          display: false,
        },
      },
    },
  };

  // Empty state
  if (!hasData) {
    return (
      <div className="bg-surface-card rounded-2xl p-4 border border-white/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-white/5 rounded-lg">
            <CloudOff className="w-5 h-5 text-white/40" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-white">7-Day Rainfall</h3>
            <p className="text-xs text-white/50">No data available</p>
          </div>
        </div>
        <div className="h-48 flex items-center justify-center">
          <p className="text-white/30 text-sm">No rainfall data to display</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-card rounded-2xl p-3 sm:p-4 border border-white/10 hover:border-white/20 transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-lg transition-colors ${hasRain ? "bg-blue-500/20" : "bg-white/5"
              }`}
          >
            <CloudRain
              className={`w-4 h-4 sm:w-5 sm:h-5 ${hasRain ? "text-blue-400" : "text-white/40"
                }`}
            />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-medium text-white">
              7-Day Rainfall
            </h3>
            <p className="text-[10px] sm:text-xs text-white/50">
              Duration &amp; intensity tracking
            </p>
          </div>
        </div>
        <div className="text-left sm:text-right">
          <p
            className={`text-base sm:text-lg font-bold ${hasRain ? "text-blue-400" : "text-white/40"
              }`}
          >
            {totalRainHours.toFixed(1)}h
          </p>
          <p className="text-[10px] sm:text-xs text-white/50">
            {rainyDays} rainy days
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-40 sm:h-48">
        <Bar data={chartData} options={options} />
      </div>

      {/* Legend & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4 pt-3 border-t border-white/10">
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-sm bg-[#93C5FD]" />
            <span className="text-[10px] sm:text-xs text-white/60">Light</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-sm bg-[#60A5FA]" />
            <span className="text-[10px] sm:text-xs text-white/60">
              Moderate
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-sm bg-[#3B82F6]" />
            <span className="text-[10px] sm:text-xs text-white/60">Heavy</span>
          </div>
        </div>
        {rainyDays > 0 && (
          <div className="text-[10px] sm:text-xs text-white/50">
            Avg:{" "}
            <span className="text-blue-400 font-medium">{avgRainPerDay}h</span>
            /day
          </div>
        )}
      </div>
    </div>
  );
};

export default RainBarChart;

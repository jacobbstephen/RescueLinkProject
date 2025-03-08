import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const IncidentTrendLineChart = ({ incidents }) => {
  const getIncidentCounts = () => {
    const counts = incidents.reduce((acc, incident) => {
      if (incident.date) {
        const formattedDate = new Date(incident.date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });

        acc[formattedDate] = (acc[formattedDate] || 0) + 1;
      } else {
        acc["Unknown"] = (acc["Unknown"] || 0) + 1;
      }
      return acc;
    }, {});

    // Sort dates chronologically
    const sortedEntries = Object.entries(counts)
      .filter(([date]) => date !== "Unknown") // Keep "Unknown" separate
      .sort(([a], [b]) => new Date(a) - new Date(b));

    // Extract sorted labels (dates) and data (incident counts)
    const labels = sortedEntries.map(([date]) => date);
    const dataValues = sortedEntries.map(([, count]) => count);

    // Add "Unknown" incidents at the end if they exist
    if (counts["Unknown"]) {
      labels.push("Unknown");
      dataValues.push(counts["Unknown"]);
    }

    return { labels, dataValues };
  };

  const { labels, dataValues } = getIncidentCounts();

  const data = {
    labels,
    datasets: [
      {
        label: "Incidents Over Time",
        data: dataValues,
        borderColor: "#1eaad1",
        backgroundColor: "rgba(30, 170, 209, 0.2)",
        borderWidth: 2,
        pointRadius: 4,
        pointBackgroundColor: "#158aa8",
      },
    ],
  };

  return (
    <div className="bg-white p-4 shadow-md rounded-lg w-72">
      <h3 className="text-md font-semibold mb-2 text-center">Incidents Over Time</h3>
      <div className="h-52 w-full">
        <Line data={data} options={{ maintainAspectRatio: false, responsive: true }} />
      </div>
    </div>
  );
};

export default IncidentTrendLineChart;

import React from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, Tooltip, Legend, CategoryScale, LinearScale } from "chart.js";

ChartJS.register(BarElement, Tooltip, Legend, CategoryScale, LinearScale);

const IncidentTypesBarChart = ({ incidents }) => {
  // Count occurrences of each incident type
  const incidentCounts = {};
  incidents.forEach((incident) => {
    incidentCounts[incident.type] = (incidentCounts[incident.type] || 0) + 1;
  });

  // Prepare data for the Bar Chart
  const data = {
    labels: Object.keys(incidentCounts), // Incident types as labels
    datasets: [
      {
        label: "Number of Incidents",
        data: Object.values(incidentCounts),
        backgroundColor: "#1eaad1",
        hoverBackgroundColor: "#158aa8",
      },
    ],
  };

  // Chart options to make it smaller
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="bg-white p-4 shadow-md rounded-lg w-80 h-60 flex flex-col items-center">
      <h3 className="text-md font-semibold mb-2">Incident Types Distribution</h3>
      <div className="w-72 h-48">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default IncidentTypesBarChart;

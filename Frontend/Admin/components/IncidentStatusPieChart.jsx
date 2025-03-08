import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const IncidentStatusPieChart = ({ incidents }) => {
  // Count Verified & Unverified incidents
  const verifiedCount = incidents.filter((incident) => incident.verifiedStatus === "Verified").length;
  const unverifiedCount = incidents.length - verifiedCount;

  // Data for Pie Chart
  const data = {
    labels: ["Verified", "Unverified"],
    datasets: [
      {
        data: [verifiedCount, unverifiedCount],
        backgroundColor: ["#4CAF50", "#F44336"],
        hoverBackgroundColor: ["#388E3C", "#D32F2F"],
      },
    ],
  };

  // Options to reduce size
  const options = {
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    <div className="bg-white p-4 shadow-md rounded-lg w-60 h-60 flex flex-col items-center">
      <h3 className="text-md font-semibold mb-2">Incident Status</h3>
      <div className="w-40 h-40">
        <Pie data={data} options={options} />
      </div>
    </div>
  );
};

export default IncidentStatusPieChart;

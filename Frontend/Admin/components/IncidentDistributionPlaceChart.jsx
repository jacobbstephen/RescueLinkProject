import React from "react";

const generateColor = (index) => {
  // Generates a unique color for each state
  const hue = (index * 137) % 360; // Spread colors evenly
  return `hsl(${hue}, 70%, 60%)`; // HSL format for variety
};

const IncidentPlacePieChart = ({ incidents }) => {
  // Group incidents by state and count occurrences
  const placeCounts = incidents.reduce((acc, incident) => {
    acc[incident.state] = (acc[incident.state] || 0) + 1;
    return acc;
  }, {});

  // Convert data into an array of objects
  const data = Object.entries(placeCounts).map(([state, count], index) => ({
    name: state,
    value: count,
    color: generateColor(index), // Assign a unique color dynamically
  }));

  // Calculate total incidents
  const totalIncidents = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-lg mx-auto">
      <h2 className="text-lg font-semibold text-center mb-4">Incident Distribution by Place</h2>

      <div className="relative w-52 h-52 mx-auto">
        {/* Pie Chart */}
        <svg viewBox="0 0 32 32" className="w-full h-full">
          {data.reduce((acc, { value, color }, index) => {
            const startAngle = acc.lastAngle;
            const angle = (value / totalIncidents) * 360;
            const endAngle = startAngle + angle;
            acc.lastAngle = endAngle;

            // Convert angles to SVG arc path
            const largeArcFlag = angle > 180 ? 1 : 0;
            const startX = 16 + 16 * Math.cos((startAngle * Math.PI) / 180);
            const startY = 16 + 16 * Math.sin((startAngle * Math.PI) / 180);
            const endX = 16 + 16 * Math.cos((endAngle * Math.PI) / 180);
            const endY = 16 + 16 * Math.sin((endAngle * Math.PI) / 180);

            acc.paths.push(
              <path
                key={index}
                d={`M16,16 L${startX},${startY} A16,16 0 ${largeArcFlag},1 ${endX},${endY} Z`}
                fill={color}
                stroke="white"
                strokeWidth="0.5"
              />
            );

            return acc;
          }, { lastAngle: 0, paths: [] }).paths}
        </svg>

        {/* Center Circle */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-sm font-bold">
            {totalIncidents} Total
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4">
        {data.map((item, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }}></div>
            <span className="text-gray-700 text-sm">{item.name} ({item.value})</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IncidentPlacePieChart;

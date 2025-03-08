import React, { useState, useEffect } from "react";
import axios from "axios";

const AdminDashboardTable = ({ incidents, setIncidents }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [placeFilter, setPlaceFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(null);

  const itemsPerPage = 3;
  const places = [
    "All",
    ...new Set(incidents.map((incident) => incident.state)),
  ];

  // ✅ Filter incidents based on search & place
  const filteredIncidents = incidents.filter(
    (incident) =>
      (placeFilter === "All" || incident.state === placeFilter) &&
      incident.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ✅ Ensure totalPages is at least 1
  const totalPages = Math.max(
    1,
    Math.ceil(filteredIncidents.length / itemsPerPage)
  );

  // ✅ Reset to Page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, placeFilter]);

  // ✅ Get paginated results
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedIncidents = filteredIncidents.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handleVerify = async (incidentId) => {
    console.log("In verify");
    setLoading(incidentId);
    try {
      const token = localStorage.getItem("Token");
      const response = await axios.put(
        `http://localhost:3000/admin/verify/${incidentId}`,
        {}, // Put method usually requires a request body (empty in this case)
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include token in headers
          },
        }
      );
      setIncidents((prevIncidents) =>
        prevIncidents.map((incident) =>
          incident._id === incidentId
            ? { ...incident, verifiedStatus: "Verified" }
            : incident
        )
      );
    } catch (error) {
      console.error("Error verifying incident:", error);
    }
    setLoading(null);
  };

  return (
    <div className="relative overflow-x-auto shadow-lg rounded-lg bg-white/50 backdrop-blur-md p-6">
      {/* Filters and Search Input */}
      <div className="flex flex-col sm:flex-row justify-between items-center pb-6">
        <select
          className="border border-gray-300 rounded-lg px-4 py-2 shadow-md focus:ring-2 focus:ring-[#1eaad1] transition-all"
          value={placeFilter}
          onChange={(e) => setPlaceFilter(e.target.value)}
        >
          {places.map((place) => (
            <option key={place} value={place}>
              {place}
            </option>
          ))}
        </select>

        <div className="relative">
          <input
            type="text"
            className="block w-80 p-2 pl-10 text-sm border border-gray-300 rounded-lg bg-gray-50 shadow-md focus:ring-[#1eaad1] focus:border-[#1eaad1]"
            placeholder="Search incidents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <table className="w-full text-sm text-left text-gray-700 rounded-lg overflow-hidden">
        <thead className="text-xs uppercase text-white bg-gradient-to-r from-[#1eaad1] to-[#158aa8]">
          <tr>
            <th className="px-6 py-3">Incident Title</th>
            <th className="px-6 py-3">Type</th>
            <th className="px-6 py-3">Description</th>
            <th className="px-6 py-3">Date</th>
            <th className="px-6 py-3">State</th>
            <th className="px-6 py-3">District</th>
            <th className="px-6 py-3">Locality</th>
            <th className="px-6 py-3">Reporter Name</th>
            <th className="px-6 py-3">Phone Number</th>
            <th className="px-6 py-3">Location</th>
            <th className="px-6 py-3">Status</th>
            <th className="px-6 py-3">Action</th>
            <th className="px-6 py-3">Image</th> {/* New Image Column */}
          </tr>
        </thead>
        <tbody>
          {paginatedIncidents.length > 0 ? (
            paginatedIncidents.map((incident) => (
              <tr
                key={incident._id}
                className="border-b transition-all hover:bg-[#f3f8fa] bg-gray-50"
              >
                <td className="px-6 py-4 font-medium">{incident.title}</td>
                <td className="px-6 py-4">{incident.type}</td>
                <td className="px-6 py-4 text-gray-600">
                  {incident.description}
                </td>
                <td className="px-6 py-4">
                  {incident.date
                    ? new Date(incident.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                        hour12: true,
                      })
                    : "No Date Available"}
                </td>
                <td className="px-6 py-4">{incident.state}</td>
                <td className="px-6 py-4">{incident.district}</td>
                <td className="px-6 py-4">{incident.locality}</td>
                <td className="px-6 py-4">{incident.reporterName}</td>
                <td className="px-6 py-4">{incident.phoneNumber}</td>

                <td className="px-6 py-4">
                  {incident.location?.coordinates?.length === 2 ? (
                    <a
                      href={`https://www.google.com/maps?q=${incident.location.coordinates[1]},${incident.location.coordinates[0]}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 transition-all"
                    >
                      View
                    </a>
                  ) : (
                    <span className="text-gray-500">No Location</span>
                  )}
                </td>

                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded text-xs font-semibold shadow-md ${
                      incident.verifiedStatus === "Verified"
                        ? "bg-green-200 text-green-700"
                        : "bg-red-200 text-red-700"
                    }`}
                  >
                    {incident.verifiedStatus}
                  </span>
                </td>

                <td className="px-6 py-4">
                  {incident.verifiedStatus === "Unverified" ? (
                    <button
                      className="px-3 py-1.5 bg-gradient-to-r from-green-400 to-green-600 text-white font-semibold rounded-lg shadow-md hover:from-green-500 hover:to-green-700 transition-all"
                      onClick={() => handleVerify(incident._id)}
                      disabled={loading === incident._id}
                    >
                      {loading === incident._id ? "Verifying..." : "Verify"}
                    </button>
                  ) : (
                    <span className="text-gray-500">Verified</span>
                  )}
                </td>

                {/* ✅ Image Column */}
                <td className="px-6 py-4">
                  {incident.fileUrl ? (
                    <a
                      href={incident.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-gradient-to-r from-indigo-400 to-indigo-600 text-white font-semibold rounded-lg shadow-md hover:from-indigo-500 hover:to-indigo-700 transition-all"
                    >
                      View 
                    </a>
                  ) : (
                    <span className="text-gray-500">No Preview</span>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="13" className="text-center py-6 text-gray-600">
                No incidents found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className="flex justify-between mt-4">
        <button
          className="px-6 py-2 bg-[#1eaad1] text-white rounded-lg shadow-md hover:bg-[#159ab8] transition-all"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Prev
        </button>
        <span className="text-gray-700 font-semibold">
          Page {currentPage} of {totalPages}
        </span>
        <button
          className="px-6 py-2 bg-[#1eaad1] text-white rounded-lg shadow-md hover:bg-[#159ab8] transition-all"
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default AdminDashboardTable;

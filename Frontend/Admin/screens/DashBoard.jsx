import { useState, useEffect } from "react";
import axios from "axios";
import AdminDashboardTable from "../components/AdminDashboardTable";
import IncidentTypesBarChart from "../components/IncidentStatusBarChart";
import IncidentTrendLineChart from "../components/IncidentStatusLineChart";
import IncidentStatusPieChart from "../components/IncidentStatusPieChart";
import IncidentPlacePieChart from "../components/IncidentDistributionPlaceChart";
import ExportCSV from "../components/ExportCSV"; 
import { useNavigate } from "react-router-dom"; 


function DashBoard() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); 
  const navigate = useNavigate();

  // ✅ Fetch Incidents from Backend
  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const token = localStorage.getItem("Token");
        const response = await axios.get("http://localhost:3000/admin/getIncidents", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log(response.data.incidents)
        setIncidents(response.data.incidents);
      } catch (err) {
        console.error("Error fetching incidents:", err);
        setError("Failed to load incidents");
      } finally {
        setLoading(false);
      }
    };

    fetchIncidents();
  }, []);

  // 🔄 Refresh Data
  const handleRefresh = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("Token");
      const response = await axios.get("http://localhost:3000/admin/getIncidents", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
        console.log(response.data.incidents)
      setIncidents(response.data.incidents);
    } catch (err) {
      console.error("Error refreshing incidents:", err);
      setError("Failed to refresh incidents");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('Token');
    navigate('/')
  }


  if (loading) return <p className="text-center">Loading incidents...</p>;
  if (error) return <p className="text-red-500 text-center">{error} Login Again</p>;

  return (
    <div className="m-4 p-3">
      {/* Header with Buttons */}
      <div className="flex justify-between items-center mb-4">
  {/* 🔄 Refresh Button */}
  <button
    onClick={handleRefresh}
    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
  >
    🔄 Refresh
  </button>

  {/* Grouped Buttons: Export CSV & Logout */}
  <div className="flex gap-4">
    {/* ✅ Export CSV Button */}
    <ExportCSV incidents={incidents} />

    {/* 🚪 Logout Button */}
    <button
      onClick={handleLogout}
      className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
    >
      🚪 Logout
    </button>
  </div>
</div>


      {/* Admin Dashboard Table */}
      <AdminDashboardTable incidents={incidents} setIncidents={setIncidents} />

      {/* Charts Section */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white shadow-lg rounded-lg p-4">
          <IncidentStatusPieChart incidents={incidents} />
        </div>
        <div className="bg-white shadow-lg rounded-lg p-4">
          <IncidentTypesBarChart incidents={incidents} />
        </div>
        <div className="bg-white shadow-lg rounded-lg p-4">
          <IncidentTrendLineChart incidents={incidents} />
        </div>
        <div className="bg-white shadow-lg rounded-lg p-4">
          <IncidentPlacePieChart incidents={incidents} />
        </div>
      </div>
    </div>
  );
}

export default DashBoard;

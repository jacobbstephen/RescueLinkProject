import { saveAs } from "file-saver";
import Papa from "papaparse";

const ExportCSV = ({ incidents }) => {
  const downloadCSV = () => {
    const csv = Papa.unparse(incidents);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "Incident_Report.csv");
  };

  return (
    <button
      onClick={downloadCSV}
      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-800"
    >
      Download CSV 📊
    </button>
  );
};

export default ExportCSV;

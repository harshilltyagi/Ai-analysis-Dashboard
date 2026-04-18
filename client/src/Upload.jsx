import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Papa from "papaparse";

function Upload() {
  const navigate = useNavigate();

  const [fileName, setFileName] = useState("");
  const [headers, setHeaders] = useState([]);
  const [previewData, setPreviewData] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setError("");
    setHeaders([]);
    setPreviewData([]);

    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      setError("Please upload a valid CSV file.");
      return;
    }

    setFileName(file.name);
    setLoading(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsedData = results.data || [];
        const parsedHeaders = results.meta.fields || [];

        if (!parsedData.length || !parsedHeaders.length) {
          setError("CSV file is empty or invalid.");
          setLoading(false);
          return;
        }

        setHeaders(parsedHeaders);
        setPreviewData(parsedData.slice(0, 5));

        localStorage.setItem("csvData", JSON.stringify(parsedData));
        localStorage.setItem("csvHeaders", JSON.stringify(parsedHeaders));
        localStorage.setItem("csvFileName", file.name);

        setLoading(false);
      },
      error: () => {
        setError("Failed to parse CSV file.");
        setLoading(false);
      },
    });
  };

  const handleGenerateReport = () => {
    if (!headers.length) {
      setError("Please upload a CSV file first.");
      return;
    }

    navigate("/report");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("csvData");
    localStorage.removeItem("csvHeaders");
    localStorage.removeItem("csvFileName");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#f7f1e8] px-6 py-8 text-[#1f1a14]">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">AI Data Analyst Dashboard</p>
            <h1 className="text-5xl font-semibold tracking-tight">
              Upload CSV File
            </h1>
            <p className="mt-2 text-gray-600">
              Upload your dataset to generate charts, summaries, and AI-driven
              insights.
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-xl bg-black px-5 py-3 text-sm font-medium text-white"
          >
            Logout
          </button>
        </div>

        <div className="rounded-3xl border border-[#eadfce] bg-[#fbf7f1] p-8 shadow-sm">
          <div className="mb-6">
            <label className="mb-3 block text-lg font-medium">
              Choose CSV File
            </label>

            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="block w-full rounded-xl border border-[#eadfce] bg-white px-4 py-3"
            />
          </div>

          {fileName && (
            <div className="mb-6 rounded-2xl bg-white p-4 text-sm text-gray-700">
              Uploaded file: <span className="font-medium">{fileName}</span>
            </div>
          )}

          {loading && (
            <div className="mb-6 rounded-2xl bg-orange-50 p-4 text-orange-700">
              Parsing CSV file...
            </div>
          )}

          {error && (
            <div className="mb-6 rounded-2xl bg-red-50 p-4 text-red-600">
              {error}
            </div>
          )}

          {headers.length > 0 && (
            <>
              <div className="mb-6 rounded-2xl bg-white p-5">
                <h2 className="mb-3 text-xl font-semibold">Detected Columns</h2>

                <div className="flex flex-wrap gap-3">
                  {headers.map((header) => (
                    <span
                      key={header}
                      className="rounded-full bg-[#f4eadf] px-4 py-2 text-sm"
                    >
                      {header}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-6 rounded-2xl bg-white p-5">
                <h2 className="mb-4 text-xl font-semibold">Preview Data</h2>

                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse overflow-hidden rounded-xl text-sm">
                    <thead>
                      <tr className="bg-[#f4eadf]">
                        {headers.map((header) => (
                          <th
                            key={header}
                            className="border-b border-[#eadfce] px-4 py-3 text-left font-medium"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {previewData.map((row, index) => (
                        <tr key={index} className="border-b border-[#f1e8dc]">
                          {headers.map((header) => (
                            <td key={header} className="px-4 py-3">
                              {row[header]}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          <button
            onClick={handleGenerateReport}
            className="rounded-xl bg-black px-6 py-3 font-medium text-white"
          >
            Generate Report
          </button>
        </div>
      </div>
    </div>
  );
}

export default Upload;

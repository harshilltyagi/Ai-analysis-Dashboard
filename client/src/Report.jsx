import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

const COLORS = [
  "#f08c33",
  "#f6b26b",
  "#d97a1f",
  "#f4c28b",
  "#e8a85d",
  "#c96d14",
];

function Report() {
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const reportRef = useRef(null);

  const [csvData, setCsvData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [fileName, setFileName] = useState("");

  const [loadingReport, setLoadingReport] = useState(true);
  const [reportError, setReportError] = useState("");

  const [question, setQuestion] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  const [summary, setSummary] = useState("Generating AI summary...");
  const [insights, setInsights] = useState([
    "Preparing AI analysis...",
    "Preparing chart recommendations...",
    "Preparing business insights...",
  ]);

  const [recommendations, setRecommendations] = useState([
    "Review top-performing categories.",
    "Optimize pricing of premium products.",
    "Improve stock planning by category trends.",
  ]);

  const [kpis, setKpis] = useState({
    primaryMetricLabel: "Average Price",
    primaryMetricValue: "-",
    secondaryMetricLabel: "Average Stock",
    secondaryMetricValue: "-",
    topCategoryLabel: "Top Category",
    topCategoryValue: "-",
    highestProductLabel: "Highest Product",
    highestProductValue: "-",
  });

  const [mainChartTitle, setMainChartTitle] = useState("AI Suggested Chart");

  useEffect(() => {
    const storedData = localStorage.getItem("csvData");
    const storedHeaders = localStorage.getItem("csvHeaders");
    const storedFileName = localStorage.getItem("csvFileName");

    if (!storedData || !storedHeaders) {
      navigate("/upload");
      return;
    }

    setCsvData(JSON.parse(storedData));
    setHeaders(JSON.parse(storedHeaders));
    setFileName(storedFileName || "Uploaded CSV");
  }, [navigate]);

  const numericColumns = useMemo(() => {
    return headers.filter((col) =>
      csvData.some((row) => !isNaN(parseFloat(row[col]))),
    );
  }, [headers, csvData]);

  const findHeader = (candidates) => {
    if (!headers.length) return null;
    return headers.find((h) =>
      candidates.some((c) => h.toLowerCase().includes(c)),
    );
  };

  const priceColumn = useMemo(
    () =>
      findHeader(["price", "amount", "sales", "revenue", "value"]) ||
      numericColumns[0] ||
      null,
    [headers, numericColumns],
  );

  const stockColumn = useMemo(
    () =>
      findHeader(["stock", "quantity", "qty"]) ||
      numericColumns[1] ||
      numericColumns[0] ||
      null,
    [headers, numericColumns],
  );

  const categoryColumn = useMemo(
    () => findHeader(["category", "type", "group"]) || headers[0] || null,
    [headers],
  );

  const productColumn = useMemo(
    () =>
      findHeader(["name", "product", "item", "title"]) ||
      headers[1] ||
      headers[0] ||
      null,
    [headers],
  );

  const groupAverage = (rows, groupBy, metric) => {
    if (!groupBy || !metric) return [];
    const grouped = {};

    rows.forEach((row) => {
      const key = row[groupBy] || "Unknown";
      const value = parseFloat(row[metric]) || 0;

      if (!grouped[key]) grouped[key] = { total: 0, count: 0 };
      grouped[key].total += value;
      grouped[key].count += 1;
    });

    return Object.entries(grouped)
      .map(([name, obj]) => ({
        name,
        value: Number((obj.total / obj.count).toFixed(2)),
      }))
      .sort((a, b) => b.value - a.value);
  };

  const categoryDistribution = useMemo(() => {
    if (!categoryColumn) return [];
    const grouped = {};

    csvData.forEach((row) => {
      const key = row[categoryColumn] || "Unknown";
      grouped[key] = (grouped[key] || 0) + 1;
    });

    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [csvData, categoryColumn]);

  const priceByCategory = useMemo(() => {
    return groupAverage(csvData, categoryColumn, priceColumn).slice(0, 6);
  }, [csvData, categoryColumn, priceColumn]);

  const stockByCategory = useMemo(() => {
    return groupAverage(csvData, categoryColumn, stockColumn).slice(0, 6);
  }, [csvData, categoryColumn, stockColumn]);

  const computedInsights = useMemo(() => {
    if (!csvData.length) {
      return {
        avgPrice: "-",
        avgStock: "-",
        topCategory: "-",
        highestProduct: "-",
      };
    }

    const avgPrice = priceColumn
      ? (
          csvData.reduce(
            (sum, row) => sum + (parseFloat(row[priceColumn]) || 0),
            0,
          ) / csvData.length
        ).toFixed(2)
      : "-";

    const avgStock = stockColumn
      ? (
          csvData.reduce(
            (sum, row) => sum + (parseFloat(row[stockColumn]) || 0),
            0,
          ) / csvData.length
        ).toFixed(2)
      : "-";

    const topCategory = categoryDistribution[0]?.name || "-";

    let highestProduct = "-";
    if (productColumn && priceColumn) {
      const sorted = [...csvData].sort(
        (a, b) =>
          (parseFloat(b[priceColumn]) || 0) - (parseFloat(a[priceColumn]) || 0),
      );
      highestProduct = sorted[0]?.[productColumn] || "-";
    }

    return { avgPrice, avgStock, topCategory, highestProduct };
  }, [csvData, categoryDistribution, priceColumn, stockColumn, productColumn]);

  useEffect(() => {
    if (!csvData.length) return;

    const runInitialAnalysis = async () => {
      try {
        setLoadingReport(true);
        setReportError("");

        const res = await fetch(`${API_URL}/api/ai/analyze`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            data: csvData,
            headers,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Initial AI analysis failed");
        }

        setSummary(
          data.summary ||
            `This dataset contains ${csvData.length} records. ${computedInsights.topCategory} appears strongest, while ${computedInsights.highestProduct} stands out as the highest-value product.`,
        );

        setInsights(
          data.insights?.length
            ? data.insights
            : [
                `${computedInsights.topCategory} has the strongest presence in the dataset.`,
                `Average price is ${computedInsights.avgPrice} and average stock is ${computedInsights.avgStock}.`,
                `${computedInsights.highestProduct} appears to be the highest-value product.`,
              ],
        );

        setKpis({
          primaryMetricLabel: data.kpis?.primaryMetricLabel || "Average Price",
          primaryMetricValue:
            data.kpis?.primaryMetricValue || `$${computedInsights.avgPrice}`,
          secondaryMetricLabel:
            data.kpis?.secondaryMetricLabel || "Average Stock",
          secondaryMetricValue:
            data.kpis?.secondaryMetricValue || computedInsights.avgStock,
          topCategoryLabel:
            data.kpis?.topCategoryLabel || "Category with Most Products",
          topCategoryValue:
            data.kpis?.topCategoryValue || computedInsights.topCategory,
          highestProductLabel: "Highest Product",
          highestProductValue: computedInsights.highestProduct,
        });

        setRecommendations([
          `Focus promotion strategy around ${computedInsights.topCategory}.`,
          `Review premium pricing and demand for ${computedInsights.highestProduct}.`,
          `Optimize stock planning using category-level inventory trends.`,
        ]);

        setMainChartTitle(data.chart?.title || "Average Price by Category");
      } catch (error) {
        setReportError(error.message);
      } finally {
        setLoadingReport(false);
      }
    };

    runInitialAnalysis();
  }, [API_URL, csvData, headers, computedInsights]);

  const handleAskAI = async () => {
    try {
      setAiLoading(true);
      setAiError("");

      const res = await fetch(`${API_URL}/api/ai/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question,
          data: csvData,
          headers,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "AI follow-up failed");
      }

      if (data.answer) {
        setSummary(data.answer);
      }

      if (data.insights?.length) {
        setInsights(data.insights);
      }

      const nextRecommendations = [];

      if (data.answer) {
        nextRecommendations.push(`Act on this finding: ${data.answer}`);
      }

      if (data.insights?.[0]) {
        nextRecommendations.push(`Priority insight: ${data.insights[0]}`);
      }

      if (data.insights?.[1]) {
        nextRecommendations.push(
          `Review business impact of: ${data.insights[1]}`,
        );
      }

      setRecommendations(
        nextRecommendations.length
          ? nextRecommendations
          : [
              "Review the latest AI answer for actionable next steps.",
              "Compare top categories and price patterns.",
              "Use follow-up questions to dig deeper into the dataset.",
            ],
      );
    } catch (error) {
      setAiError(error.message);
    } finally {
      setAiLoading(false);
    }
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
    <div className="min-h-screen bg-[#f7f1e8] text-[#1f1a14]">
      <div className="mx-auto max-w-7xl px-6 py-8" ref={reportRef}>
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-5xl font-semibold">Analytics Overview</h1>
            <p className="mt-2 text-gray-500">
              AI-powered business insights from uploaded CSV data.
            </p>
            <p className="mt-2 text-sm text-gray-500">{fileName}</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate("/upload")}
              className="rounded-xl bg-white px-4 py-3 shadow-sm"
            >
              Back
            </button>

            <button
              onClick={handleLogout}
              className="rounded-xl bg-black px-5 py-3 text-white"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="mb-8 rounded-3xl bg-white p-6 shadow-sm">
          <h3 className="text-2xl font-semibold">Ask AI</h3>
          <p className="mt-2 text-sm text-gray-500">
            Example: Which category has highest stock? What should I focus on?
            Top 5 expensive products?
          </p>

          <div className="mt-4 flex flex-col gap-3 md:flex-row">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask question about your dataset..."
              className="flex-1 rounded-xl border border-[#eadfce] px-4 py-3 outline-none"
            />

            <button
              onClick={handleAskAI}
              disabled={aiLoading || !question.trim()}
              className="rounded-xl bg-black px-6 py-3 text-white disabled:opacity-60"
            >
              {aiLoading ? "Analyzing..." : "Ask AI"}
            </button>
          </div>

          {aiError && <p className="mt-3 text-sm text-red-600">{aiError}</p>}
        </div>

        {loadingReport && (
          <div className="mb-8 rounded-3xl bg-white p-6 shadow-sm text-gray-600">
            Reading CSV... Analyzing columns... Generating insights...
          </div>
        )}

        {reportError && (
          <div className="mb-8 rounded-3xl bg-red-50 p-6 text-red-600 shadow-sm">
            {reportError}
          </div>
        )}

        <div className="mb-8 grid gap-5 md:grid-cols-4">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">{kpis.primaryMetricLabel}</p>
            <h3 className="mt-3 text-4xl font-semibold">
              {kpis.primaryMetricValue}
            </h3>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">{kpis.secondaryMetricLabel}</p>
            <h3 className="mt-3 text-4xl font-semibold">
              {kpis.secondaryMetricValue}
            </h3>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">{kpis.topCategoryLabel}</p>
            <h3 className="mt-3 text-4xl font-semibold">
              {kpis.topCategoryValue}
            </h3>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">{kpis.highestProductLabel}</p>
            <h3 className="mt-3 text-3xl font-semibold">
              {kpis.highestProductValue}
            </h3>
          </div>
        </div>

        <div className="mb-8 rounded-3xl bg-white p-6 shadow-sm">
          <h3 className="text-2xl font-semibold">AI Summary</h3>
          <p className="mt-4 text-gray-700 leading-7">{summary}</p>
        </div>

        <div className="mb-8 grid gap-5 lg:grid-cols-3">
          <div className="rounded-3xl bg-white p-6 shadow-sm lg:col-span-2">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-semibold">{mainChartTitle}</h3>
                <p className="text-sm text-gray-500">
                  AI-selected business view of the dataset
                </p>
              </div>

              <span className="rounded-full bg-[#fff1e5] px-3 py-1 text-sm text-[#f08c33]">
                AI Active
              </span>
            </div>

            <div className="h-[360px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priceByCategory}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#f08c33" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h3 className="text-2xl font-semibold">AI Insights</h3>

            <div className="mt-5 space-y-4">
              {insights.map((item, index) => (
                <div
                  key={index}
                  className="rounded-2xl bg-[#f7f1e8] p-4 text-sm text-gray-700"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-8 grid gap-5 lg:grid-cols-2">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-2xl font-semibold">
              Average Stock by Category
            </h3>
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stockByCategory}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#d97a1f" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-2xl font-semibold">
              Category Distribution
            </h3>
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryDistribution}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={100}
                  >
                    {categoryDistribution.map((item, index) => (
                      <Cell
                        key={item.name}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h3 className="text-2xl font-semibold">AI Recommendations</h3>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {recommendations.map((item, index) => (
              <div
                key={index}
                className="rounded-2xl bg-[#f7f1e8] p-4 text-sm text-gray-700"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Report;

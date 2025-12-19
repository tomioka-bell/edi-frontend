import { useEffect, useState } from "react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Select } from "antd";
import apiBaseClient from "../../utils/api-base-client";
import StatusRow from "./status-row";

const { Option } = Select;

// ---------- API response types ----------

type NumberCountSummaryResponse = {
  forecast: number;
  order: number;
  invoice: number;
};

type StatusCounts = {
  new_count: number;
  confirm_count: number;
  reject_count: number;
  approved_count: number;
  total_count: number;
};

type StatusTotalSummaryResponse = {
  forecast: StatusCounts;
  order: StatusCounts;
  invoice: StatusCounts;
};

type MonthlyStatusItem = {
  year: number;
  month: number;
  new_count: number;
  confirm_count: number;
  reject_count: number;
  approved_count: number;
  total_count: number;
};

type MonthlyStatusSummaryResponse = {
  forecast: MonthlyStatusItem[];
  order: MonthlyStatusItem[];
  invoice: MonthlyStatusItem[];
};

type MonthlyChartPoint = {
  month: string;
  total: number;
  newCount: number;
  confirmCount: number;
  rejectCount: number;
  approvedCount: number;
  avgConfirmationHours: number;
};

type VendorCountResponse = {
  vendor: number;
};

type DocType = "forecast" | "order" | "invoice";

interface ApiError extends Error {
  message: string;
}

export default function GraphData() {
  const [numberSummary, setNumberSummary] =
    useState<NumberCountSummaryResponse | null>(null);
  const [statusTotals, setStatusTotals] =
    useState<StatusTotalSummaryResponse | null>(null);

  const [monthlyRaw, setMonthlyRaw] =
    useState<MonthlyStatusSummaryResponse | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyChartPoint[]>([]);

  const [vendorCount, setVendorCount] = useState<number | null>(null);
  const [docType, setDocType] = useState<DocType>("forecast"); // 👈 dropdown state

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ---------- Fetch data from APIs ----------
  useEffect(() => {
    const fetchData = async () => {
      try {
        const baseUrl = `/api/summary-data`;

        const [numberRes, statusRes, monthlyRes, vendorRes] = await Promise.all([
          apiBaseClient.get(`${baseUrl}/get-number-count-summary`),
          apiBaseClient.get(`${baseUrl}/get-status-total-summary`),
          apiBaseClient.get(`${baseUrl}/get-monthly-status-summary`),
          apiBaseClient.get(`${baseUrl}/count-vendor`),
        ]);

        const numberData = numberRes.data as NumberCountSummaryResponse;
        const statusData = statusRes.data as StatusTotalSummaryResponse;
        const monthlyStatusData = monthlyRes.data as MonthlyStatusSummaryResponse;
        const vendorData = vendorRes.data as VendorCountResponse;

        setNumberSummary(numberData);
        setStatusTotals(statusData);
        setMonthlyRaw(monthlyStatusData);
        setVendorCount(vendorData.vendor);
        setLoading(false);
      } catch (err) {
        const error = err as ApiError;
        console.error(error);
        setError(error.message || "Unknown error");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ---------- สร้าง data สำหรับกราฟ ตาม docType ที่เลือก ----------
  useEffect(() => {
    if (!monthlyRaw) return;

    let source: MonthlyStatusItem[] = [];

    if (docType === "forecast") {
      source = monthlyRaw.forecast ?? [];
    } else if (docType === "order") {
      source = monthlyRaw.order ?? [];
    } else {
      source = monthlyRaw.invoice ?? [];
    }

    const chartData: MonthlyChartPoint[] = source
      .slice()
      .sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.month - b.month;
      })
      .map((m) => ({
        month: `${m.year}-${String(m.month).padStart(2, "0")}`,
        total: m.total_count,
        newCount: m.new_count,
        confirmCount: m.confirm_count,
        rejectCount: m.reject_count,
        approvedCount: m.approved_count,
        avgConfirmationHours: 0,
      }));

    setMonthlyData(chartData);
  }, [monthlyRaw, docType]);

  if (loading) {
    return <div className="text-sm text-slate-500">Loading summary...</div>;
  }

  if (error || !numberSummary || !statusTotals || vendorCount === null) {
    return (
      <div className="text-sm text-red-500">
        Failed to load summary data: {error}
      </div>
    );
  }

  // ---------- รวมจำนวนเอกสาร & สถานะจากทั้ง 3 ประเภท (ใช้ใน Summary cards + Breakdown) ----------

  const totalForecastDocs = numberSummary.forecast;
  const totalOrderDocs = numberSummary.order;
  const totalInvoiceDocs = numberSummary.invoice;
  const totalAllDocs = totalForecastDocs + totalOrderDocs + totalInvoiceDocs;

  const totalNew =
    statusTotals.forecast.new_count +
    statusTotals.order.new_count +
    statusTotals.invoice.new_count;

  const totalConfirm =
    statusTotals.forecast.confirm_count +
    statusTotals.order.confirm_count +
    statusTotals.invoice.confirm_count;

  const totalReject =
    statusTotals.forecast.reject_count +
    statusTotals.order.reject_count +
    statusTotals.invoice.reject_count;

  const totalApproved =
    statusTotals.forecast.approved_count +
    statusTotals.order.approved_count +
    statusTotals.invoice.approved_count;

  const docTypeLabel: Record<DocType, string> = {
    forecast: "Forecast",
    order: "Order",
    invoice: "Invoice",
  };

  return (
    <div className="w-full space-y-6">
      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">
        <div className="rounded-2xl border card-root p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Total Documents
          </p>
          <p className="mt-2 text-2xl font-semibold text-root">
            {totalAllDocs.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-emerald-600">
            from / get-number-count-summary
          </p>
        </div>

        <div className="rounded-2xl border card-root p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Active Vendors
          </p>
          <p className="mt-2 text-2xl font-semibold text-root">
            {vendorCount.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-sky-600">
            from /count-vendor
          </p>
        </div>

        <div className="rounded-2xl border card-root p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            New (All Documents)
          </p>
          <p className="mt-2 text-2xl font-semibold text-amber-600">
            {totalNew.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Sum of forecast + order + invoice
          </p>
        </div>

        <div className="card-root rounded-2xl border p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Confirm / Approved (All Documents)
          </p>

          <div className="mt-2 flex items-baseline gap-4">
            <div>
              <p className="text-xs text-slate-500">Confirm</p>
              <p className="text-lg font-semibold text-blue-600">
                {totalConfirm.toLocaleString()}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">Approved</p>
              <p className="text-lg font-semibold text-green-500">
                {totalApproved.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts area */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Monthly transactions (selected doc type) */}
        <div className="lg:col-span-2 card-root rounded-2xl border p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900">
                Monthly Transactions – {docTypeLabel[docType]}
              </p>
              <p className="text-xs text-slate-500">
                Total & status by month (from /get-monthly-status-summary)
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Document type:</span>
              <Select
                size="small"
                value={docType}
                onChange={(value) => setDocType(value as DocType)}
                style={{ width: 140 }}
              >
                <Option value="forecast">Forecast</Option>
                <Option value="order">Order</Option>
                <Option value="invoice">Invoice</Option>
              </Select>
            </div>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 12 }}
                  stroke="#0f172a"
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 11 }}
                  stroke="#64748b"
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    borderColor: "#e2e8f0",
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />

                {/* Total */}
                <Bar
                  yAxisId="left"
                  dataKey="total"
                  name="Total"
                  barSize={20}
                  fill="#e2e8f0"
                  radius={[6, 6, 0, 0]}
                />

                {/* Stack by status */}
                <Bar
                  yAxisId="left"
                  dataKey="newCount"
                  name="New"
                  stackId="status"
                  barSize={16}
                  fill="#fbbf24"
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  yAxisId="left"
                  dataKey="confirmCount"
                  name="Confirm"
                  stackId="status"
                  barSize={16}
                  fill="#38bdf8"
                />
                <Bar
                  yAxisId="left"
                  dataKey="rejectCount"
                  name="Reject"
                  stackId="status"
                  barSize={16}
                  fill="#f97373"
                />
                <Bar
                  yAxisId="left"
                  dataKey="approvedCount"
                  name="Approved"
                  stackId="status"
                  barSize={16}
                  fill="#a855f7"
                />

                {/* เส้น avg (ตอนนี้ยังเป็น 0 ทั้งหมด แต่เผื่ออนาคต) */}
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="avgConfirmationHours"
                  name="Avg Confirm Time (hrs)"
                  stroke="#16a34a"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status breakdown card (ยังเป็นรวมทุก doc เหมือนเดิม) */}
        <div className="rounded-2xl border card-root p-4 shadow-sm">
          <p className="text-sm font-medium text-root">
            Status Breakdown (All Documents)
          </p>
          <p className="mb-3 text-xs text-slate-500">
            from /get-status-total-summary
          </p>

          <div className="space-y-3">
            <StatusRow
              label="New"
              value={totalNew}
              colorClass="bg-amber-100 text-amber-700"
            />
            <StatusRow
              label="Confirm"
              value={totalConfirm}
              colorClass="bg-sky-100 text-sky-700"
            />
            <StatusRow
              label="Reject"
              value={totalReject}
              colorClass="bg-rose-100 text-rose-700"
            />
            <StatusRow
              label="Approved"
              value={totalApproved}
              colorClass="bg-indigo-100 text-indigo-700"
            />
          </div>

          <div className="mt-4 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-500">
            Total documents (all types):{" "}
            <span className="font-semibold text-slate-900">
              {totalAllDocs.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import type { OrderByForecaset } from "../../types/order-data";
import { fmtDate, statusColor } from "../../utils/format";
import apiBaseClient from "../../utils/api-base-client";
import { GrAdd } from "react-icons/gr";
import OrderModalAdd from "./add-order"
import { useNavigate } from "react-router-dom";
import { useUser } from "../../contexts/useUserHook";


interface OrdersTableProps {
  numberForecast: string;
  vendorCode: string;
}

export default function OrdersTable({ numberForecast, vendorCode }: OrdersTableProps) {
  const [logs, setLogs] = useState<OrderByForecaset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalAddOpen, setIsModalAddOpen] = useState(false);
  const navigate = useNavigate();
   const { user } = useUser();

  console.log("Number Forecast", error)

  useEffect(() => {
    if (!numberForecast) return;

    setLoading(true);
    setError(null);

    apiBaseClient.get(
      `/api/orders/get-order-by-forecaset?number_forecast=${numberForecast}`
    )
      .then((res) => {
        const data = (res.data) as OrderByForecaset[];
        setLogs(data || []);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message || "Error loading status logs");
      })
      .finally(() => setLoading(false));
  }, [numberForecast]);

  const latestLog = useMemo(() => {
    if (!logs.length) return null;
    return [...logs].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0];
  }, [logs]);

  const numberOrder = latestLog?.number_order ?? "-";
  const statusOrder = latestLog?.status_order ?? "-";
 
  return (
    <div className="w-full mx-auto">
         {user?.source_system === "APP_EMPLOYEE" && (
      <div className="flex justify-end mb-2">
        <button style={{ color: "white", fontSize: "14px" }} onClick={() => setIsModalAddOpen(true)} className="flex items-center gap-2 bg-[#08a4b8] hover:bg-[#0893a5]
                        text-sm font-semibold text-white px-5 py-2.5 rounded-full shadow-md
                        hover:shadow-lg active:scale-[0.97] transition-all duration-200">
          <GrAdd className="w-4 h-4 hover:animate-spin" />
          Add Order
        </button>
      </div>
      )}

      <OrderModalAdd isOpen={isModalAddOpen} onClose={() => setIsModalAddOpen(false)} vendorCode={vendorCode} numberForecast={numberForecast} />

      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-200 bg-neutral-50 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-neutral-900">
            Associated Order
          </h3>
          <div className="flex items-center gap-3">
            {loading && (
              <span className="text-xs text-neutral-500">Loading...</span>
            )}
          
          </div>
        </div>

        <div className="overflow-x-auto">
          {latestLog && (
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Created On
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Note
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                <tr   onClick={() => navigate(`/en/order-form/${numberOrder}`)} className=" transition-colors hover:bg-cyan-50">
                  {/* Created On */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-neutral-900">
                        {fmtDate(latestLog.created_at)}
                      </span>
                    </div>
                  </td>

                  {/* Type */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-neutral-900">{statusOrder}</span>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ring-1 ${statusColor(
                        statusOrder
                      )}`}
                    >
                      {statusOrder}
                    </span>
                  </td>

                  {/* Note */}
                  <td className="px-6 py-4">
                    <div className="text-sm text-neutral-900 max-w-xs">
                      {numberOrder}
                    </div>
                  </td>


                </tr>
              </tbody>
            </table>
          )}
        </div>

        {!loading && !latestLog && (
          <div className="px-6 py-4 text-sm text-neutral-500">
            No status log found for this forecast .
          </div>
        )}
      </div>

    </div>
  );
}

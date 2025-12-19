import { useEffect, useState } from "react";
import apiBaseClient from "../../utils/api-base-client";
import { buildImageURL } from "../../utils/get-image";
import { getInitialsFromName, fmtDate, statusColor } from "../../utils/format";
import { Avatar } from "antd";
import { MailOutlined, ClockCircleOutlined } from "@ant-design/icons";
import type {
    InvoicestatusLog,
} from "../../types/invoices-status";

// import ForecastTable from "./forecast-table";

interface invoicesStatusLogsProps {
    invoiceVersionId: string;
}

export default function InvoicesStatusLogs({
    invoiceVersionId,
}: invoicesStatusLogsProps) {
    const [data, setData] = useState<InvoicestatusLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!invoiceVersionId) return;

        async function fetchStatusLog() {
            try {
                setLoading(true);
                setError(null);

                const res = await apiBaseClient.get(
                    `/api/invoice/get-status-log-by-version-id/${invoiceVersionId}`
                );

                const json = res.data;

                const logs: InvoicestatusLog[] = Array.isArray(json)
                    ? json
                    : json?.data && Array.isArray(json.data)
                        ? json.data
                        : [];

                setData(logs);
            } catch (err) {
                const error = err as Error;
                console.error("Failed to fetch status log:", error);
                setError(error.message ?? "An error occurred while loading status data.");
            } finally {
                setLoading(false);
            }
        }

        fetchStatusLog();
    }, [invoiceVersionId]);

    if (!invoiceVersionId) {
        return (
            <div className="text-sm text-gray-500">Code not found Forecast Version</div>
        );
    }

    if (loading) {
        return (
            <div className="text-sm text-gray-500">Loading status information...</div>
        );
    }

    if (error) {
        return <div className="text-sm text-red-500">{error}</div>;
    }

    if (!data || data.length === 0) {
        return (
            <div className="text-sm text-gray-500"></div>
        );
    }

    return (
        <div className="space-y-3 mt-4">
            {data.map((log) => {
                const createdAtLabel = fmtDate
                    ? fmtDate(log.created_at)
                    : new Date(log.created_at).toLocaleString();

                const user = log.changed_by_user || null;
                const imageURL = user?.profile
                    ? buildImageURL(user.profile)
                    : undefined;
                return (
                    <div>
                        {/* <ForecastTable log={log}/> */}
                        <div
                            key={`${log.edi_invoice_version_id}-${log.created_at}-${log.new_status}`}
                            className="flex items-start gap-4 p-4 rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all duration-300"
                        >
                            {/* Avatar ผู้เปลี่ยนสถานะ */}
                            <Avatar
                                className="shadow-lg shadow-[#08a4b8]/30 transition-all duration-300 shrink-0"
                                style={{
                                    background:
                                        "linear-gradient(135deg, #08a4b8 0%, #06849a 100%)",
                                    border: "2px solid rgba(8, 164, 184, 0.3)",
                                }}
                                size={50}
                            >
                                {imageURL ? (
                                    <img
                                        className="w-full h-full object-cover rounded-full"
                                        src={imageURL}
                                        alt={user?.display_name ?? ""}
                                        onError={(e) => {
                                            (e.currentTarget as HTMLImageElement).style.display =
                                                "none";
                                            const span = document.createElement("span");
                                            span.className =
                                                "font-semibold text-base text-white";
                                            span.textContent = getInitialsFromName(
                                                user?.display_name
                                            );
                                            e.currentTarget.parentElement?.appendChild(span);
                                        }}
                                    />
                                ) : (
                                    <span className="font-semibold text-base text-white">
                                        {getInitialsFromName(user?.display_name)}
                                    </span>
                                )}
                            </Avatar>

                            <div className="flex-1 flex flex-col justify-center">
                                <div className="font-semibold text-gray-900 text-lg">
                                    {user ? user.display_name : "-"}
                                    <span className="text-gray-600 text-sm ml-2">
                                        ({user ? user.group : "-"})
                                    </span>
                                </div>

                                <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                                    {user?.email ? (
                                        <a
                                            href={`mailto:${user.email}`}
                                            className="inline-flex items-center gap-1 hover:text-[#08a4b8] transition-colors"
                                        >
                                            <MailOutlined />
                                            <span>{user.email}</span>
                                        </a>
                                    ) : (
                                        <span className="inline-flex items-center gap-1">
                                            <MailOutlined />
                                            <span>-</span>
                                        </span>
                                    )}

                                    <span className="inline-flex items-center gap-1">
                                        <ClockCircleOutlined />
                                        <span>{createdAtLabel}</span>
                                    </span>
                                </div>

                                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                                    <span className="text-xs font-medium text-slate-500">
                                        Status change:
                                    </span>
                                    <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                                        {log.old_status}
                                    </span>
                                    <span className="text-xs text-gray-400">→</span>

                                    <span className={[
                                        "rounded-full px-2.5 py-1 text-xs ring-1",
                                        statusColor(log.new_status),
                                    ].join(" ")}>
                                        {log.new_status} 
                                    </span>
                                </div>

                                <div className="mt-2 text-sm text-slate-700 bg-slate-50 rounded-xl px-3 py-2 border border-slate-100 shadow-inner max-w-fit">
                                    <span className="font-medium text-[#08a4b8] mr-2">
                                        Note :
                                    </span>
                                    {log.note || "-"}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

import * as React from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "../../layouts/layout";
import FancyLoader from "../../utils/fancy-loader";
import type { OrderDetailResp } from "../../types/orders-form";
import { HiOutlineDocumentText } from "react-icons/hi2";
import { Avatar, Select } from "antd";
import { MailOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { buildImageURL } from "../../utils/get-image";
import { fmtDate, statusColor, getInitialsFromName } from "../../utils/format";
import apiBaseClient from "../../utils/api-base-client";
import { ArrowLeft } from 'lucide-react';
import { GrCheckmark, GrEdit } from "react-icons/gr";
import OrdersStatusLogs from "./orders-status-logs";
import OrderConfirmModal from "./orders-confirm-modal";
import OrdersTable from "./orders-table";
import ViewFile from "./view-file";
import { useUser } from "../../contexts/useUserHook";
import OrdersVersionAdd from "./orders-version-add";
import ForecastTable from "./forecast-table";
import InvoiceTable from "./invoice-table";


export default function OrderFormPage() {
    const { number } = useParams<{ number: string }>();
    const [data, setData] = React.useState<OrderDetailResp | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [selectedVersionNo, setSelectedVersionNo] = React.useState<number>(1);
    const { user } = useUser();
    const active = data?.versions?.find(v => v.is_active);
    window.dispatchEvent(new Event("notif:changed"));

    const reloadOrder = React.useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const res = await apiBaseClient.get(`/api/orders/get-order-detail-by-number?number_order=${number}`);

            const json: OrderDetailResp = res.data;

            json.versions = [...(json.versions ?? [])].sort(
                (a, b) => (b.version_no ?? 0) - (a.version_no ?? 0)
            );

            setData(json);

            const allNos = (json.versions ?? [])
                .map(v => v.version_no)
                .filter((n): n is number => typeof n === "number");

            if (active) {
                setSelectedVersionNo(active.version_no!);
            } else {
                const max = Math.max(...allNos);
                setSelectedVersionNo(max);
            }
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "เกิดข้อผิดพลาดในการโหลดข้อมูล");
        } finally {
            setLoading(false);
        }
    }, [number]);

    React.useEffect(() => {
        reloadOrder();
    }, [reloadOrder]);

    const selectedVersion = React.useMemo(() => {
        if (!data?.versions || data.versions.length === 0) return null;
        const byNo = data.versions.find(v => v.version_no === selectedVersionNo);
        if (byNo) return byNo;
        const sortedAsc = [...data.versions].sort(
            (a, b) => (a.version_no ?? 0) - (b.version_no ?? 0)
        );
        return sortedAsc[0] ?? null;
    }, [data, selectedVersionNo]);

    const creator = selectedVersion?.created_by;
    const imageURL = creator?.profile ? buildImageURL(creator?.profile ?? "") : undefined;

    const versionOptions =
        data?.versions?.length
            ? [...data.versions]
                .sort((a, b) => (a.version_no ?? 0) - (b.version_no ?? 0))
                .map(v => ({
                    label: `v${v.version_no}${v.is_active ? " • ACTIVE" : ""}`,
                    value: v.version_no!,
                }))
            : [];

    const [isModalVisible, setIsModalVisible] = React.useState(false);
    const [isVersionModalVisible, setIsVersionModalVisible] = React.useState(false);

    const showModal = () => {
        setIsModalVisible(true);
    };

    const showVersionModal = () => {
        setIsVersionModalVisible(true);
    };

    const handleOk = async () => {
        setIsModalVisible(false);
        await reloadOrder();
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const handleVersionCancel = () => {
        setIsVersionModalVisible(false);
    };


    React.useEffect(() => {
        if (!data) return;
        if (user?.source_system === "APP_EMPLOYEE") return;

        const orderId = data.edi_order_id;
        const alreadyRead = data.read_order;

        if (!orderId) return;

        const markAsRead = async () => {
            if (alreadyRead) return;

            try {
                await apiBaseClient.patch(`/api/orders/mark-order-as-read/${orderId}`);
                setData(prev => prev ? { ...prev, read_order: true } : prev);

            } catch (err) {
                console.error("Error mark-read-order", err);
            }
        };

        markAsRead();
    }, [data, user]);


    return (
        <Layout>
            <OrderConfirmModal edi_order_id={data?.edi_order_id ?? ""} edi_order_version_id={selectedVersion?.edi_order_version_id ?? ""}
                status_order={data?.status_order ?? ""} visible={isModalVisible} onOk={handleOk} onCancel={handleCancel} createdbyexternalID={user?.external_id} source_system={user?.source_system} />
            <OrdersVersionAdd ediOrderId={data?.edi_order_id ?? ""} visible={isVersionModalVisible} onOk={handleOk} onCancel={handleVersionCancel} />
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-start gap-4 pb-2">
                    <div className="relative w-12 h-12 card-root rounded-2xl flex items-center justify-center shadow-lg">
                        <HiOutlineDocumentText className="w-5 h-5 text-root" />
                    </div>

                    <div className="flex flex-col">
                        <h1 className="text-2xl font-semibold text-root">
                            Order Form{" "}
                            <span className="text-[#08a4b8]">#{number}</span>
                        </h1>

                        <p className="text-sm text-gray-500">
                            From {data?.created_at ? new Date(data.created_at).toLocaleDateString("th-TH") : "-"}
                        </p>
                        <p className="text-sm text-[#08a4b8]">
                            Note: <span className="text-gray-500">{selectedVersion?.note || "-"}</span>
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex justify-between mb-2">
                <Link
                    to="/en/orders"
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50"
                >
                    <ArrowLeft className="h-4 w-4" />
                    back
                </Link>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => {
                            showModal();
                        }}
                        style={{ color: "white", fontSize: "14px" }}
                        className="inline-flex items-center gap-2 rounded-lg border border-green-500 bg-green-400 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:border-slate-300 hover:bg-green-500"
                    >
                        <GrCheckmark className="h-4 w-4" />
                        Confirm Order
                    </button>

                    {user?.source_system === "APP_EMPLOYEE" && (
                        <button
                            onClick={() => {
                                showVersionModal();
                            }}
                            style={{ color: "white", fontSize: "14px" }}
                            className="inline-flex items-center gap-2 rounded-lg border border-orange-500 text-white bg-orange-400 px-4 py-2 text-sm font-medium transition-all duration-200 hover:border-slate-300 hover:bg-orange-500"
                        >
                            <GrEdit className="h-4 w-4" />
                            Modify
                        </button>
                    )}
                </div>
            </div>

            {loading ? (
                <FancyLoader />
            ) : error ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
                    Error: {error}
                </div>
            ) : !data ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600">
                    No data found
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Header Card */}
                    <div className="rounded-2xl border card-root p-6 shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-700 shadow-inner">
                                    <span className="text-xl font-bold">
                                        {data.number_order?.slice(0, 2) || "OR"}
                                    </span>
                                </div>
                                <div>
                                    <div className="text-sm text-slate-500">Order No.</div>
                                    <div className="text-lg font-semibold text-root">
                                        {data.number_order}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="rounded-xl border border-slate-100 p-4">
                                <div className="text-xs text-slate-500">Vendor</div>
                                <div className="mt-1 font-medium text-root">
                                    {data.vendor_code}
                                </div>
                            </div>
                            <div className="rounded-xl border border-slate-100 p-4">
                                <div className="text-xs text-slate-500">Number Forecast</div>
                                <div className="mt-1 font-medium text-[#08a4b8]">
                                    {data.number_forecast ?? "-"}
                                </div>
                            </div>
                            <div className="rounded-xl border border-slate-100 p-4">
                                <div className="text-xs text-slate-500">Created At</div>
                                <div className="mt-1 font-medium text-root">
                                    {fmtDate(data.created_at)}
                                </div>
                            </div>

                        </div>
                        {/* Versions (เลือกดูทีละเวอร์ชันผ่าน dropdown) */}
                        <div className="pt-10">
                            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                                <h2 className="text-lg font-semibold text-root">
                                    Versions ({data.versions?.length ?? 0})
                                </h2>

                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-root">Select Version :</span>
                                    <Select
                                        size="middle"
                                        className="min-w-36"
                                        value={selectedVersionNo}
                                        options={versionOptions}
                                        onChange={(val) => setSelectedVersionNo(val)}
                                    />
                                </div>
                            </div>

                            {(!data.versions || data.versions.length === 0) && (
                                <div className="rounded-xl border border-slate-100 bg-slate-50 p-6 text-center text-slate-600">
                                    ยังไม่มีเวอร์ชัน
                                </div>
                            )}
                            {selectedVersion && (
                                <div
                                    className={[
                                        "rounded-xl border p-6 transition-all duration-200",
                                        selectedVersion.is_active
                                            ? "border-cyan-300 bg-cyan-50/50 ring-2 ring-cyan-200 shadow-sm"
                                            : "border-slate-200 bg-white shadow-sm",
                                    ].join(" ")}
                                >
                                    {/* Header Section */}
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-200">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="inline-flex items-center rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white">
                                                v {selectedVersion.version_no}
                                            </span>

                                            <span
                                                className={[
                                                    "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1",
                                                    statusColor(selectedVersion.status_order),
                                                ].join(" ")}
                                            >
                                                {selectedVersion.status_order || "-"}
                                            </span>

                                            {selectedVersion.is_active && (
                                                <span className="inline-flex items-center rounded-full bg-cyan-500 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                                                    ACTIVE
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                />
                                            </svg>
                                            <span>Created: {fmtDate(selectedVersion.created_at)}</span>
                                        </div>
                                    </div>

                                    {/* Content Section */}
                                    <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
                                        {/* Period From */}
                                        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 transition-all hover:border-slate-300 hover:shadow-sm">
                                            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                                                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                    />
                                                </svg>
                                                Period From
                                            </div>
                                            <div className="text-base font-semibold text-slate-900">
                                                {fmtDate(selectedVersion.period_from)}
                                            </div>
                                        </div>

                                        {/* Period To */}
                                        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 transition-all hover:border-slate-300 hover:shadow-sm">
                                            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                                                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                    />
                                                </svg>
                                                Period To
                                            </div>
                                            <div className="text-base font-semibold text-slate-900">
                                                {fmtDate(selectedVersion.period_to)}
                                            </div>
                                        </div>

                                        {/* Created At (detail) */}
                                        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 transition-all hover:border-slate-300 hover:shadow-sm">
                                            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                                                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                    />
                                                </svg>
                                                Created At
                                            </div>
                                            <div className="text-base font-semibold text-slate-900">
                                                {selectedVersion.created_at == null ? "-" : fmtDate(selectedVersion.created_at)}
                                            </div>
                                        </div>

                                        {/* Note */}
                                        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 transition-all hover:border-slate-300 hover:shadow-sm lg:col-span-1 md:col-span-2">
                                            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                                                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                                                    />
                                                </svg>
                                                Note
                                            </div>
                                            {selectedVersion.note ? (
                                                <p className="text-sm text-slate-900 leading-relaxed max-h-32 overflow-y-auto">
                                                    {selectedVersion.note}
                                                </p>
                                            ) : (
                                                <span className="text-xs text-slate-400">-</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div>
                                        <ViewFile file_url={selectedVersion.source_file_url} number_order={data?.number_order} />
                                    </div>
                                </div>
                            )}

                            <div className="py-8">
                                <OrdersTable versionId={data?.edi_order_id || ""} number={data.number_order} />
                            </div>

                            <div className="py-8">
                                <ForecastTable numberForecast={data.number_forecast || ""} />
                            </div>

                            <div className="py-8">
                                <InvoiceTable numberOrder={data?.number_order || ""} />
                            </div>

                            <div>
                                <hr className="w-48 h-1 mx-auto my-6 bg-gray-200 border-0 rounded-sm"></hr>
                            </div>

                            <h2 className="text-lg font-semibold text-slate-900">
                                Activity
                            </h2>

                            <div className="mt-8 flex items-center gap-4 p-4 rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all duration-300">
                                {/* Avatar ผู้สร้าง */}
                                <Avatar
                                    className="shadow-lg shadow-[#08a4b8]/30 transition-all duration-300 shrink-0"
                                    style={{
                                        background: "linear-gradient(135deg, #08a4b8 0%, #06849a 100%)",
                                        border: "2px solid rgba(8, 164, 184, 0.3)",
                                    }}
                                    size={50}
                                >
                                    {imageURL ? (
                                        <img
                                            className="w-full h-full object-cover rounded-full"
                                            src={imageURL}
                                            alt={creator?.display_name ?? ""}
                                            onError={(e) => {
                                                (e.currentTarget as HTMLImageElement).style.display = "none";
                                                const span = document.createElement("span");
                                                span.className = "font-semibold text-base text-white";
                                                span.textContent = getInitialsFromName(
                                                    creator?.display_name,
                                                );
                                                e.currentTarget.parentElement?.appendChild(span);
                                            }}
                                        />
                                    ) : (
                                        <span className="font-semibold text-base text-white">
                                            {getInitialsFromName(creator?.display_name)}
                                        </span>
                                    )}
                                </Avatar>

                                {/* ข้อมูลรายละเอียด */}
                                <div className="flex flex-col justify-center">
                                    {/* บรรทัดบน: ชื่อผู้สร้าง */}
                                    <div className="font-semibold text-gray-900 text-lg">
                                        {creator ? creator.display_name : "-"}
                                        <span className="text-gray-600 text-sm ml-2">
                                            ( {creator ? creator.group : "-"} )
                                        </span>
                                    </div>

                                    {/* Email และวันที่ */}
                                    <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                                        {creator?.email ? (
                                            <a
                                                href={`mailto:${creator.email}`}
                                                className="inline-flex items-center gap-1 hover:text-[#08a4b8] transition-colors"
                                            >
                                                <MailOutlined />
                                                <span>{creator.email}</span>
                                            </a>
                                        ) : (
                                            <span className="inline-flex items-center gap-1">
                                                <MailOutlined />
                                                <span>-</span>
                                            </span>
                                        )}

                                        <span className="inline-flex items-center gap-1">
                                            <ClockCircleOutlined />
                                            <span>{fmtDate(selectedVersion?.created_at)}</span>
                                        </span>
                                    </div>

                                    {/* Note */}
                                    <div className="mt-2 text-sm text-slate-700 bg-slate-50 rounded-xl px-3 py-2 border border-slate-100 shadow-inner max-w-fit">
                                        <span className="font-medium text-[#08a4b8] mr-2">Note : </span>
                                        {selectedVersion?.note || "-"}
                                    </div>
                                </div>
                            </div>

                            {/* Status Logs */}
                            <div className="mt-2">
                                <OrdersStatusLogs orderVersionId={data?.edi_order_id ?? ""} />
                            </div>

                        </div>
                    </div>


                </div>
            )}
        </Layout>
    );
}

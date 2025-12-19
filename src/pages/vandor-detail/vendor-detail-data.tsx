import { useEffect, useState } from "react";
import apiBaseClient from "../../utils/api-base-client";
import { useLocation } from "react-router-dom";
import type { VendorMetricsResp } from "../../types/vandor-data";
import { toast } from "react-hot-toast";
import VendorTable from "./vendor-table";
import { BiSave } from "react-icons/bi";
import { BiEdit } from "react-icons/bi";
import { IoEye } from "react-icons/io5";

export default function VendorDetailData() {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const company = params.get("company");

    const [data, setData] = useState<VendorMetricsResp | null>(null);
    const [originalData, setOriginalData] = useState<VendorMetricsResp | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (!company) return;

        const fetchDetail = async () => {
            setLoading(true);
            try {
                const res = await apiBaseClient.get(
                    `/api/vendor-metrics/get-company-by-company?company=${encodeURIComponent(company)}`
                );
                const json = res.data;
                const first = json[0] || null;
                setData(first);
                setOriginalData(first);
            } catch (error) {
                console.error("Error fetching vendor detail:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDetail();
    }, [company]);

    if (!company) return <div className="p-6">No company selected.</div>;
    if (loading || !data) return <div className="p-6">Loading...</div>;

    const handleChange = (field: keyof VendorMetricsResp, value: unknown) => {
        setData(prev => (prev ? { ...prev, [field]: value } : prev));
    };

    const handleSave = async () => {
        if (!data) return;
        setSaving(true);
        try {
            await apiBaseClient.patch(
                `/api/vendor-metrics/update-vendor-metrics/${data.vendor_metrics_id}`,
                {
                    initials: data.initials,
                    company_name: data.company_name,
                    reminder_days: data.reminder_days,
                    active: data.active,
                }
            );
            setOriginalData(data);
            setIsEditing(false);
            toast.success("Update vendor sucess");
        } catch (err) {
            console.error(err);
            toast.error("Update failed" + (err as Error).message);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        if (originalData) {
            setData(originalData);
        }
        setIsEditing(false);
    };

    return (
        <div className="p-6 card-root shadow-md rounded-lg  mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-root">Vendor Detail</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        View vendor information and update when needed.
                    </p>
                </div>
                <button
                    onClick={() => setIsEditing(prev => !prev)}
                    style={{ color: "white", fontSize: "14px" }}
                    className="flex items-center gap-2 bg-[#08a4b8] hover:bg-[#0893a5]
                    text-sm font-semibold text-root px-5 py-2.5 rounded-full shadow-md
                    hover:shadow-lg active:scale-[0.97] transition-all duration-200"
                >
                    {isEditing ? <IoEye /> : <BiEdit />}
                 
                    {isEditing ? "View Mode" : "Edit"}
                </button>
            </div>


            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Company
            </span>
            <h1 className="text-xl text-[#08a4b8] mt-2">
                {data.company_name || "-"}
            </h1>

            <div className="space-y-6 max-w-[800px] mt-8">
                <div className="grid grid-cols-6 gap-6 items-start">
                    {/* Initials */}
                    <div className="flex flex-col col-span-1">
                        <span className="text-xs font-semibold uppercase tracking-wide text-root">
                            Initials
                        </span>
                        {isEditing ? (
                            <input
                                type="text"
                                value={data.initials}
                                onChange={(e) => handleChange("initials", e.target.value)}
                                className="mt-1 border border-gray-300 rounded-md px-3 py-2 text-sm 
                        focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                        ) : (
                            <div className="mt-1 px-3 py-2 text-gray-500">
                                {data.initials || "-"}
                            </div>
                        )}
                    </div>

                    {/* Expected Response Time */}
                    <div className="flex flex-col col-span-2">
                        <span className="text-xs font-semibold uppercase tracking-wide text-root">
                          Reminder Day
                        </span>
                        {isEditing ? (
                            <input
                                type="number"
                                value={data.reminder_days ?? ""}
                                onChange={(e) =>
                                    handleChange(
                                        "reminder_days",
                                        e.target.value === "" ? null : parseFloat(e.target.value)
                                    )
                                }
                                className="mt-1 border border-gray-300 rounded-md px-3 py-2 text-sm 
                        focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                        ) : (
                            <div className="mt-1 px-3 py-2 text-gray-500">
                                {data.reminder_days != null
                                    ? `${data.reminder_days} day`
                                    : "-"}
                            </div>
                        )}
                    </div>

                    {/* Status */}
                    <div className="flex flex-col col-span-1">
                        <span className="text-xs font-semibold uppercase tracking-wide text-root">
                            Status
                        </span>

                        {!isEditing ? (
                            <div className="mt-1 px-3 py-2 text-gray-500">
                                {data.active ? "Active" : "Inactive"}
                            </div>
                        ) : (
                            <label className="mt-2 inline-flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.active}
                                    onChange={(e) => handleChange("active", e.target.checked)}
                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-400" 
                                />
                                <span className="text-sm text-gray-700 ml-2">Active</span>
                            </label>
                        )}
                    </div>
                </div>
            </div>

            <VendorTable company={company} />


            {isEditing && (
                <div className="mt-6 flex gap-3 justify-end">
                    <button
                        onClick={handleCancel}
                        type="button"
                        className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-full hover:bg-gray-50 transition"
                        disabled={saving}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        style={{ color: "white", fontSize: "14px" }}
                        className="flex items-center gap-2 bg-[#08a4b8] hover:bg-[#0893a5]
                        text-sm font-semibold text-root px-5 py-2.5 rounded-full shadow-md
                        hover:shadow-lg active:scale-[0.97] transition-all duration-200"
                    >
                        <BiSave style={{ color: "white" }} className="w-4 h-4 hover:animate-spin text-root" />
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            )}
        </div>
    );
}

import { useState, useEffect } from "react";
import { Tooltip, Badge, Modal } from "antd";
import { BellOutlined } from "@ant-design/icons";
import { useUser } from "../contexts/UserContext";
import apiBaseClient from "../utils/api-base-client";
import iconUnread from "../images/icon/email-false.png";
import { useNavigate } from "react-router-dom";
import { statusColor } from "../utils/format";
import { MdOutlineArrowForwardIos } from "react-icons/md";
// import iconMessage from "../images/icon/new-message.png" 
import { HiOutlineInbox } from "react-icons/hi2";


type FlatSummaryItem = {
    number_forecast?: string;
    status_forecast?: string;
    read_forecast?: boolean;
    vendor_code?: string;
    created_at: string

    number_order?: string;
    status_order?: string;
    read_order?: boolean;

    number_invoice?: string;
    status_invoice?: string;
    read_invoice?: boolean;
};

const formatThaiDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString("th-TH", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
};


export default function ModalNotification() {
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState<FlatSummaryItem[]>([]);
    const [loading, setLoading] = useState(false);
    const { user } = useUser();
    const navigate = useNavigate();
    

    const fetchNotifications = async () => {
        if (!user?.group) return;
        setLoading(true);
        try {
            const res = await apiBaseClient.get(
                `/api/summary-data/get-vendor-flat-summary?vendorCode=${user.group}`
            );
            setItems(res.data || []);
        } catch (err) {
            console.error("fetch notifications error:", err);
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

        useEffect(() => {
        if (!user?.group) return;

        // โหลดครั้งแรก
        fetchNotifications();

        // แล้วค่อยรอฟัง event
        const onNotifChanged = () => fetchNotifications();
        window.addEventListener("notif:changed", onNotifChanged);

        return () => window.removeEventListener("notif:changed", onNotifChanged);
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [user?.group]);


    const handleOpen = async () => {
        setOpen(true);
        await fetchNotifications();
    };

    const handleClose = () => {
        setOpen(false);
    };

    const unreadCount = items.length;




    const goToDetail = (type: string, code: string, idx: number) => {
        setItems((prev) => prev.filter((_, i) => i !== idx));

        if (type === "Forecast") navigate(`/en/forecast-form/${code}`);
        else if (type === "Order") navigate(`/en/order-form/${code}`);
        else if (type === "Invoice") navigate(`/en/invoice-form/${code}`);
    };

    const renderItem = (item: FlatSummaryItem, index: number) => {
        let type = "";
        let code = "";
        let status = "";
        let vendorCode = "";
        let createdAt = ""

        if (item.number_forecast) {
            type = "Forecast";
            code = item.number_forecast;
            status = item.status_forecast || "";
            vendorCode = item.vendor_code || "";
            createdAt = item.created_at || "";
        } else if (item.number_order) {
            type = "Order";
            code = item.number_order;
            status = item.status_order || "";
            vendorCode = item.vendor_code || "";
            createdAt = item.created_at || "";
        } else if (item.number_invoice) {
            type = "Invoice";
            code = item.number_invoice;
            status = item.status_invoice || "";
            vendorCode = item.vendor_code || "";
            createdAt = item.created_at || "";
        }

        return (
            <button
                key={index}
                type="button"
                onClick={() => goToDetail(type, code, index)}


                aria-label={`${type} ${code}. Status ${status}. Created ${formatThaiDate(createdAt)}`}
                className="w-full flex items-center justify-between gap-4 p-3 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-0.5 transform transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#08a4b8] hover:border-2 hover:border-b-[#08a4b8]"
            >
                <div className="flex items-start gap-3">
                    <div className="shrink-0 h-12 w-12 rounded-lg bg-linear-to-br from-cyan-100 to-blue-50 flex items-center justify-center">
                        <span className="text-sm font-semibold text-[#036b6f]">
                            {type ? type.charAt(0) : "N"}
                        </span>
                    </div>

                    <div className="flex flex-col text-left min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-900 truncate">{code}</span>
                            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${statusColor(status)}`}>
                                {status || "—"}
                            </span>
                        </div>

                        <span className="mt-1 text-xs text-blue-400 truncate">{vendorCode}</span>

                        <div className="mt-2 flex items-center gap-2">
                            <span className="text-xs text-gray-400">{formatThaiDate(createdAt)}</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                    <img src={iconUnread} alt="" className="w-6 h-6" />
                    <MdOutlineArrowForwardIos className="text-gray-400" />
                </div>
            </button>
        );
    };

    return (
        <>
            <Tooltip title="Notification" className="mr-4">
                <button
                    type="button"
                    onClick={handleOpen}
                    className="relative flex items-center justify-center w-10 h-10 rounded-full card-root shadow-2xl hover:bg-gray-100/50 border hover:border-[#08a4b8]/50 transition-all duration-300"
                    aria-label="Notification"
                >
                    <Badge count={unreadCount} overflowCount={99} offset={[-1, 2]}>
                        <BellOutlined className="text-root text-xl" />
                    </Badge>
                </button>
            </Tooltip>

            <Modal
                title={
                    <div>
                        <div className="font-semibold">Notifications</div>
                        {user?.source_system === "APP_USER" && (
                            <div className="text-xs text-gray-500 mt-2">Vendor: {user?.group}</div>
                        )}
                    </div>
                }
                open={open}
                onCancel={handleClose}
                footer={null}
                centered={false}
                mask={false}
                maskClosable={true}
                modalRender={(modal) => (
                    <div
                        style={{
                            position: "absolute",
                            top: "-30px",
                            right: "-320px",
                            zIndex: 9999,
                            width: "500px",
                        }}
                    >
                        {modal}
                    </div>
                )}
                style={{ padding: 0 }}
            >
                {loading ? (
                    <div className="py-6 text-center text-gray-500 text-sm">
                        Loading notifications...
                    </div>
                ) : items.length === 0 ? (
                    <div className="space-y-2">
                        <div className="relative rounded-2xl p-px bg-linear-to-r from-gray-200 via-gray-300 to-gray-200">
                            <div className="rounded-2xl bg-white px-6 py-8 transition-all duration-200 hover:shadow-sm">
                                <div className="flex flex-col items-center text-center space-y-4">

                                    {/* Icon */}
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-linear-to-br from-cyan-400/20 to-emerald-400/20 rounded-full blur-xl" />
                                        <div className="relative w-14 h-14 rounded-full bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center border border-gray-200">
                                            <HiOutlineInbox className="w-6 h-6 text-gray-400" />
                                        </div>
                                    </div>

                                    {/* Text */}
                                    <div className="space-y-1">
                                        <p className="text-sm font-semibold text-gray-800">
                                            No notifications
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            You have no new notifications at this time.
                                        </p>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>

                ) : (
                    <div className="max-h-full overflow-y-auto py-2 flex flex-col gap-3">
                        {items.map(renderItem)}
                    </div>
                )}
            </Modal>
        </>
    );
}
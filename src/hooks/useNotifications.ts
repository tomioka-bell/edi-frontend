import { useState, useEffect } from "react";
import { useUser } from "../contexts/useUserHook";
import { useNavigate } from "react-router-dom";
import apiBaseClient from "../utils/api-base-client";

export type FlatSummaryItem = {
  number_forecast?: string;
  status_forecast?: string;
  read_forecast?: boolean;
  vendor_code?: string;
  created_at: string;

  number_order?: string;
  status_order?: string;
  read_order?: boolean;

  number_invoice?: string;
  status_invoice?: string;
  read_invoice?: boolean;
};

export const useNotifications = () => {
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

    // Load first time
    fetchNotifications();

    // Then listen for event
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

  return {
    open,
    setOpen,
    items,
    loading,
    unreadCount,
    user,
    handleOpen,
    handleClose,
    goToDetail,
    fetchNotifications,
  };
};

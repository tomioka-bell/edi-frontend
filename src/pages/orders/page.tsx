import * as React from "react";
import { useState } from "react";
import Layout from "../../layouts/layout";
import {
  MaterialReactTable,
  type MRT_ColumnDef,
  type MRT_RowData,
} from "material-react-table";
import { useNavigate } from "react-router-dom";
import type { OrderRow } from "../../types/order-data";
import withLang from "../../utils/normalize-lang";
import { LoadingTableSkeleton } from "../../utils/loading-table";
import { statusColor } from "../../utils/format";
import emailTrue from "../../images/icon/email-true.png";
import emailFalse from "../../images/icon/email-false.png";
import { GrAdd } from "react-icons/gr";
import OrderModalAdd from "./order-modal-add";
import { buildImageURL } from "../../utils/get-image";
import { downloadFile } from "../../utils/download-file";
import { Modal, Select, DatePicker } from "antd";
import { useUser } from "../../contexts/UserContext";
import { HiOutlineDocumentText } from "react-icons/hi2";
import StatusSummaryData from "./status-summary-data";
import apiBaseClient from "../../utils/api-base-client";
import ClearIcon from "@mui/icons-material/Clear";
import IconButton from "@mui/material/IconButton";
import { FiEye, FiDownload } from "react-icons/fi";
import filteringIcon from "../../images/icon/filter.png";
import reloadIcon from "../../images/icon/reload.png";

type StatusOption = "New" | "Confirm" | "Approved" | "Reject" | "Chang" | "";

const fmtDate = (s?: string | null) =>
  !s
    ? "-"
    : new Date(s).toLocaleString("th-TH", {
      timeZone: "Asia/Bangkok",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

export default function OrdersPage() {
  const [rows, setRows] = React.useState<OrderRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const navigate = useNavigate();
  const lang = location.pathname.split("/")[1];
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<StatusOption>("");
  const [dateRange, setDateRange] = useState<[string | null, string | null]>([null, null]);
  const [vendorFilter, setVendorFilter] = useState<string>("");

  const { user } = useUser();
  const [isModalAddOpen, setIsModalAddOpen] = React.useState(false);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const fetchOrders = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiBaseClient.get(`/api/orders/get-orders-active-top?limit=10&vendor_code=${user?.group}`);
      const data: OrderRow[] = res.data;
      const mapped: OrderRow[] = (data ?? []).map((d) => ({
        id: d.edi_order_id,
        edi_order_id: d.edi_order_id,
        number_order: d.number_order,
        vendor_code: d.vendor_code,
        status_order: d.status_order ?? null,
        av_version_no: d.av_version_no ?? null,
        av_status: d.av_status ?? null,
        av_quantity: d.av_quantity ?? null,
        av_period_from: d.av_period_from ?? null,
        av_period_to: d.av_period_to ?? null,
        read_order: d.read_order ?? null,
        av_note: d.av_note ?? null,
        created_at: d.created_at,
        last_new_status: d.last_new_status,
        file_url: d.file_url,
      }));
      setRows(mapped);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [user?.group]);

  React.useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredRows = React.useMemo(() => {
    let filtered = rows;

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(row => row.status_order === statusFilter);
    }

    // Apply vendor filter
    if (vendorFilter) {
      filtered = filtered.filter(row => row.vendor_code === vendorFilter);
    }

    // Apply date range filter
    if (dateRange[0] || dateRange[1]) {
      filtered = filtered.filter(row => {
        const periodFrom = row.av_period_from ? new Date(row.av_period_from).getTime() : null;
        const periodTo = row.av_period_to ? new Date(row.av_period_to).getTime() : null;
        const filterFrom = dateRange[0] ? new Date(dateRange[0]).getTime() : null;
        const filterTo = dateRange[1] ? new Date(dateRange[1]).getTime() : null;

        if (filterFrom && filterTo) {
          return (periodFrom && periodFrom <= filterTo) && (periodTo && periodTo >= filterFrom);
        }

        if (filterFrom && !filterTo) {
          return periodTo && periodTo >= filterFrom;
        }

        if (!filterFrom && filterTo) {
          return periodFrom && periodFrom <= filterTo;
        }

        return true;
      });
    }

    return filtered;
  }, [rows, statusFilter, vendorFilter, dateRange]);

  const handleOpenOrder = React.useCallback(
    async (row: OrderRow) => {
      const OrderNo = row.number_order;
      const OrderId = row.edi_order_id;

      if (!row.read_order && user?.source_system !== "APP_EMPLOYEE") {
        try {
          await apiBaseClient.patch(`/api/orders/mark-order-as-read/${OrderId}`);

          setRows((prev) =>
            prev.map((r) =>
              r.edi_order_id === OrderId
                ? { ...r, read_Order: true }
                : r
            )
          );
        } catch (err) {
          console.error("Error mark-Order-as-read", err);
        }
      }

      navigate(withLang(lang, `/order-form/${OrderNo}`));
    },
    [lang, navigate, user]
  );

  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

  const handlePreviewFile = (row: OrderRow) => {
    if (!row.file_url) return;
    const url = buildImageURL(row.file_url);
    setPreviewUrl(url);
    setIsModalOpen(true);
  };

  const handleDownloadFile = (row: OrderRow) => {
    if (!row.file_url) return;
    const url = buildImageURL(row.file_url);

    const filename = `Order-${row.number_order}${url.toLowerCase().endsWith(".pdf") ? ".pdf" : ""
      }`;

    downloadFile(url, filename);
  };

  const columns = React.useMemo<MRT_ColumnDef<OrderRow>[]>(() => {


    return [
      {
        header: "Order No.",
        accessorKey: "number_order",
        size: 160,
        Cell: ({ row }) => (
          <button
            type="button"
            className="text-[#08a4b8] hover:underline bg-transparent border-0 p-0 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              void handleOpenOrder(row.original);
            }}
          >
            {row.original.number_order}
          </button>
        ),

      },
      { header: "Vendor", accessorKey: "vendor_code", size: 140 },
      {
        header: "Status",
        accessorKey: "status_order",
        size: 140,
        Cell: ({ cell }) => {
          const status = cell.getValue<string | null>();
          const colorClass = statusColor(status ?? undefined);

          return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ring-1 ${colorClass}`}>
              {status || "-"}
            </span>
          );
        },
      },
      {
        header: "Read",
        accessorKey: "read_order",
        size: 80,
        Cell: ({ cell }) => {
          const value = cell.getValue<boolean | null>();

          return value ? (
            <img src={emailTrue} alt="Read" className="w-6 h-6" />
          ) : (
            <img src={emailFalse} alt="Unread" className="w-6 h-6" />
          );
        },
      },
      {
        header: "Period From",
        accessorKey: "av_period_from",
        size: 180,
        Cell: ({ cell }) => fmtDate(cell.getValue<string | null>()),
      },
      {
        header: "Period To",
        accessorKey: "av_period_to",
        size: 180,
        Cell: ({ cell }) => fmtDate(cell.getValue<string | null>()),
      },
      // {
      //   header: "Created At",
      //   accessorKey: "created_at",
      //   size: 180,
      //   Cell: ({ cell }) => fmtDate(cell.getValue<string>()),
      // },

      {
        header: "Attachment",
        accessorKey: "file_url",
        size: 180,
        Cell: ({ row }) => {
          const orig = row.original;
          const hasFile = !!orig.file_url;

          return (
            <div className="flex gap-2">
              <button
                type="button"
                disabled={!hasFile}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handlePreviewFile(orig);
                }}
                className={`
                            group inline-flex items-center gap-1.5
                            rounded-lg px-3 py-1.5 text-xs font-medium
                            border transition-all duration-200
                            focus:outline-none focus:ring-2 focus:ring-[#08a4b8]/30
                            ${hasFile
                    ? "border-[#08a4b8]/40 text-[#08a4b8] bg-white shadow-sm hover:bg-[#08a4b8]/10 hover:shadow-md active:scale-[0.97]"
                    : "border-gray-200 text-gray-300 bg-gray-50 cursor-not-allowed"
                  }
                          `}
                title={hasFile ? "Preview file" : "No file available"}
              >
                <FiEye className="h-3.5 w-3.5 transition-transform group-hover:scale-110" />
                <span>View</span>
              </button>

              {/* Download */}
              <button
                type="button"
                disabled={!hasFile}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleDownloadFile(orig);
                }}
                className={`
                          group inline-flex items-center gap-1.5
                          rounded-lg px-3 py-1.5 text-xs font-medium
                          border transition-all duration-200
                          focus:outline-none focus:ring-2 focus:ring-gray-300
                          ${hasFile
                    ? "border-gray-300 text-gray-600 bg-white shadow-sm hover:bg-gray-100 hover:shadow-md active:scale-[0.97]"
                    : "border-gray-200 text-gray-300 bg-gray-50 cursor-not-allowed"
                  }
                        `}
                title={hasFile ? "Download file" : "No file available"}
              >
                <FiDownload className="h-3.5 w-3.5 transition-transform group-hover:scale-110" />
                <span>Download</span>
              </button>
            </div>
          );
        },
      },
    ];
  }, [handleOpenOrder]);

  return (
    <Layout>
      <div className="flex items-center gap-2 pb-4">
        <div className="relative w-12 h-12 card-root rounded-2xl flex items-center justify-center shadow-lg">
          <HiOutlineDocumentText className="w-5 h-5 text-root" />
        </div>
        <h1 className="text-2xl ml-4 font-semibold text-root">Order</h1>
      </div>


      <OrderModalAdd isOpen={isModalAddOpen} onClose={() => setIsModalAddOpen(false)} onCreated={fetchOrders} />
      <div className="card-root px-4 py-4 rounded-lg shadow-lg">



        <div className="pb-6">
          <StatusSummaryData vendorCode={user?.group ?? ""} />
        </div>


        <div className="card-root rounded-lg bg-linear-to-r from-sky-50 to-blue-100 shadow-sm p-2">
          <div className="flex justify-between items-center pb-4 gap-4 flex-wrap">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="ml-2">
                <img src={filteringIcon} alt="Filtering" className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Status:</label>
                <Select
                  placeholder="Select Status"
                  allowClear
                  style={{ width: 180 }}
                  value={statusFilter || undefined}
                  onChange={(value) => setStatusFilter((value as StatusOption) || "")}
                  options={[
                    { label: "New", value: "New" },
                    { label: "Confirm", value: "Confirm" },
                    { label: "Approved", value: "Approved" },
                    { label: "Reject", value: "Reject" },
                    { label: "Chang", value: "Chang" },
                  ]}
                />
              </div>

              {user?.source_system === "APP_EMPLOYEE" && (
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">Vendor:</label>
                  <Select
                    placeholder="Select Vendor"
                    allowClear
                    style={{ width: 200 }}
                    value={vendorFilter || undefined}
                    onChange={(value) => setVendorFilter(value || "")}
                    options={rows
                      .map(row => row.vendor_code)
                      .filter((code, index, self) => code && self.indexOf(code) === index)
                      .sort()
                      .map(code => ({ label: code, value: code }))
                    }
                  />
                </div>
              )}

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Period:</label>
                <DatePicker.RangePicker
                  placeholder={["From", "To"]}
                  onChange={(dates) => {
                    if (dates && dates[0] && dates[1]) {
                      setDateRange([dates[0].format("YYYY-MM-DD"), dates[1].format("YYYY-MM-DD")]);
                    } else {
                      setDateRange([null, null]);
                    }
                  }}
                  style={{ width: 280 }}
                />
              </div>

              <div>
                <img
                  src={reloadIcon}
                  alt="Reload"
                  onClick={() => {
                    setGlobalFilter("");
                    setStatusFilter("");
                    setVendorFilter("");
                    setDateRange([null, null]);
                  }}
                  className="w-6 h-6 cursor-pointer transition-transform duration-200 ease-in-out hover:scale-110 hover:rotate-12"
                />
              </div>
            </div>

              {user?.source_system === "APP_EMPLOYEE" && (
            <button style={{ color: "white", fontSize: "14px" }} onClick={() => setIsModalAddOpen(true)} className="flex items-center gap-2 bg-[#08a4b8] hover:bg-[#0893a5]
          text-sm font-semibold text-white px-5 py-2.5 rounded-full shadow-md
          hover:shadow-lg active:scale-[0.97] transition-all duration-200">
              <GrAdd className="w-4 h-4 hover:animate-spin" />
              Add Order
            </button>
               )}

          </div>
          <MaterialReactTable<OrderRow & MRT_RowData>
            columns={columns}
            data={filteredRows}
            state={{
              isLoading: loading,
              globalFilter,
            }}
            enableGlobalFilter
            initialState={{
              showGlobalFilter: true,
              density: "compact",
              pagination: { pageSize: 10, pageIndex: 0 },
            }}
            muiPaginationProps={{
              rowsPerPageOptions: [10, 25, 50, 100],
              showFirstButton: true,
              showLastButton: true,
            }}
            onGlobalFilterChange={setGlobalFilter}
            muiTableContainerProps={{ sx: { maxHeight: 640 } }}
            enableHiding={false}
            enableDensityToggle={false}
            enableColumnActions={false}
            muiLinearProgressProps={{ sx: { height: 2 } }}
            muiTableHeadCellProps={{ sx: { whiteSpace: "nowrap" } }}
            getRowId={(row) => row.id}
            muiSearchTextFieldProps={{
              placeholder: "Search users...",
              InputProps: {
                endAdornment:
                  globalFilter.length > 0 ? (
                    <IconButton
                      size="small"
                      onClick={() => setGlobalFilter("")}
                      sx={{ visibility: globalFilter ? "visible" : "hidden" }}
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  ) : null,
              },
            }}
            muiTableBodyRowProps={({ row }) => ({
              onClick: () => {
                void handleOpenOrder(row.original);
              },
              sx: {
                cursor: "pointer",
                "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" },
              },
              role: "button",
              tabIndex: 0,
              onKeyDown: (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  void handleOpenOrder(row.original);
                }
              },
            })}

            renderEmptyRowsFallback={() =>
              loading ? (
                <LoadingTableSkeleton columns={columns.length} rows={10} />
              ) : (
                <div className="py-10 text-center text-gray-500">No data found</div>
              )
            }
          />
        </div>


        <Modal
          open={isModalOpen}
          onCancel={() => {
            setIsModalOpen(false);
            setPreviewUrl(null);
          }}
          footer={null}
          width={900}
          centered
          destroyOnClose
          title="Attachment Preview"
        >
          {previewUrl && (
            <>
              {previewUrl.toLowerCase().endsWith(".pdf") ? (
                <iframe
                  src={previewUrl}
                  className="w-full h-[70vh] border-0"
                  title="PDF Preview"
                />
              ) : (
                <img
                  src={previewUrl}
                  alt="Attachment"
                  className="max-h-[70vh] mx-auto"
                />
              )}
            </>
          )}
        </Modal>

      </div>
    </Layout>
  );
}

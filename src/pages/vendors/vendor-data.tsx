import { useEffect, useState, useCallback } from "react";
import {
  MaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";
import apiBaseClient from "../../utils/api-base-client";
import type { VendorMetricsResp } from "../../types/vandor-data";
import VandorAddModal from "./vendor-add-madal";
import { useNavigate, useLocation } from "react-router-dom";
import { FiPlus } from "react-icons/fi";
import wrongpassword from "../../images/icon/wrong-password.png";
import { toast } from "react-hot-toast";
import { IconButton } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import { Select } from "antd";
import reloadIcon from "../../images/icon/reload.png";


export default function VendorData() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [data, setData] = useState<VendorMetricsResp[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [companyFilter, setCompanyFilter] = useState<string>("");

  const lang = pathname.split("/")[1];
  const base = `/${lang}`;

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  const fetchVendorMetrics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiBaseClient.get(
        `/api/vendor-metrics/get-vendor-metrics-top?limit=1000`
      );
      const json = res.data;
      setData(json ?? []);
    } catch (err) {
      console.error("Error fetching vendor metrics:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVendorMetrics();
  }, [fetchVendorMetrics]);

  const filteredData = useCallback(() => {
    let filtered = data;
    if (companyFilter) {
      filtered = filtered.filter((row) =>
        row.company_name.toLowerCase().includes(companyFilter.toLowerCase())
      );
    }
    return filtered;
  }, [data, companyFilter]);

  const handlePasswordChangeNotification = async (row: VendorMetricsResp) => {
    const companyName = row.company_name;

    try {
      const res = await apiBaseClient.get(
        `/api/user/get-active-emails-by-group?group=${encodeURIComponent(companyName)}`
      );

      const emails: string[] = res.data;

      if (!emails?.length) {
        alert(`No active emails found for company: ${companyName}`);
        return;
      }

      toast.success(`Notifications sent successfully  (${emails.length} people)\n${emails.join("\n")}`);
    } catch (err) {
      console.error("get emails error:", err);
      toast.error("Occurs while retrieving emails/sending notifications.");
    }
  };


  const columns: MRT_ColumnDef<VendorMetricsResp>[] = [
    {
      accessorKey: "initials",
      header: "Initials",
      size: 80,
      Cell: ({ cell }) => (
        <div className="text-blue-400">
          {cell.getValue<string>()}
        </div>
      ),
    },
    {
      accessorKey: "company_name",
      header: "Company Name",
      size: 320,
      minSize: 260,
    },
    {
      accessorKey: "reminder_days",
      header: "Reminder Day",
      Cell: ({ cell }) => {
        const v = cell.getValue<number>();
        return v != null ? `${Math.round(v)} Day` : "-";
      },
    },
    {
      accessorKey: "active",
      header: "Active",
      Cell: ({ cell }) => (
        <span
          className={
            cell.getValue<boolean>()
              ? "inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700"
              : "inline-flex items-center rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700"
          }
        >
          {cell.getValue<boolean>() ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Action",
      size: 140,
      Cell: ({ row }) => (

        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handlePasswordChangeNotification(row.original);
          }}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-300 hover:shadow-md transition-all duration-200"
        >
          <img src={wrongpassword} alt="alert" className="h-4 w-4" />
          Notify
        </button>
      ),
    },
  ];

  return (
    <div className="card-root w-328 mx-auto rounded-2xl shadow-sm border border-gray-100 bg-white/90">
      {/* Header */}
      <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between bg-linear-to-r from-sky-50 to-blue-100 rounded-t-2xl">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-gray-900">
              Vendor Performance Metrics
            </h1>
          </div>
          <p className="text-xs text-gray-500">
            Top vendors · {filteredData().length} record{filteredData().length !== 1 && "s"}
          </p>
        </div>

        {/* ปุ่ม Add Vendor Group */}
        <button
          onClick={handleOpenModal}
          style={{ color: "white", fontSize: "13px" }}
          className="px-4 py-2.5 bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-medium rounded-lg shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-95 transition-all duration-150 flex items-center gap-2"
        >
          <FiPlus />
          <span>Add Vendor Group</span>
        </button>
      </div>

      {/* Modal */}
      <VandorAddModal
        open={openModal}
        onClose={handleCloseModal}
        fetchVendorMetrics={fetchVendorMetrics}
      />

      {/* Table */}
      <div className="p-4 sm:p-6">
        {/* Filter Bar */}
        <div className="mb-4 flex items-center gap-3">
          <Select
            placeholder="All Companies"
            allowClear
            style={{ width: 280 }}
            value={companyFilter || undefined}
            onChange={(value) => setCompanyFilter(value || "")}
            options={
              data
                .map((row) => ({
                  label: row.company_name,
                  value: row.company_name,
                }))
                .reduce((acc: { label: string; value: string }[], current) => {
                  if (!acc.find((item) => item.value === current.value)) {
                    acc.push(current);
                  }
                  return acc;
                }, [])
                .sort((a, b) => a.label.localeCompare(b.label))
            }
          />


          <img
            src={reloadIcon}
            alt="Reload"
            onClick={() => {
              setGlobalFilter("");
              setCompanyFilter("");
              fetchVendorMetrics();
            }}
            className="w-6 h-6 cursor-pointer transition-transform duration-200 ease-in-out hover:scale-110 hover:rotate-12"
          />
        </div>

        <MaterialReactTable
          columns={columns}
          data={filteredData()}
          state={{
            isLoading: loading,
            globalFilter,
          }}
          onGlobalFilterChange={setGlobalFilter}
          enableSorting
          enableColumnFilters
          enableGlobalFilter
          enableHiding={false}
          enableDensityToggle={false}
          enableColumnActions={false}
          enablePagination
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

          muiTablePaperProps={{
            elevation: 0,
            sx: {
              boxShadow: "none",
              borderRadius: "1rem",
            },
          }}
          muiTableHeadCellProps={{
            sx: {
              fontWeight: 600,
              backgroundColor: "#f9fafb",
              fontSize: "0.78rem",
              color: "#4b5563",
            },
          }}
          muiTableBodyRowProps={({ row }) => ({
            onClick: () => {
              const company = row.original.company_name;
              navigate(
                `${base}/vendor-detail?company=${encodeURIComponent(company)}`
              );
            },
            sx: {
              cursor: "pointer",
              "&:hover": {
                backgroundColor: "#f3f4ff",
              },
            },
          })}
          muiLinearProgressProps={{
            sx: { borderRadius: 999 },
          }}
          initialState={{
            showGlobalFilter: true,
            density: "compact",
            pagination: { pageIndex: 0, pageSize: 10 },
          }}
        />
      </div>
    </div>
  );
}

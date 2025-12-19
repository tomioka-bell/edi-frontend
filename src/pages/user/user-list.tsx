import { useEffect, useState, useCallback } from "react";
import {
  MaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";
import apiBaseClient from "../../utils/api-base-client";
import type { PrincipalUser } from "../../types/principal-user";
import { Switch } from "@mui/material";
import { toast } from "react-hot-toast";
import { Modal, Select } from "antd";     
import { FiEdit } from "react-icons/fi";
import ClearIcon from "@mui/icons-material/Clear";
import IconButton from "@mui/material/IconButton";  

export default function UserList() {
  const [data, setData] = useState<PrincipalUser[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<PrincipalUser | null>(null);
  const [saving, setSaving] = useState(false);
  const [globalFilter, setGlobalFilter] = useState<string>("");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiBaseClient.get(
        `/api/user/get-by-group?group=Prospira (Thailand) Co., Ltd.`
      );
      setData(res.data ?? []);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const columns: MRT_ColumnDef<PrincipalUser>[] = [
    // { accessorKey: "edi_principal_id", header: "edi_principal_id" },
    { accessorKey: "username", header: "Username" },
    { accessorKey: "display_name", header: "Display Name" },
    {
      accessorKey: "email",
      header: "Email",
      size: 350,
      minSize: 280,
    },
    { accessorKey: "role", header: "Role" },
    {
      id: "actions",
      header: "Action",
      size: 80,
      Cell: ({ row }) => (
        <button
          onClick={() => {
            setSelectedUser(row.original);
            setOpenEditModal(true);
          }}
          className="inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-[#08a4b8] transition"
        >
          <FiEdit className="h-4 w-4" />
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
              User Management
            </h1>
          </div>
          <p className="text-xs text-gray-500">
            Prospira (Thailand) Co., Ltd. · {data.length} user{data.length !== 1 && "s"}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="p-4 sm:p-6">
        <MaterialReactTable
          columns={columns}
          data={data}
          state={{
            isLoading: loading,
            globalFilter,
          }}
          onGlobalFilterChange={setGlobalFilter}

          enableSorting
          enableColumnFilters
          enableGlobalFilter
          enablePagination
          enableHiding={false}
          enableDensityToggle={false}
          enableColumnActions={false}

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

      <Modal
        open={openEditModal}
        title="Update User"
        okText="Save"
        cancelText="Cancel"
        confirmLoading={saving}
        onCancel={() => {
          setOpenEditModal(false);
          setSelectedUser(null);
        }}
        onOk={async () => {
          if (!selectedUser) return;

          setSaving(true);
          try {
            await apiBaseClient.patch(
              `/api/user/update-principal/${selectedUser.edi_principal_id}`,
              {
                status: selectedUser.status,
                login_without_otp: selectedUser.login_without_otp,
                role: selectedUser.role,
              }
            );

            toast.success("Update user successfully");
            setOpenEditModal(false);
            setSelectedUser(null);
            fetchUsers();
          } catch (err) {
            console.error(err);
            toast.error("Update user failed");
          } finally {
            setSaving(false);
          }
        }}
      >

        {selectedUser && (
          <div className="space-y-4 pb-4">
            {/* Username */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Username
              </label>
              <input
                disabled
                value={selectedUser.username}
                className="w-full rounded-md border border-gray-200 bg-gray-100 px-3 py-2 text-sm"
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Role
              </label>
              <Select
                className="w-full"
                value={selectedUser.role}
                onChange={(value) =>
                  setSelectedUser((prev) =>
                    prev ? { ...prev, role: value } : prev
                  )
                }
                options={[
                  { label: "Super Admin", value: "SU" },
                  { label: "Admin", value: "ADMIN" },
                  { label: "Purchase", value: "PURCHASE" },
                  { label: "Planning", value: "PLANNING" },
                ]}
              />
            </div>

            {/* Status */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Active</span>
              <Switch
                checked={selectedUser.status === "active"}
                onChange={(_, value) =>
                  setSelectedUser((prev) =>
                    prev
                      ? { ...prev, status: value ? "active" : "disable" }
                      : prev
                  )
                }
              />
            </div>

            {/* Login Without OTP */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">
                Login Without OTP
              </span>
              <Switch
              checked={!selectedUser.login_without_otp}
              onChange={(_, value) =>
                setSelectedUser((prev) =>
                  prev
                    ? { ...prev, login_without_otp: !value }
                    : prev
                )
              }
            />

            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
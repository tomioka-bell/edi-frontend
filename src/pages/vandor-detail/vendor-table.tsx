import { useCallback, useEffect, useMemo, useState } from "react";
import apiBaseClient from "../../utils/api-base-client";
import type { Vendor } from "../../types/principal-user";
import { GrAdd } from "react-icons/gr";
import { toast } from "react-hot-toast";
import { Modal } from "antd";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import CreateVendorModal from "./create-vender-modal";
import { Switch } from "@mui/material";
import photoIcon from "../../images/icon/gallery.png";
import { FiEdit } from "react-icons/fi";
import ClearIcon from "@mui/icons-material/Clear";
import IconButton from "@mui/material/IconButton";


export default function VendorTable({ company }: { company: string }) {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<Vendor[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [openEditModal, setOpenEditModal] = useState(false);
    const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
    const [saving, setSaving] = useState(false);
    const [profileFile, setProfileFile] = useState<File | null>(null);
    const [globalFilter, setGlobalFilter] = useState<string>("");

    const handleAddVendor = () => {
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const fetchVendorMetrics = useCallback(async () => {
        if (!company) return;
        setLoading(true);
        try {
            const res = await apiBaseClient.get(
                `/api/user/get-by-company?company=${encodeURIComponent(
                    company
                )}`
            );
            const json = res.data;
            setData(json || []);
        } catch (err) {
            console.error("Error fetching vendor metrics:", err);
            setData([]);
        } finally {
            setLoading(false);
        }
    }, [company]);

    useEffect(() => {
        fetchVendorMetrics();
    }, [fetchVendorMetrics]);

    const columns = useMemo<MRT_ColumnDef<Vendor>[]>(
        () => [
            {
                accessorKey: "firstname + lastname",
                header: "Full Name",
                Cell: ({ row }) =>
                    `${row.original.firstname || ""} ${row.original.lastname || ""
                        }`.trim() || "N/A",
            },
            {
                accessorKey: "email",
                header: "Email",
            },
            {
                accessorKey: "group",
                header: "Company",
                size: 350,
                minSize: 300,
            },
            {
                id: "actions",
                header: "Action",
                size: 80,
                Cell: ({ row }) => (
                    <button
                        onClick={() => {
                            setSelectedVendor(row.original);
                            setOpenEditModal(true);
                        }}
                        className="
                            inline-flex items-center justify-center
                            rounded-md
                            p-2
                            text-gray-600
                            hover:bg-gray-100
                            hover:text-[#08a4b8]
                            transition
                        "
                        title="Edit"
                    >
                        <FiEdit className="h-4 w-4" />
                    </button>
                ),
            },
        ],
        []
    );

    return (
        <div className="mt-8">
            <CreateVendorModal
                companyVendor={company}
                open={isModalOpen}
                onCancel={handleCancel}
                fetchVendorMetrics={fetchVendorMetrics}
            />

            <div className="flex items-center justify-end mb-2">
                <button
                    style={{ color: "white", fontSize: "14px" }}
                    onClick={handleAddVendor}
                    className="flex items-center gap-2 bg-[#08a4b8] hover:bg-[#0893a5]
                    text-sm font-semibold text-root px-5 py-2.5 rounded-full shadow-md
                    hover:shadow-lg active:scale-[0.97] transition-all duration-200"
                >
                    <GrAdd
                        style={{ color: "white" }}
                        className="w-4 h-4 hover:animate-spin text-root"
                    />
                    Add Vendor
                </button>
            </div>

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
                renderTopToolbarCustomActions={() => (
                    <h2 className="text-2xl font-semibold mb-2 text-gray-800">
                        List of USERS
                    </h2>
                )}
            />


            <Modal
                open={openEditModal}
                title="Edit Vendor"
                okText="Save"
                cancelText="Cancel"
                confirmLoading={saving}
                onCancel={() => {
                    setOpenEditModal(false);
                    setSelectedVendor(null);
                }}
                onOk={async () => {
                    if (!selectedVendor) return;

                    setSaving(true);
                    try {
                        const formData = new FormData();
                        formData.append("status", selectedVendor.status);
                        formData.append("firstname", selectedVendor.firstname);
                        formData.append("lastname", selectedVendor.lastname);
                        formData.append(
                            "login_without_otp",
                            String(selectedVendor.login_without_otp)
                        );

                        if (profileFile) {
                            formData.append("profile", profileFile);
                        }

                        await apiBaseClient.patch(
                            `/api/user/update-user/${selectedVendor.user_id}`,
                            formData,
                            {
                                headers: { "Content-Type": "multipart/form-data" },
                            }
                        );

                        toast.success("Update successfully");
                        setOpenEditModal(false);
                        setSelectedVendor(null);
                        setProfileFile(null);
                        fetchVendorMetrics();
                    } catch (err) {
                        console.error(err);
                        toast.error("Update failed");
                    } finally {
                        setSaving(false);
                    }
                }}
            >
                {selectedVendor && (
                    <div className="space-y-4 pb-4">
                        {/* Name */}
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">
                                Firstname
                            </label>
                            <input
                                value={selectedVendor.firstname || ""}
                                onChange={(e) =>
                                    setSelectedVendor((prev) =>
                                        prev ? { ...prev, firstname: e.target.value } : prev
                                    )
                                }
                                className="w-full rounded-md border px-3 py-2 text-sm"
                            />
                        </div>

                        {/* Lastname */}
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">
                                Lastname
                            </label>
                            <input
                                value={selectedVendor.lastname || ""}
                                onChange={(e) =>
                                    setSelectedVendor((prev) =>
                                        prev ? { ...prev, lastname: e.target.value } : prev
                                    )
                                }
                                className="w-full rounded-md border px-3 py-2 text-sm"
                            />
                        </div>

                           <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">
                                Email
                            </label>
                            <input
                                value={selectedVendor.email || ""}
                                onChange={(e) =>
                                    setSelectedVendor((prev) =>
                                        prev ? { ...prev, email: e.target.value } : prev
                                    )
                                }
                                className="w-full rounded-md border px-3 py-2 text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">
                                Profile Image
                            </label>

                            <div className="flex items-center gap-3">
                                {/* hidden input */}
                                <input
                                    id="profile-upload"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => setProfileFile(e.target.files?.[0] || null)}
                                />

                                {/* custom button */}
                                <label
                                    htmlFor="profile-upload"
                                    className="
                                    cursor-pointer
                                    inline-flex items-center gap-2
                                    rounded-md border border-gray-300
                                    bg-white px-4 py-2
                                    text-sm font-medium text-gray-700
                                    hover:bg-gray-50
                                    transition
                                "
                                >
                                    <img src={photoIcon} alt="photo-icon" className="w-4 h-4" />
                                    Choose Image
                                </label>

                                {/* filename */}
                                {profileFile && (
                                    <span className="text-xs text-gray-500 truncate max-w-[180px]">
                                        {profileFile.name}
                                    </span>
                                )}
                            </div>
                        </div>


                        {/* Status */}
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Active</span>
                            <Switch
                                checked={selectedVendor.status === "active"}
                                onChange={(_, value) =>
                                    setSelectedVendor((prev) =>
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
                                checked={!selectedVendor.login_without_otp}
                                onChange={(_, value) =>
                                    setSelectedVendor((prev) =>
                                        prev ? { ...prev, login_without_otp: !value } : prev
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

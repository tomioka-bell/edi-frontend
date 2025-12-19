import { Modal, Input, DatePicker } from "antd";
import { useState, useEffect, type ChangeEvent, type DragEvent } from "react";
import apiBaseClient from "../../utils/api-base-client";
import { useUser } from "../../contexts/UserContext";
const { RangePicker } = DatePicker;
const { TextArea } = Input;
import toast from "react-hot-toast";
import type { OrderVersionFormValues } from "../../types/order-add-form";

interface OrdersVersionAddProps {
    visible: boolean;
    onOk: () => void;
    onCancel: () => void;
    ediOrderId: string;
}

export default function OrdersVersionAdd({
    visible,
    onOk,
    onCancel,
    ediOrderId,
}: OrdersVersionAddProps) {
    const { user } = useUser();


    const [values, setValues] = useState<OrderVersionFormValues>({
        edi_order_id: ediOrderId,
        period_from: null,
        period_to: null,
        status_order: "New",
        read_order: false,
        note: "",
        created_by_user_id: user?.external_id,
        row_ver: "",
        created_by_external_id: user?.external_id,
        created_by_source_system: user?.source_system,
    });

    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        setValues((prev) => ({
            ...prev,
            edi_order_id: ediOrderId,
            created_by_user_id: user?.external_id,
            created_by_external_id: user?.external_id,
            created_by_source_system: user?.source_system,
        }));
    }, [ediOrderId, user]);

    const submitVersion = async (payload: OrderVersionFormValues, file: File | null) => {
        const formData = new FormData();
        formData.append("payload", JSON.stringify(payload));

        if (file) {
            formData.append("file", file);
        }

        const res = await apiBaseClient.post(`/api/orders/create-order-version`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        onCancel();
        toast.success("Create version successfully");

        return res.data;
    };

    const handleSubmit = async () => {
        if (!values.note) {
            alert("กรุณากรอก Note ให้ครบ");
            return;
        }

        try {
            await submitVersion(values, file);
            setFile(null);
            onOk();
        } catch (err) {
            alert((err as Error).message);
        }
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (f) {
            if (f.type === "application/pdf") {
                setFile(f);
            } else {
                toast("กรุณาเลือกไฟล์ PDF เท่านั้น");
            }
        }
    };

    const handleCancel = () => {
        setFile(null);
        onCancel();
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const droppedFiles = e.dataTransfer.files;
        if (droppedFiles.length > 0) {
            const f = droppedFiles[0];
            if (f.type === "application/pdf") {
                setFile(f);
            } else {
                toast.error("กรุณาเลือกไฟล์ PDF เท่านั้น");
            }
        }
    };

    const removeFile = () => {
        setFile(null);
    };


    return (
        <Modal
            open={visible}
            onOk={handleSubmit}
            onCancel={handleCancel}
            title="Add Forecast Version"
            destroyOnClose
            okText="Confirm"
            width={600}
            okButtonProps={{
                style: {
                    backgroundColor: "#08a4b8",
                    borderColor: "#08a4b8",
                    color: "white",
                },
            }}
        >
            <div className="flex flex-col gap-3 pt-4">
                {/* Note */}
                <TextArea
                    rows={3}
                    placeholder="Note"
                    value={values.note}
                    onChange={(e) =>
                        setValues((v) => ({ ...v, note: e.target.value }))
                    }
                />

                <div className="py-2">
                    <RangePicker
                        className="w-full"
                        onChange={(range) => {
                            setValues((v) => ({
                                ...v,
                                period_from: range?.[0]?.toDate().toISOString() ?? null,
                                period_to: range?.[1]?.toDate().toISOString() ?? null,
                            }));
                        }}
                    />
                </div>

                {!file ? (
                    <div
                        className="flex items-center justify-center text-center w-full"
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <label
                            htmlFor="dropzone-file"
                            className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200 ${isDragging
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-300 bg-gray-50 hover:bg-gray-100"
                                }`}
                        >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <svg
                                    className={`w-10 h-10 mb-3 transition-colors ${isDragging ? "text-blue-500" : "text-gray-400"
                                        }`}
                                    aria-hidden="true"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        stroke="currentColor"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M15 17h3a3 3 0 0 0 0-6h-.025a5.56 5.56 0 0 0 .025-.5A5.5 5.5 0 0 0 7.207 9.021C7.137 9.017 7.071 9 7 9a4 4 0 1 0 0 8h2.167M12 19v-9m0 0-2 2m2-2 2 2"
                                    />
                                </svg>
                                <p className="mb-2 text-sm text-gray-600">
                                    <span className="font-semibold">Click to upload</span> or drag and drop
                                </p>
                                <p className="text-xs text-gray-500">File format: PDF</p>
                            </div>
                            <input
                                id="dropzone-file"
                                type="file"
                                className="absolute w-0 h-0 opacity-0 overflow-hidden"
                                onChange={handleFileChange}
                                accept="application/pdf"
                            />
                        </label>
                    </div>
                ) : (
                    <div className="flex items-center justify-between p-4 border border-gray-300 rounded-lg bg-gray-50">
                        <div className="flex items-center gap-3">
                            <svg
                                className="w-8 h-8 text-red-500"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                            </svg>
                            <div>
                                <p className="text-sm font-medium text-gray-900">{file.name}</p>
                                <p className="text-xs text-gray-500">
                                    {(file.size / 1024).toFixed(2)} KB
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={removeFile}
                            className="text-red-500 hover:text-red-700 transition-colors"
                        >
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>
                )}

            </div>
        </Modal>
    );
}

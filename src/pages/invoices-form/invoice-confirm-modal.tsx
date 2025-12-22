import { Modal, Form, message } from "antd";
import { useEffect, useState, type ChangeEvent, type DragEvent } from "react";
import apiBaseClient from "../../utils/api-base-client";
import toast from "react-hot-toast";
import { useUser } from "../../contexts/useUserHook";


interface invoicesConfirmModalProps {
    edi_invoice_version_id: string;
    edi_invoice_id: string;
    visible: boolean;
    onOk: () => void;
    onCancel: () => void;
    createdbyexternalID?: string;
    status_invoice?: string;
    source_system?: string;
}

type ConfirmStatus = "FULLY_CONFIRMED" | "REJECTED" | "APPROVED";

interface FormError extends Error {
    errorFields?: unknown;
}

export default function InvoiceConfirmModal({
    edi_invoice_version_id,
    edi_invoice_id,
    visible,
    onOk,
    onCancel,
    createdbyexternalID,
    status_invoice,
    source_system,
}: invoicesConfirmModalProps) {

    const [form] = Form.useForm();
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const [selectedStatus, setSelectedStatus] =
        useState<ConfirmStatus>("FULLY_CONFIRMED");
    const { user } = useUser();
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (f) {
            if (f.type === "application/pdf") {
                setFile(f);
            } else {
                message.warning("กรุณาเลือกไฟล์ PDF เท่านั้น");
            }
        }
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
                message.warning("กรุณาเลือกไฟล์ PDF เท่านั้น");
            }
        }
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            const { note } = values;

            setConfirmLoading(true);

            const statusLabelMap: Record<ConfirmStatus, string> = {
                FULLY_CONFIRMED: "Confirm",
                REJECTED: "Reject",
                APPROVED: "Approved",
            };

            const formData = new FormData();
            formData.append("edi_invoice_version_id", edi_invoice_version_id);
            formData.append("edi_invoice_id", edi_invoice_id);
            formData.append("old_status", status_invoice ?? "");
            formData.append("new_status", statusLabelMap[selectedStatus]);
            formData.append("note", note || "");
            formData.append(
                "created_by_external_id",
                createdbyexternalID || ""
            );
            formData.append("created_by_source_system", source_system || "APP_EMPLOYEE");

            if (file) {
                formData.append("file", file);
            }

            await apiBaseClient.post(
                `/api/invoice/create-invoice-version-status-log`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            form.resetFields();
            setSelectedStatus("FULLY_CONFIRMED");
            setFile(null);
            setConfirmLoading(false);
            toast.success(
                `Confirm invoice successfully (${statusLabelMap[selectedStatus]})`
            );

            onOk();
        } catch (err) {
            const error = err as FormError;
            if (error?.errorFields) {
                return;
            }
            console.error(error);
            toast.error("Confirm invoice failed");
            setConfirmLoading(false);
        }
    };


    useEffect(() => {
        if (!file) {
            setPreviewUrl(null);
            return;
        }
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);

        return () => URL.revokeObjectURL(url);
    }, [file]);

    const handleCancel = () => {
        form.resetFields();
        setSelectedStatus("FULLY_CONFIRMED");
        setFile(null);
        onCancel();
    };

    const removeFile = () => {
        setFile(null);
    };

    return (
        <Modal
            title="Confirm Invoices"
            open={visible}
            onOk={handleOk}
            onCancel={handleCancel}
            confirmLoading={confirmLoading}
            centered
            width={600}
            okText="Confirm"
            okButtonProps={{
                style: {
                    backgroundColor: "#08a4b8",
                    borderColor: "#08a4b8",
                    color: "white",
                },
            }}
        >
            <p className="mb-3">Are you sure you want to confirm this Invoices?</p>

            <div className="py-4 flex justify-center">
                <div className="inline-flex rounded-lg overflow-hidden status-toggle-root">
                    {user?.source_system === "APP_EMPLOYEE" && (
                        <button
                            type="button"
                            onClick={() => setSelectedStatus("FULLY_CONFIRMED")}
                            className={[
                                "status-toggle-btn status-toggle-btn--green",
                                selectedStatus === "FULLY_CONFIRMED" ? "status-toggle-btn--active" : "",
                            ].join(" ")}
                        >
                            Confirm
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={() => setSelectedStatus("REJECTED")}
                        className={[
                            "status-toggle-btn status-toggle-btn--red",
                            selectedStatus === "REJECTED" ? "status-toggle-btn--active" : "",
                        ].join(" ")}
                    >
                        Reject
                    </button>

                    {user?.source_system === "APP_USER" && (
                        <button
                            type="button"
                            onClick={() => setSelectedStatus("APPROVED")}
                            className={[
                                "status-toggle-btn status-toggle-btn--green",
                                selectedStatus === "APPROVED" ? "status-toggle-btn--active" : "",
                            ].join(" ")}
                        >
                            Approved
                        </button>
                    )}
                </div>

            </div>

            <Form
                form={form}
                layout="vertical"
                initialValues={{
                    note: "",
                }}
            >
                <Form.Item label="Note" name="note">
                    {/* <Input.TextArea
                        placeholder="Add a note (if any)"
                        autoSize={{ minRows: 2, maxRows: 4 }}
                    /> */}

                    <textarea id="message" rows={4} className="bg-neutral-secondary-medium border border-gray-200 rounded-sm text-heading text-sm  focus:ring-brand focus:border-brand block w-full p-3.5 shadow-xs placeholder:text-body" placeholder="Write your thoughts here..."></textarea>

                </Form.Item>

                <Form.Item label="">
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
                                    : "border-gray-300 bg-root hover:bg-gray-100"
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
                        <div className="flex items-center justify-between p-4 border border-gray-300 rounded-xl bg-white shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-50 rounded-lg">
                                    {/* icon pdf */}
                                    <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                                    </svg>
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                                    <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>

                                    <div className="mt-2 flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setPreviewOpen(true)}
                                            disabled={!previewUrl}
                                            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold
                                            border border-[#08a4b8]/40 text-[#08a4b8] bg-white shadow-sm
                                            hover:bg-[#08a4b8]/10 hover:shadow-md active:scale-[0.97]
                                            disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                        >
                                            Preview
                                        </button>

                                        {previewUrl && (
                                            <a
                                                href={previewUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-xs font-semibold text-gray-500 hover:text-gray-700 hover:underline"
                                            >
                                                Open in new tab
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={removeFile}
                                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
                                aria-label="Remove file"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                    )}
                </Form.Item>
            </Form>

            <Modal
                open={previewOpen}
                onCancel={() => setPreviewOpen(false)}
                footer={null}
                title={<span className="text-lg font-semibold">Preview Attachment</span>}
                width={900}
                centered
                destroyOnClose
            >
                {!previewUrl ? (
                    <div className="py-10 text-center text-gray-500">No file to preview</div>
                ) : (
                    <div className="overflow-hidden rounded-xl border border-gray-200">
                        <iframe
                            title="pdf-preview"
                            src={previewUrl}
                            className="w-full h-[70vh]"
                        />
                    </div>
                )}
            </Modal>

        </Modal>
    );
}
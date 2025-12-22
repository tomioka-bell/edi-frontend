
import React, { useState, type DragEvent, type ChangeEvent, useEffect } from "react";
import { Modal, Form, Input, DatePicker, message, Select } from "antd";
import type { Dayjs } from "dayjs";
import apiBaseClient from "../../utils/api-base-client";
import { useUser } from "../../contexts/useUserHook";
import toast from "react-hot-toast";

const { RangePicker } = DatePicker;
const { TextArea } = Input;

interface ForecastModalAddProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
  onUpdated?: () => void;
}

interface ForecastFormValues {
  number_forecast: string;
  vendor_code: string;
  period: [Dayjs, Dayjs];
  note?: string;
}

interface ApiError extends Error {
  message: string;
}

export default function ForecastModalAdd({
  isOpen,
  onClose,
  onCreated,
}: ForecastModalAddProps) {
  const [form] = Form.useForm<ForecastFormValues>();
  const [loading, setLoading] = React.useState(false);
  const [file, setFile] = React.useState<File | null>(null);
  const [vendors, setVendors] = useState<{ initials: string; company_name: string }[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { user } = useUser();

  const [isDragging, setIsDragging] = useState(false);

  const handleSubmit = async (values: ForecastFormValues) => {
    try {
      setLoading(true);

      const [periodFrom, periodTo] = values.period;

      const payload = {
        number_forecast: values.number_forecast,
        vendor_code: values.vendor_code,
        created_by_external_id: user?.external_id,
        created_by_source_system: user?.source_system,
        versions: [
          {
            period_from: periodFrom.toDate().toISOString(),
            period_to: periodTo.toDate().toISOString(),
            status_forecast: "DRAFT",
            note: values.note || "",
            created_by_external_id: user?.external_id,
            created_by_source_system: user?.source_system,
          },
        ],
      };

      const formData = new FormData();
      formData.append("payload", JSON.stringify(payload));
      if (file) {
        formData.append("file", file);
      }

      await apiBaseClient.post(`/api/forecasts/create-forecast`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      form.resetFields();
      setFile(null);
      onClose();
      onCreated?.();
      toast.success("Create forecast success");
    } catch (err) {
      const error = err as ApiError;
      console.error(error);
      toast.error(error.message || "Create forecast failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setFile(null);
    onClose();
  };

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

  const removeFile = () => {
    setFile(null);
  };

  useEffect(() => {
    if (isOpen) {
      fetchVendorList();
    }
  }, [isOpen]);

  const fetchVendorList = async () => {
    try {
      const res = await apiBaseClient.get(`/api/vendor-metrics/get-all-vendor-metrics`);
      setVendors(res.data);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load vendors");
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

  return (
    <Modal
      open={isOpen}
      onCancel={handleCancel}
      footer={null}
      title={<span className="text-lg font-semibold">Add Forecast</span>}
      destroyOnClose
      width={750}
      centered
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          quantity: 0,
        }}
        className="mt-6"
      >
        {/* Row 1: Forecast No. & Vendor Code */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item
            label={<span className="font-medium text-root">Forecast No.</span>}
            name="number_forecast"
            rules={[{ message: "Please input forecast number" }]}
          >
            <Input
              placeholder="e.g., FC2025-001"
              size="large"
              className="rounded-lg"
            />
          </Form.Item>

          <Form.Item
            label={<span className="font-medium text-root">Vendor</span>}
            name="vendor_code"
            rules={[{ required: true, message: "Please select vendor" }]}
          >
            <Select
              placeholder="Select vendor"
              size="large"
              className="rounded-lg"
              showSearch
              optionFilterProp="label"
              options={vendors.map(v => ({
                value: v.company_name,
                label: `${v.initials} - ${v.company_name}`,
              }))}
            />
          </Form.Item>

        </div>

        {/* Row 3: Period */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item
            label={<span className="font-medium text-root">Period</span>}
            name="period"
            rules={[{ required: true, message: "Please select period" }]}
          >
            <RangePicker
              className="w-full rounded-lg"
              size="large"
              format="DD/MM/YYYY"
            />
          </Form.Item>


        </div>

        {/* Note */}
        <Form.Item
          label={<span className="font-medium text-root">Note</span>}
          name="note"
        >
          <TextArea
            rows={3}
            placeholder="Initial upload, remark, etc."
            className="rounded-lg"
            size="large"
          />
        </Form.Item>

        {/* File Upload */}
        <Form.Item
          label={<span className="font-medium text-root">Attachment (Optional)</span>}
        >
          {!file ? (
            <div
              className="flex items-center justify-center text-center w-full"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <label
                htmlFor="dropzone-file"
                className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${isDragging
                  ? "border-[#08a4b8] bg-[#08a4b8]/5"
                  : "border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400"
                  }`}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg
                    className={`w-12 h-12 mb-3 transition-colors ${isDragging ? "text-[#08a4b8]" : "text-gray-400"
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
                  <p className="mb-2 text-sm text-gray-700">
                    <span className="font-semibold text-[#08a4b8]">Click to upload</span>
                    <span className="text-gray-500"> or drag and drop</span>
                  </p>
                  <p className="text-xs text-gray-500">PDF files only (Max 10MB)</p>
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
              <p className="text-sm font-medium text-gray-900">{file?.name}</p>
              <p className="text-xs text-gray-500">{(file?.size ?? 0 / 1024).toFixed(2)} KB</p>

              {/* ✅ actions */}
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


        {/* Action Buttons */}
        <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-2.5 rounded-lg border-2 border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            style={{ color: 'white' }}
            className="px-6 py-2.5 rounded-lg bg-[#08a4b8] text-sm font-semibold text-white hover:bg-[#0893a5] active:bg-[#077a8a] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Saving...
              </span>
            ) : (
              "Create Forecast"
            )}
          </button>
        </div>
      </Form>
    </Modal>
  );
}
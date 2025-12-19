import { Modal } from "antd";
import { Eye, Download } from "lucide-react";
import { useState } from "react";
import { buildImageURL } from "../../utils/get-image";
import { downloadFile } from "../../utils/download-file";

interface ViewFileProps {
    file_url: string | null;
    number_forecast: string | null;
}

export default function ViewFile({ file_url, number_forecast }: ViewFileProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fileUrl = file_url ? buildImageURL(file_url) : null;

    console.log("fileUrl : ", fileUrl);

    const isImage = fileUrl
        ? /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(fileUrl)
        : false;

    const isPDF = fileUrl ? /\.pdf$/i.test(fileUrl) : false;

    const openModal = () => {
        if (!fileUrl) return;
        setIsModalOpen(true);
    };

    const handleDownload = () => {
        if (!fileUrl) return;
        downloadFile(
            fileUrl,
            `Forecast-${number_forecast ?? "Unknown"}-Confirmation.pdf`
        );
    };

    const closeModal = () => setIsModalOpen(false);

    return (
        <div>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end pt-4 border-t border-slate-200">
                <button
                    type="button"
                    onClick={openModal}
                    disabled={!fileUrl}
                    style={{ color: "white", fontSize: "14px" }}
                    className="group flex items-center justify-center gap-2 rounded-lg border border-amber-400 bg-amber-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition-all duration-200 hover:border-slate-400 hover:bg-amber-500 hover:shadow-md active:scale-[0.98] sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Eye className="h-4 w-4 transition-colors duration-200 group-hover:text-slate-700" />
                    View File
                </button>

                <button
                    type="button"
                    onClick={handleDownload}
                    disabled={!fileUrl}
                    style={{ color: "white", fontSize: "14px" }}
                    className="group text-white flex items-center justify-center bg-green-400 gap-2 rounded-lg border border-green-500 px-5 py-2.5 text-sm font-semibold transition-all duration-200 hover:bg-green-500 hover:shadow-lg active:scale-[0.98] sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Download className="h-4 w-4 transition-transform duration-200 group-hover:translate-y-0.5" />
                    Download File
                </button>
            </div>

            <Modal
                open={isModalOpen}
                onCancel={closeModal}
                footer={null}
                title={<span className="text-lg font-semibold">View File</span>}
                destroyOnClose
                width={1200}
                centered
            >
                {isImage && fileUrl && (
                    <img
                        src={fileUrl}
                        alt="Document preview"
                        className="max-h-[70vh] mx-auto object-contain"
                    />
                )}

                {isPDF && fileUrl && (
                    <iframe
                        src={fileUrl}
                        className="w-full h-[70vh]"
                        title="Document preview"
                    />
                )}

                {!isImage && !isPDF && fileUrl && (
                    <p className="text-center text-sm text-slate-500">
                        ไม่สามารถ preview ไฟล์นี้ได้ กรุณาใช้ปุ่ม Download แทน
                    </p>
                )}
            </Modal>
        </div>
    );
}

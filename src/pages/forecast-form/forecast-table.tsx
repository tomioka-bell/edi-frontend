import { useEffect, useMemo, useState } from "react";
import type { ForecastStatusLog } from "../../types/forecasts-status";
import { fmtDate, statusColor } from "../../utils/format";
import apiBaseClient from "../../utils/api-base-client";
import { buildImageURL } from "../../utils/get-image";
import { downloadFile } from "../../utils/download-file";
import { FiEye, FiDownload } from "react-icons/fi";

interface ForecastTableProps {
  versionId: string;
  number: string;
}

export default function ForecastTable({ versionId, number }: ForecastTableProps) {
  const [logs, setLogs] = useState<ForecastStatusLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!versionId) return;

    setLoading(true);
    setError(null);

    apiBaseClient
      .get(`/api/forecasts/get-status-log-by-version-id-and-approved/${versionId}`)
      .then((res) => {
        const data = res.data as ForecastStatusLog[];
        setLogs(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message || "Error loading status logs");
        setLogs([]);
      })
      .finally(() => setLoading(false));
  }, [versionId]);


  const latestLog = useMemo(() => {
    if (!logs.length) return null;
    return [...logs].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0];
  }, [logs]);

  const status = latestLog?.new_status ?? "-";
  const note = latestLog?.note ?? "-";
  const fileUrl = latestLog?.file_url
    ? buildImageURL(latestLog.file_url)
    : null;

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
    downloadFile(fileUrl, `Forecast-${number}-Confirmation.pdf`);
  };

  console.log("Error : ", error);

  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="w-full mx-auto">
      <div className="rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-200 bg-neutral-50 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-neutral-900">
            Confirmation Document
          </h3>
          <div className="flex items-center gap-3">
            {loading && (
              <span className="text-xs text-neutral-500">Loading...</span>
            )}
            {/* {error && (
              <span className="text-xs text-red-500">Error: {error}</span>
            )} */}
          </div>
        </div>
        {!loading && latestLog && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Created On
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Note
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    File
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                <tr className="hover:bg-neutral-50 transition-colors">
                  {/* Created On */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-neutral-900">
                        {fmtDate(latestLog.created_at)}
                      </span>
                    </div>
                  </td>

                  {/* Type */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-neutral-900">{status}</span>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ring-1 ${statusColor(
                        status
                      )}`}
                    >
                      {status}
                    </span>
                  </td>

                  {/* Note */}
                  <td className="px-6 py-4">
                    <div className="text-sm text-neutral-900 max-w-xs">
                      {note}
                    </div>
                  </td>

                  {/* File (View in modal / Download) */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {fileUrl ? (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={openModal}
                          style={{ color: "black", fontSize: "13px" }}
                          className="group inline-flex items-center gap-1.5
                          rounded-lg px-3 py-1.5 text-xs font-medium
                          border border-amber-300 transition-all duration-200
                          focus:outline-none focus:ring-2 focus:ring-[#08a4b8]/30"
                        >
                          <FiEye className="h-3.5 w-3.5 transition-transform group-hover:scale-110" />
                          View
                        </button>

                        <button
                          type="button"
                          onClick={handleDownload}
                          style={{ color: "black", fontSize: "13px" }}
                          className=" group inline-flex items-center gap-1.5
                          rounded-lg px-3 py-1.5 text-xs font-medium
                          border border-green-400  transition-all duration-200
                          focus:outline-none focus:ring-2 focus:ring-gray-300"
                        >
                          <FiDownload className="h-3.5 w-3.5 transition-transform group-hover:scale-110" />
                          Download
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-neutral-400">
                        No file
                      </span>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {!loading && !latestLog && (
          <div className="px-6 py-4 text-sm text-neutral-500">
            No status log found for this forecast version.
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && fileUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={e => {if (e.target === e.currentTarget) closeModal();}}>
          <div className="card-root rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b">
              <h4 className="text-sm font-semibold text-neutral-900">
                Preview Document
              </h4>
              <button
                onClick={closeModal}
                className="text-sm text-neutral-500 hover:text-neutral-800"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-4">
              {isImage && (
                <img
                  src={fileUrl}
                  alt="Document preview"
                  className="max-h-[70vh] mx-auto object-contain"
                />
              )}

              {isPDF && (
                <iframe
                  src={fileUrl}
                  className="w-full h-[70vh]"
                  title="PDF preview"
                />
              )}

              {!isImage && !isPDF && (
                <div className="text-sm text-neutral-500">
                  Cannot preview this file type. Please download to view.
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end px-4 py-3 border-t bg-neutral-50">
              <button
                onClick={closeModal}
                className="px-3 py-1.5 text-xs font-medium rounded-md border border-neutral-300 text-neutral-700 hover:bg-neutral-100 transition"
              >
                Close
              </button>


            </div>
          </div>
        </div>
      )}
    </div>
  );
}

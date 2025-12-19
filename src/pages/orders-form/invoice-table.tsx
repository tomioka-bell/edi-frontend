import { useEffect, useState } from "react";
import { fmtDate, statusColor } from "../../utils/format";
import { buildImageURL } from "../../utils/get-image";
import { downloadFile } from "../../utils/download-file";
import { GrAdd } from "react-icons/gr";
import InvoiceModalAdd from "./add-invoice";
import { FiEye, FiDownload } from "react-icons/fi";
import { useUser } from "../../contexts/UserContext";
import { useNavigate } from "react-router-dom";
import apiBaseClient from "../../utils/api-base-client";

interface invoicesTableProps {
  numberOrder: string;
}

interface InvoiceVersion {
  note?: string;
  created_at?: string;
  source_file_url?: string;
}

interface Invoice {
  status_invoice?: string;
  versions?: InvoiceVersion[];
  created_at?: string;
  number_invoice?: string;
  file_url?: string;
}

interface invoicesTableProps {
  numberOrder: string;
}

type FetchError = Error & {
  name: string;
};

export default function InvoiceTable({ numberOrder }: invoicesTableProps) {
  const [invoices, setInvoices] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalAddOpen, setIsModalAddOpen] = useState(false);
  const { user } = useUser();
  const navigate = useNavigate();

  const fetchInvoice = async () => {
    if (!numberOrder) return;

    try {
      setLoading(true);
      setError(null);

      const res = await apiBaseClient.get(
        `/api/invoice/get-order-detail-by-number-order?number_order=${numberOrder}`
      ); 

      const data = res.data as Invoice;
      setInvoices(data);
    } catch (err: unknown) {
      setError((err as FetchError).message || "Error loading invoices");
      console.error("Fetch invoice error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoice();
  }, [numberOrder]);

  // --------------------------------
  // Extract values
  // --------------------------------
  const numberInvoice = invoices?.number_invoice ?? "-";
  const status = invoices?.status_invoice ?? "-";
  const note = invoices?.versions?.[0]?.note ?? "(No note)";
  const createdAt = invoices?.created_at;
  const fileUrl = invoices?.file_url ? buildImageURL(invoices.file_url) : null;

  const isImage = fileUrl ? /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(fileUrl) : false;
  const isPDF = fileUrl ? /\.pdf$/i.test(fileUrl) : false;

  const openModal = () => fileUrl && setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleDownload = () => {
    if (!fileUrl) return;
    downloadFile(fileUrl, `invoices-${numberInvoice}-Confirmation`);
  };

  const hasInvoice =
  invoices &&
  invoices.number_invoice &&
  invoices.status_invoice;

  return (
    <div className="w-full mx-auto">
      <div className="flex justify-end mb-2">
        {user?.source_system === "APP_EMPLOYEE" && (
        <button style={{ color: "white", fontSize: "14px" }} onClick={() => setIsModalAddOpen(true)} className="flex items-center gap-2 bg-[#08a4b8] hover:bg-[#0893a5]
                  text-sm font-semibold text-white px-5 py-2.5 rounded-full shadow-md
                  hover:shadow-lg active:scale-[0.97] transition-all duration-200">
          <GrAdd className="w-4 h-4 hover:animate-spin" />
          Add Invoice
        </button>
        )}
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
        <InvoiceModalAdd isOpen={isModalAddOpen} onClose={() => setIsModalAddOpen(false)} onCreated={fetchInvoice} numberOrder={numberOrder} />
        <div className="px-6 py-4 border-b border-neutral-200 bg-neutral-50 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-neutral-900">
          This Invoices belongs to Order <span className="text-blue-500">#{numberOrder}</span> below
          </h3>

          {loading && <span className="text-xs text-neutral-500">Loading...</span>}
          {error && <span className="text-xs text-red-500">{error}</span>}
        </div>

        {/* table */}
      {!loading && hasInvoice && (
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                 <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Number Invoice
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Created On
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
           <tr
                onClick={() =>
                  navigate(`/en/invoice-form/${numberInvoice}`)
                }
                className="hover:bg-cyan-50 transition-colors cursor-pointer"
              >

                 <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-neutral-900">
                    {numberInvoice}
                  </span>
                </td>


                {/* Created Date */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-neutral-900">
                    {fmtDate(createdAt)}
                  </span>
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

                {/* File */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {fileUrl ? (
                    <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            openModal();
                          }}
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
                          onClick={e => {
                            e.stopPropagation();
                            handleDownload();
                          }}
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
                    <span className="text-xs text-neutral-400">No File</span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        )}

      {!loading && !hasInvoice && (
        <div className="px-6 pt-4 text-start">
          <p className="text-sm font-medium text-neutral-600">
            No status log found for this order
          </p>
        </div>
      )}
      </div>

      {/* Preview Modal */}
      {isModalOpen && fileUrl && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center"  onClick={e => {if (e.target === e.currentTarget) closeModal();}}>
          <div className="card-root rounded-lg max-w-4xl w-full max-h-[90vh] p-4 flex flex-col">
            <div className="flex justify-between items-center border-b pb-2">
              <h4 className="font-semibold text-sm">Preview Document</h4>
              <button
                onClick={closeModal}
                className="text-neutral-500 hover:text-neutral-800"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-auto py-4">
              {isImage && <img src={fileUrl} className="max-h-[70vh] mx-auto" />}
              {isPDF && <iframe src={fileUrl} className="w-full h-[70vh]" />}
              {!isImage && !isPDF && (
                <p className="text-sm text-neutral-500">Cannot preview file</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

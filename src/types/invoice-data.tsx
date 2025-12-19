export type InvoiceRow = {
  id: string;
  edi_invoice_id: string; 
  number_invoice: string;
  vendor_code: string;  
  status_invoice: string;
  av_version_no: number | null;
  av_status: string | null;
  av_quantity: number | null;
  av_period_from: string | null;
  av_period_to: string | null;
  read_invoice: boolean | null;
  av_note: string | null;
  created_at: string;
  last_new_status: string | null;
  file_url?: string | null; 
};
export interface InvoiceVersionFormValues {
  edi_invoice_id: string;
  period_from: string | null;
  period_to: string | null;
  status_invoice: string;
  read_invoice: boolean;
  note: string;
  created_by_user_id?: string;
  row_ver?: string;
  created_by_external_id?: string;
  created_by_source_system?: string;
}

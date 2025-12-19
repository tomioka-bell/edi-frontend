export type VersionItem = {
  edi_invoice_version_id: string;
  version_no: number;
  period_from: string | null;
  period_to: string | null;
  status_invoice: string;
  read_invoice: boolean;
  note: string;
  quantity: number | null;
  source_file_url: string | null;
  created_at: string;
  is_active: boolean;
  created_by: {
    user_id: string;
    display_name: string;
    email: string;
    profile: string;
    group: string;
  };
};

export type InvoiceDetailResp = {
  edi_invoice_id: string;
  number_invoice: string;
  number_order: string | null;
  vendor_code: string;
  read_invoice: boolean;
  product_code: string | null;
  active_version_id: string | null;
  file_url: string | null;
  status_invoice: string;
  created_at: string;
  updated_at: string;
  versions: VersionItem[];
  created_by: CreatedByUserResp;
};

export type CreatedByUserResp = {
  user_id: string;
  display_name: string;
  email: string;
  profile: string;
  group: string;
};


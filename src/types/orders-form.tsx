export type VersionItem = {
  edi_order_version_id: string;
  version_no: number;
  period_from: string | null;
  period_to: string | null;
  status_order: string;
  read_order: boolean;
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

export type OrderDetailResp = {
  edi_order_id: string;
  number_order: string;
  number_forecast: string | null;
  read_order: boolean;
  vendor_code: string;
  product_code: string | null;
  active_version_id: string | null;
  file_url: string | null;
  status_order: string;
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


export type VersionItem = {
  edi_forecast_version_id: string;
  version_no: number;
  period_from: string | null;
  period_to: string | null;
  status_forecast: string;
  read_forecast: boolean;
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

export type ForecastDetailResp = {
  edi_forecast_id: string;
  number_forecast: string;
  vendor_code: string;
  read_forecast: boolean;
  product_code: string | null;
  active_version_id: string | null;
  file_url: string | null;
  status_forecast: string;
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


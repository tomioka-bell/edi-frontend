export type ForecastRow = {
  id: string;
  edi_forecast_id: string;
  number_forecast: string;
  vendor_code: string;
  status_forecast: string;
  av_version_no: number | null;
  av_status: string | null;
  av_period_from: string | null;
  av_period_to: string | null;
  read_forecast: boolean | null;
  av_note: string | null;
  created_at: string;
  last_new_status: string | null;
  file_url?: string | null; 
};
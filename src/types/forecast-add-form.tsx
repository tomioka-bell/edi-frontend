export interface ForecastVersionFormValues {
  edi_forecast_id: string;
  period_from: string | null;
  period_to: string | null;
  status_forecast: string;
  read_forecast: boolean;
  note: string;
  created_by_user_id?: string;
  row_ver?: string;
  created_by_external_id?: string;
  created_by_source_system?: string;
}
export type OrderRow = {
  id: string;
  edi_order_id: string; 
  number_order: string;
  vendor_code: string;  
  status_order: string;
  av_version_no: number | null;
  av_status: string | null;
  av_quantity: number | null;
  av_period_from: string | null;
  av_period_to: string | null;
  read_order: boolean | null;
  av_note: string | null;
  created_at: string;
  last_new_status: string | null;
  file_url?: string | null; 
};

export type OrderByForecaset = {
    edi_order_id: string;
    number_order: string;
    number_forecast: string;
    vendor_code: string;
    status_order: string;
    created_at: string;
    period_to: string;
};
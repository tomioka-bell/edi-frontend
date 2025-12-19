export interface OrderVersionFormValues {
  edi_order_id: string;
  period_from: string | null;
  period_to: string | null;
  status_order: string;
  read_order: boolean;
  note: string;
  created_by_user_id?: string;
  row_ver?: string;
  created_by_external_id?: string;
  created_by_source_system?: string;
}
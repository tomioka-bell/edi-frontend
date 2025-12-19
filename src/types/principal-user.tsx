export interface PrincipalUser {
  edi_principal_id: string;
  external_id: string;
  status: string;
  display_name: string;
  email: string;
  group: string;
  role: string;
  login_without_otp: boolean;
  username: string;
  role_name: string;
  source_system: string;
}

export interface ExistingRecipient {
  vendor_notification_recipient_id: string;
  company: string;
  notification_type: string;
  principal: {
    external_id: string;
    email: string;
  };
}

export interface Vendor {
  user_id: string;
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  group: string;
  status: string;
  login_without_otp: boolean;
}
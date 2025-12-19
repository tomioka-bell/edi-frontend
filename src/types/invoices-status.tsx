export type InvoicestatusLog = {
    edi_invoice_version_id: string;
    old_status: string;
    new_status: string;
    note: string;
    created_by_external_id: string;
    created_by_source_system: string;
    created_at: string;
    file_url: string;
    changed_by_user?: Principal | null;
};

export type Principal = {
    external_id: string;
    source_system: string;
    email: string;
    display_name: string;
    username: string;
    profile: string;
    group: string;
    role: string;
    status: string;
};


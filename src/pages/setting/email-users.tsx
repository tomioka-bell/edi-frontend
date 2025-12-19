import React, { useState, useEffect } from 'react';
import { X, Mail, Plus, Check } from 'lucide-react';
import { SaveOutlined } from '@ant-design/icons';
import type { PrincipalUser, ExistingRecipient } from '../../types/principal-user';
import apiBaseClient from '../../utils/api-base-client';
import toast from 'react-hot-toast';

interface EmailVendorsProps {
    principals: PrincipalUser[];
    company: string;
}

const NOTIFICATION_TYPES = ["FORECAST", "ORDER", "INVOICE"] as const;
type NotificationType = (typeof NOTIFICATION_TYPES)[number];

type SelectedEmailMap = Record<NotificationType, PrincipalUser[]>;
type BooleanMap = Record<NotificationType, boolean>;
type StringMap = Record<NotificationType, string>;

const initialSelectedMap: SelectedEmailMap = {
    FORECAST: [],
    ORDER: [],
    INVOICE: [],
};

const initialBooleanMap: BooleanMap = {
    FORECAST: false,
    ORDER: false,
    INVOICE: false,
};

const initialSearchMap: StringMap = {
    FORECAST: '',
    ORDER: '',
    INVOICE: '',
};



export default function EmailUsers({ principals, company }: EmailVendorsProps) {
    const availableEmails: PrincipalUser[] = principals;

    const [selectedEmailsByType, setSelectedEmailsByType] = useState<SelectedEmailMap>(initialSelectedMap);
    const [existingRecipients, setExistingRecipients] = useState<ExistingRecipient[]>([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState<BooleanMap>(initialBooleanMap);
    const [searchTerms, setSearchTerms] = useState<StringMap>(initialSearchMap);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // ===== 1) โหลดข้อมูลที่เคยตั้งไว้แล้ว สำหรับทุก notificationType =====
    useEffect(() => {
        const fetchExisting = async () => {
            try {
                setIsLoading(true);
                const res = await apiBaseClient.get(
                    `/api/company/get-email-by-company?company=${encodeURIComponent(company)}`
                );
                const data: ExistingRecipient[] = res.data;

                setExistingRecipients(data);

                // สร้าง selectedEmails แยกตาม notificationType
                const nextSelected: SelectedEmailMap = {
                    FORECAST: [],
                    ORDER: [],
                    INVOICE: []
                };

                NOTIFICATION_TYPES.forEach((type) => {
                    const filteredByType = data.filter(r => r.notification_type === type);

                    nextSelected[type] = availableEmails.filter(p =>
                        filteredByType.some(
                            r => r.principal.email.toLowerCase() === p.email.toLowerCase()
                        )
                    );
                });

                setSelectedEmailsByType(nextSelected);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchExisting();
    }, [company, availableEmails]);

    const toggleEmail = (type: NotificationType, email: PrincipalUser): void => {
        setSelectedEmailsByType(prev => {
            const isSelected = prev[type].some(e => e.edi_principal_id === email.edi_principal_id);
            if (isSelected) {
                return {
                    ...prev,
                    [type]: prev[type].filter(e => e.edi_principal_id !== email.edi_principal_id),
                };
            }
            return {
                ...prev,
                [type]: [...prev[type], email],
            };
        });
    };

    const removeEmail = (type: NotificationType, emailId: string): void => {
        setSelectedEmailsByType(prev => ({
            ...prev,
            [type]: prev[type].filter(e => e.edi_principal_id !== emailId),
        }));
    };

    const handleSave = async (): Promise<void> => {
        try {
            setIsSaving(true);

            const createRequests: Promise<void>[] = [];
            const deleteRequests: Promise<void>[] = [];

            NOTIFICATION_TYPES.forEach((type) => {
                const existingForType = existingRecipients.filter(
                    r => r.notification_type === type
                );

                const existingEmailSet = new Set(
                    existingForType.map(r => r.principal.email.toLowerCase())
                );

                const selectedForType = selectedEmailsByType[type];
                const selectedEmailSet = new Set(
                    selectedForType.map(p => p.email.toLowerCase())
                );

                const toCreate = selectedForType.filter(
                    p => !existingEmailSet.has(p.email.toLowerCase())
                );

                const toDelete = existingForType.filter(
                    r => !selectedEmailSet.has(r.principal.email.toLowerCase())
                );

                // create
                toCreate.forEach(p => {
                    createRequests.push(
                        apiBaseClient.post(`/api/company/create-notification-recipient`, {
                            company,
                            notification_type: type,
                            edi_principal_id: p.edi_principal_id,
                        })
                    );
                });

                // delete
                toDelete.forEach(r => {
                    deleteRequests.push(
                        apiBaseClient.delete(
                            `/api/company/delete-notification-recipient-vendor?vendor_notification_recipient_id=${encodeURIComponent(
                                r.vendor_notification_recipient_id
                            )}`
                        )
                    );
                });

               
            });

            await Promise.all([...createRequests, ...deleteRequests]);

            // reload recipients
            const res = await apiBaseClient.get(
                `/api/company/get-email-by-company?company=${encodeURIComponent(company)}`
            );
            const data: ExistingRecipient[] = res.data;
            setExistingRecipients(data);

            toast.success(
                `Settings saved successfully! Total selected emails: ${
                    NOTIFICATION_TYPES.reduce(
                        (sum, t) => sum + selectedEmailsByType[t].length,
                        0
                    )
                }`
            );
        } catch (err: unknown) {
            console.error(err);
            toast.error(`Failed to save settings: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
            setIsSaving(false);
        }
    };

    const sectionMeta: Record<NotificationType, { title: string; subtitle: string; description: string }> = {
        FORECAST: {
            title: "Forecast Notification",
            subtitle: "Be informed whenever the customer sends a forecast update",
            description: "Select email addresses to receive notifications when new forecasts are received."
        },
        ORDER: {
            title: "Order Notification",
            subtitle: "Be informed whenever the customer places or updates an order",
            description: "Select email addresses to receive notifications when orders are created or updated."
        },
        INVOICE: {
            title: "Invoice Notification",
            subtitle: "Be informed whenever the customer places or updates an invoice",
            description: "Select email addresses to receive notifications when invoice are created or updated."
        }
    };

    return (
        <div>
            <div className="card-root rounded-lg shadow-sm">
                <div className="border-b border-gray-200 px-6 py-4">
                    <h1 className="text-2xl font-semibold text-root">Email Notification</h1>
                    <p className="text-sm text-gray-600 mt-1">
                        Manage notification recipients for Forecast, Order and Invoice
                    </p>
                    {isLoading && (
                        <p className="text-xs text-gray-500 mt-1">
                            Loading existing settings...
                        </p>
                    )}
                </div>

                <div className="p-6 space-y-8">
                    {NOTIFICATION_TYPES.map((type) => {
                        const meta = sectionMeta[type];
                        const selectedEmails = selectedEmailsByType[type];
                        const filteredEmails = availableEmails.filter(email =>
                            email.email.toLowerCase().includes(
                                searchTerms[type].toLowerCase()
                            )
                        );

                        return (
                            <div key={type} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <div>
                                        <h2 className="text-lg font-semibold text-root flex items-center gap-2">
                                            <Mail className="w-4 h-4" />
                                            {meta.title}
                                        </h2>
                                        <p className="text-xs text-gray-500">
                                            {meta.subtitle}
                                        </p>
                                    </div>
                                    <span className="text-[10px] px-2 py-1 rounded-full bg-blue-50 text-blue-700 font-medium">
                                        {type}
                                    </span>
                                </div>

                                {selectedEmails.length > 0 && (
                                    <div className="mb-3 flex flex-wrap gap-2">
                                        {selectedEmails.map(email => (
                                            <div
                                                key={email.edi_principal_id}
                                                className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-md text-sm"
                                            >
                                                <Mail className="w-3.5 h-3.5" />
                                                <span>{email.email}</span>
                                                <button
                                                    onClick={() => removeEmail(type, email.edi_principal_id)}
                                                    className="hover:bg-blue-100 rounded p-0.5 transition-colors"
                                                    type="button"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="relative">
                                    <button
                                        onClick={() =>
                                            setIsDropdownOpen(prev => ({
                                                ...prev,
                                                [type]: !prev[type],
                                            }))
                                        }
                                        className="w-full flex items-center justify-between px-4 py-2.5 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        type="button"
                                    >
                                        <span className="text-gray-700">
                                            {selectedEmails.length === 0
                                                ? 'Select email addresses to receive notifications'
                                                : `Selected ${selectedEmails.length} email addresses`}
                                        </span>
                                        <Plus
                                            className={`w-5 h-5 text-gray-400 transition-transform ${
                                                isDropdownOpen[type] ? 'rotate-45' : ''
                                            }`}
                                        />
                                    </button>

                                    {isDropdownOpen[type] && (
                                        <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
                                            <div className="p-3 border-b border-gray-200">
                                                <input
                                                    type="text"
                                                    placeholder="Search emails..."
                                                    value={searchTerms[type]}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                        setSearchTerms(prev => ({
                                                            ...prev,
                                                            [type]: e.target.value,
                                                        }))
                                                    }
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                />
                                            </div>

                                            <div className="max-h-64 overflow-y-auto">
                                                {filteredEmails.length === 0 ? (
                                                    <div className="p-4 text-center text-gray-500 text-sm">
                                                        No matching emails found
                                                    </div>
                                                ) : (
                                                    filteredEmails.map(email => {
                                                        const isSelected = selectedEmails.some(
                                                            e => e.edi_principal_id === email.edi_principal_id
                                                        );
                                                        return (
                                                            <button
                                                                key={email.edi_principal_id}
                                                                onClick={() => toggleEmail(type, email)}
                                                                className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                                                                type="button"
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div
                                                                        className={`w-5 h-5 border-2 rounded flex items-center justify-center ${
                                                                            isSelected
                                                                                ? 'bg-blue-500 border-blue-500'
                                                                                : 'border-gray-300'
                                                                        }`}
                                                                    >
                                                                        {isSelected && (
                                                                            <Check className="w-3.5 h-3.5 text-white" />
                                                                        )}
                                                                    </div>
                                                                    <div>
                                                                        <div className="text-xs text-gray-500">
                                                                            {email.email}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </button>
                                                        );
                                                    })
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <p className="mt-2 text-xs text-gray-500 pt-2">
                                    {meta.description}
                                </p>
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 px-6 py-4 card-root flex justify-end gap-3">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        style={{ color: "white", fontSize: "14px" }}
                        className="px-4 py-2 text-sm font-medium text-white bg-[#08a4b8] hover:bg-[#068ea0] rounded-lg transition-colors disabled:opacity-50"
                        type="button"
                    >
                        <SaveOutlined className="mr-2" />
                        {isSaving ? "Saving..." : "Save all"}
                    </button>
                </div>
            </div>
        </div>
    );
}

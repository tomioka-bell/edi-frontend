import React, { useState, useEffect } from 'react';
import { X, Mail, Plus, Check } from 'lucide-react';
import { SaveOutlined } from '@ant-design/icons';
import type { PrincipalUser, ExistingRecipient } from '../../types/principal-user';
import toast from 'react-hot-toast';
import apiBaseClient from '../../utils/api-base-client';

interface EmailVendorsProps {
    principals: PrincipalUser[];
    company: string;
    notificationType: string;
}

export default function EmailVendors({ principals, company, notificationType }: EmailVendorsProps) {
    const availableEmails: PrincipalUser[] = principals;

    const [selectedEmails, setSelectedEmails] = useState<PrincipalUser[]>([]);
    const [existingRecipients, setExistingRecipients] = useState<ExistingRecipient[]>([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    console.log("isLoading", isLoading);

    useEffect(() => {
        const fetchExisting = async () => {
            try {
                setIsLoading(true);
                const res = await apiBaseClient.get(`/api/company/get-email-by-company`, {
                    params: { company }
                });
                const data: ExistingRecipient[] = res.data;

                setExistingRecipients(data);

                const filteredByType = data.filter(
                    r => r.notification_type === notificationType
                );

                const selected = availableEmails.filter(p =>
                    filteredByType.some(r => r.principal.email.toLowerCase() === p.email.toLowerCase())
                );

                setSelectedEmails(selected);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchExisting();
    }, [company, notificationType, availableEmails]);

    const toggleEmail = (email: PrincipalUser): void => {
        const isSelected = selectedEmails.some(e => e.edi_principal_id === email.edi_principal_id);
        if (isSelected) {
            setSelectedEmails(prev => prev.filter(e => e.edi_principal_id !== email.edi_principal_id));
        } else {
            setSelectedEmails(prev => [...prev, email]);
        }
    };

    const removeEmail = (emailId: string): void => {
        setSelectedEmails(prev => prev.filter(e => e.edi_principal_id !== emailId));
    };

    const filteredEmails = availableEmails.filter(email =>
        email.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSave = async (): Promise<void> => {
        try {
            setIsSaving(true);

            const existingForType = existingRecipients.filter(
                r => r.notification_type === notificationType
            );
            const existingEmailSet = new Set(
                existingForType.map(r => r.principal.email.toLowerCase())
            );

            const selectedEmailSet = new Set(
                selectedEmails.map(p => p.email.toLowerCase())
            );

            const toCreate = selectedEmails.filter(
                p => !existingEmailSet.has(p.email.toLowerCase())
            );

            const toDelete = existingForType.filter(
                r => !selectedEmailSet.has(r.principal.email.toLowerCase())
            );

            await Promise.all(
                toCreate.map(p =>
                    apiBaseClient.post(`/api/company/create-notification-recipient`, {
                        company,
                        notification_type: notificationType,
                        edi_principal_id: p.edi_principal_id,
                    }).catch(err => {
                        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
                        toast.error(errorMsg);
                        throw err;
                    })
                )
            );

            await Promise.all(
                toDelete.map(r =>
                    apiBaseClient.delete(
                        `/api/company/delete-notification-recipient-vendor?vendor_notification_recipient_id=${encodeURIComponent(
                            r.vendor_notification_recipient_id
                        )}`
                    ).catch(err => {
                        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
                        throw new Error(`delete failed: ${errorMsg}`);
                    })
                )
            );

            const res = await apiBaseClient.get(
                `/api/company/get-email-by-company?company=${company}`
            );
            const data: ExistingRecipient[] = res.data;
            setExistingRecipients(data);

            toast.success(`Settings saved successfully! Notification will be sent to ${selectedEmails.length} emails`);
        } catch (err: unknown) {
            console.error(err);
            toast.error(`Failed to save settings: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div>

            <div className="card-root rounded-lg shadow-sm">

                <div className="border-b border-gray-200 px-6 py-4">
                    <h1 className="text-2xl font-semibold text-root">Email Notification</h1>
                    <p className="text-sm text-gray-600 mt-1">Forecast & Order</p>
                    <p className="text-sm text-gray-600 mt-1">Be informed whenever the customer sends a forecast or order an update</p>
                </div>

                <div className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-root mb-2">
                            <Mail className="inline w-4 h-4 mr-2" />
                            Get email notifications
                        </label>

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
                                            onClick={() => removeEmail(email.edi_principal_id)}
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
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="w-full flex items-center justify-between px-4 py-2.5 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                                type="button"
                            >
                                <span className="text-gray-700">
                                    {selectedEmails.length === 0
                                        ? 'Select email addresses to receive notifications'
                                        : `Selected ${selectedEmails.length} email addresses`}
                                </span>
                                <Plus className={`w-5 h-5 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-45' : ''}`} />
                            </button>

                            {isDropdownOpen && (
                                <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
                                    <div className="p-3 border-b border-gray-200">
                                        <input
                                            type="text"
                                            placeholder="Search emails..."
                                            value={searchTerm}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
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
                                                const isSelected = selectedEmails.some(e => e.edi_principal_id === email.edi_principal_id);
                                                return (
                                                    <button
                                                        key={email.edi_principal_id}
                                                        onClick={() => toggleEmail(email)}
                                                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                                                        type="button"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-5 h-5 border-2 rounded flex items-center justify-center ${isSelected
                                                                ? 'bg-blue-500 border-blue-500'
                                                                : 'border-gray-300'
                                                                }`}>
                                                                {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                                                            </div>
                                                            <div>
                                                                <div className="text-xs text-gray-500">{email.email}</div>
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
                            Select email addresses to receive notifications when important activities occur in the system
                        </p>
                    </div>
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
                        {isSaving ? "Saving..." : "Save"}
                    </button>
                </div>
            </div>
        </div>
    );
}
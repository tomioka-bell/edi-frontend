import { useState } from "react";
import { Modal, Input, InputNumber, Form, Button } from "antd";
import apiBaseClient from "../../utils/api-base-client";
import { toast } from "react-hot-toast";

interface VandorAddModalProps {
    open: boolean;
    onClose: () => void;
    fetchVendorMetrics: () => void;
}

interface VendorFormValues {
    company_name: string;
    initials: string;
    reminder_days: number;
    active?: boolean;
}

export default function VendorAddModal({
    open,
    onClose,
    fetchVendorMetrics,
}: VandorAddModalProps) {
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();

    const handleSubmit = async (values: VendorFormValues) => {
        try {
            setLoading(true);

            await apiBaseClient.post(`/api/vendor-metrics/create-vendor-metrics`, values);

            // รีเฟรชข้อมูลตาราง
            fetchVendorMetrics();

            // ปิด modal
            onClose();

            // ล้างฟอร์ม
            form.resetFields();

            toast.success("Create Vendor successfully");
        } catch (err) {
            console.error(err);
            toast.error("Create Vendor failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Add Vendor"
            open={open}
            onCancel={onClose}
            footer={null}
            destroyOnClose
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{ active: true }}
            >

                <Form.Item
                    label="Company Name"
                    name="company_name"
                    rules={[{ required: true, message: "Required" }]}
                >
                    <Input />
                </Form.Item>

                 <Form.Item
                    label="Initials"
                    name="initials"
                    rules={[{ required: true, message: "Required" }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Reminder Day"
                    name="reminder_days"
                    rules={[{ required: true, message: "Required" }]}
                >
                    <InputNumber className="w-full" />
                </Form.Item>


                <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        className="w-full"
                    >
                        Create Vendor
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
}

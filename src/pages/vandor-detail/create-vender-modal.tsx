import { Modal, Form, Button, Input, Upload } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import { UploadOutlined } from '@ant-design/icons';
import { useState } from 'react';
import apiBaseClient from '../../utils/api-base-client';
import { toast } from "react-hot-toast";

interface CreateVendorModalProps {
    companyVendor?: string;
    open: boolean;
    onCancel: () => void;
    fetchVendorMetrics: () => void;
}

export default function CreateVendorModal({
    companyVendor,
    open,
    onCancel,
    fetchVendorMetrics,
}: CreateVendorModalProps) {
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState<UploadFile<unknown>[]>([]);

    const handleSubmit = async (values: Record<string, unknown>) => {
        try {
            setLoading(true);
            const formData = new FormData();

            if (values.firstname) formData.append('firstname', String(values.firstname));
            if (values.lastname) formData.append('lastname', String(values.lastname));
            if (values.username) formData.append('username', String(values.username));
            if (values.email) formData.append('email', String(values.email));
            if (companyVendor) {
                formData.append("group", companyVendor);
            }

            if (values.role) formData.append('role', String(values.role));
            if (values.password) formData.append('password', String(values.password));
            if (values.status) formData.append('status', String(values.status));

            if (fileList.length > 0 && fileList[0].originFileObj) {
                formData.append('profile', fileList[0].originFileObj as File);
            }

            await apiBaseClient.post(`/api/user/create-user`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            fetchVendorMetrics();

            onCancel();

            form.resetFields();
            setFileList([]);

            toast.success('Create User successfully');
        } catch (err) {
            console.error(err);
            toast.error('Create User failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            open={open}
            onCancel={onCancel}
            title="Create User"
            footer={null}
            destroyOnClose
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
                    status: 'active',
                }}
            >

                <Form.Item
                    label="First name"
                    name="firstname"
                    rules={[{ required: true, message: 'กรุณากรอกชื่อ' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Last name"
                    name="lastname"
                    rules={[{ required: true, message: 'กรุณากรอกนามสกุล' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Email"
                    name="email"
                    rules={[
                        { required: true, message: 'กรุณากรอกอีเมล' },
                        { type: 'email', message: 'รูปแบบอีเมลไม่ถูกต้อง' },
                    ]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Password"
                    name="password"
                    rules={[{ required: true, message: 'กรุณากรอกรหัสผ่าน' }]}
                >
                    <Input.Password />
                </Form.Item>



                <Form.Item label="Profile picture" name="profile">
                    <Upload
                        beforeUpload={() => false}
                        fileList={fileList}
                        onChange={({ fileList }) => setFileList(fileList)}
                        maxCount={1}
                        accept="image/*"
                    >
                        <Button icon={<UploadOutlined />}>เลือกไฟล์</Button>
                    </Upload>
                </Form.Item>


                <Form.Item shouldUpdate>
                    {() => (
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            block
                            disabled={
                                form.getFieldsError().some(({ errors }) => errors.length > 0)
                            }
                        >
                            Submit
                        </Button>
                    )}
                </Form.Item>
            </Form>
        </Modal>
    );
}

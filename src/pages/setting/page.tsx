import Layout from '../../layouts/layout';
import { SettingOutlined } from '@ant-design/icons';
import EmailVendors from './email-vendors';
import { useUser } from "../../contexts/useUserHook";
import { useEffect, useState } from "react";
import apiBaseClient from "../../utils/api-base-client";
import type { PrincipalUser } from "../../types/principal-user";
import EmailUsers from "./email-users";

export default function SettingsPage() {

  const { user } = useUser();
 const sourceSystem = user?.source_system;
  const group = user?.group;

  const isEmployee = sourceSystem === "APP_EMPLOYEE";
  const isVendor = sourceSystem === "APP_USER"; 

  const [principalUsers, setPrincipalUsers] = useState<PrincipalUser[]>([]);
  const [loadingPrincipals, setLoadingPrincipals] = useState(false);
  const [principalError, setPrincipalError] = useState<string | null>(null);

  useEffect(() => {
    if (!group) return;

    const fetchPrincipals = async () => {
      try {
        setLoadingPrincipals(true);
        setPrincipalError(null);

        const res = await apiBaseClient.get(
          `/api/user/get-by-group?group=${encodeURIComponent(group)}`
        );

        const data: PrincipalUser[] = res.data;
        setPrincipalUsers(data || []);
      } catch (err: unknown) {
        console.error("Failed to fetch principals by group:", err);
        setPrincipalError(err instanceof Error ? err.message : "Failed to load principals");
      } finally {
        setLoadingPrincipals(false);
      }
    };

    fetchPrincipals();
  }, [group]);

  return (
    <Layout>
      <div className="flex items-center gap-2 pb-4">
        <div className="relative w-12 h-12 card-root rounded-2xl flex items-center justify-center shadow-lg">
          <SettingOutlined />
        </div>

        <h1 className="text-2xl ml-4 font-semibold text-root">Settings</h1>
      </div>

      <div className="card-root rounded-lg shadow-sm p-4 bg-linear-to-r from-sky-50 to-blue-100">
        {/* แสดงสถานะโหลด / error ถ้าอยาก */}
        {loadingPrincipals && (
          <div className="text-sm text-gray-500 mb-2">
            Loading users by group...
          </div>
        )}
        {principalError && (
          <div className="text-sm text-red-500 mb-2">
            {principalError}
          </div>
        )}

        {/* ผู้ขาย (Vendor) */}
        {isVendor && (
          <EmailVendors
            principals={principalUsers}
            company={user?.group ?? ""}
            notificationType="VENDOR"
          />
        )}

        {/* พนักงาน (Employee) */}
        {isEmployee && (
          <>
            <EmailUsers principals={principalUsers} company={user?.group ?? ""} />
          </>
        )}

        {/* {isEmployee && (
          <UserList />
        )} */}

      </div>
    </Layout>
  );
}

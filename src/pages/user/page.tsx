import Layout from '../../layouts/layout';
import { MdOutlineAdminPanelSettings } from "react-icons/md";
import { useUser } from "../../contexts/useUserHook";
import UserList from "./user-list";

export default function UserPage() {

  const { user } = useUser();
  const sourceSystem = user?.source_system;

  const isEmployee = sourceSystem === "APP_EMPLOYEE";

  return (
    <Layout>
      <div className="flex items-center gap-2 pb-4">
        <div className="relative w-12 h-12 card-root rounded-2xl flex items-center justify-center shadow-lg">
          <MdOutlineAdminPanelSettings className='h-6 w-6' />
        </div>

        <h1 className="text-2xl ml-4 font-semibold text-root">User Management</h1>
      </div>

      <div className="">
        {isEmployee && (
          <UserList />
        )}

      </div>
    </Layout>
  );
}

import Layout from '../../layouts/layout';
// import { FileOutlined } from '@ant-design/icons';
import VendorData from './vendor-data';
import { TbUsersGroup } from "react-icons/tb";

export default function VendorsPage() {
    return (
        <Layout>
            <div className="flex items-center gap-2 pb-4">
                <div className="relative w-12 h-12 card-root rounded-2xl flex items-center justify-center shadow-lg">
                    <TbUsersGroup className="text-xl"/>
                </div>

                <h1 className="text-2xl ml-4 font-semibold text-root">Vendors</h1>
            </div>
            <div className="card-root rounded-lg shadow-sm py-4">
                <VendorData />
            </div>
        </Layout>
    );
}
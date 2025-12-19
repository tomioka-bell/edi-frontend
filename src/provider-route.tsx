import { Outlet } from "react-router-dom";
import { UserProvider } from "./contexts/UserContext";

export default function ProviderRoute() {
    return (
        <UserProvider>
            <Outlet />
        </UserProvider>
    );
}

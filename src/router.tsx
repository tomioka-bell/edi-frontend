import { Routes, Route, Navigate, useLocation } from "react-router-dom";
// import { AnimatePresence } from "framer-motion";

import LoginPage from "./pages/login/page";
import ForecastPage from "./pages/forecast/page";
import { RequireRole } from "./components/require";
import ProviderRoute from "./provider-route";
import NotFound from "./layouts/not-found";
import ForgotPasswordPage from "./pages/forgot-password/page";
import ResetPasswordPage from "./pages/reset-password/page";
import OrdersPage from "./pages/orders/page";
import InvoicesPage from "./pages/invoices/page";
import SettingsPage from "./pages/setting/page";
import VendorsPage from "./pages/vendors/page";
import ForecastFormPage from "./pages/forecast-form/page";
import VendorDetailPage from "./pages/vandor-detail/page";
import OrdersFormPage from "./pages/orders-form/page";
import InvoicesFormPage from "./pages/invoices-form/page";
import UserPage from "./pages/user/page";

function Router() {
  const location = useLocation();

  return (
      <Routes location={location}>
        <Route path="/" element={<Navigate to="/en" replace />} />

        {/* PUBLIC */}
        <Route path=":lang/login" element={<LoginPage />} />
        <Route path=":lang/forgot-password" element={<ForgotPasswordPage />} />
        <Route path=":lang/reset-password" element={<ResetPasswordPage />} />

        {/* PROTECTED */}
        <Route path=":lang" element={<ProviderRoute />}>
          <Route index element={<Navigate to="forecast" replace />} />

          <Route
            path="forecast"
            element={
              <RequireRole allow={["SU", "ENGINEER 1", "VENDER"]}>
                <ForecastPage />
              </RequireRole>
            }
          />

          <Route
            path="orders"
            element={
              <RequireRole allow={["SU", "HR", "ENGINEER 1", "VENDER"]}>
                <OrdersPage />
              </RequireRole>
            }
          />

          <Route
            path="invoices"
            element={
              <RequireRole allow={["SU", "HR", "ENGINEER 1", "VENDER"]}>
                <InvoicesPage />
              </RequireRole>
            }
          />

          <Route
            path="settings"
            element={
              <RequireRole allow={["SU", "ENGINEER 1", "VENDER"]}>
                <SettingsPage />
              </RequireRole>
            }
          />

          <Route
            path="vendors"
            element={
              <RequireRole allow={["SU", "HR", "ENGINEER 1", "VENDER"]}>
                <VendorsPage />
              </RequireRole>
            }
          />

          <Route
            path="forecast-form/:number"
            element={
              <RequireRole allow={["SU", "ENGINEER 1", "VENDER"]}>
                <ForecastFormPage />
              </RequireRole>
            }
          />

          <Route
            path="vendor-detail"
            element={
              <RequireRole allow={["SU", "HR", "ENGINEER 1"]}>
                <VendorDetailPage />
              </RequireRole>
            }
          />

          <Route
            path="order-form/:number"
            element={
              <RequireRole allow={["SU", "HR", "ENGINEER 1", "VENDER"]}>
                <OrdersFormPage />
              </RequireRole>
            }
          />

          <Route
            path="invoice-form/:number"
            element={
              <RequireRole allow={["SU", "HR", "ENGINEER 1", "VENDER"]}>
                <InvoicesFormPage />
              </RequireRole>
            }
          />

          <Route
            path="user"
            element={
              <RequireRole allow={["SU", "ENGINEER 1"]}>
                <UserPage />
              </RequireRole>
            }
          />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
  );
}

export default Router;

import React, { useEffect } from "react";
import Sidebar from "../components/sidebar";
import Navbar from "../components/navbar";
import { useNavigate, useLocation } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import PageTransition from "../components/page-transition"

export default function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const msg = (location.state as any)?.toast;
    if (msg) {
      if (msg === "unauthorized") {
        toast.error("You do not have permission to access this page.");
      } else if (msg === "logout") {
        toast.success("Log out successfully");
      }
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  return (
    <div className="flex page-root">
      <Toaster position="top-center" reverseOrder={false} />

      <Sidebar/>
      <div className="flex-1 min-h-screen">
        <Navbar />
        <PageTransition>
        <main className="p-6">{children}</main>
        </PageTransition>
      </div>
    </div>
  );
}

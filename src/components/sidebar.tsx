import React, { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  FiSettings,
  FiMenu,
} from "react-icons/fi"; 
import { TbUsersGroup } from "react-icons/tb";
import logo_company from "../images/logo_header.svg";
import logo_companywhite from "../images/logo_footer.svg";
import { useUser } from "../contexts/useUserHook";
import { LiaFileInvoiceDollarSolid } from "react-icons/lia";
import { VscGraph } from "react-icons/vsc";
import { useTheme } from "../contexts/useThemeHook";
import { MdOutlineAdminPanelSettings } from "react-icons/md";
import { HiOutlineDocumentText } from "react-icons/hi2";

type NavItem = {
  key: string;
  label: string;
  icon: React.ReactNode;
  to?: string;
  allow?: string[];
  hideIfNotAllowed?: boolean;
  active?: boolean;
};

type SidebarProps = {
  initialCollapsed?: boolean;
  fit?: "viewport" | "content";
  autoCollapseBelow?: number;
  className?: string;
};

export default function Sidebar({
  initialCollapsed = false,
  fit = "viewport",
  autoCollapseBelow = 1024,
  className = "",
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState<boolean>(initialCollapsed);
  const location = useLocation();
  const isViewport = fit === "viewport";
  const { user } = useUser();
  const lang = location.pathname.split("/")[1];
  const base = `/${lang}`;
  const { mode } = useTheme();

  const hasAnyRole = (...roles: string[]) => {
    if (!roles?.length) return true;
    const r = user?.role_name?.toLowerCase();
    return !!r && roles.some((x) => x.toLowerCase() === r);
  };

  useEffect(() => {
    const apply = () => {
      const shouldCollapse =
        typeof window !== "undefined" && window.innerWidth < autoCollapseBelow;
      setCollapsed(shouldCollapse || initialCollapsed);
    };
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, [autoCollapseBelow, initialCollapsed]);  


  const NAV_ITEMS: NavItem[] = [
    { key: "forecast", label: "forecast", icon: <VscGraph />, to: `${base}/forecast`, allow: ["SU", "ADMIN", "VENDER", "PLANNING", "PURCHASE"], hideIfNotAllowed: true },
    { key: "orders", label: "orders", icon: <HiOutlineDocumentText />, to: `${base}/orders`, allow: ["SU", "ADMIN", "VENDER", "PURCHASE"], hideIfNotAllowed: true },
    { key: "invoices", label: "invoices", icon: <LiaFileInvoiceDollarSolid />, to: `${base}/invoices`, allow: ["SU", "ADMIN", "VENDER", "PURCHASE"], hideIfNotAllowed: true },
    { key: "vendors", label: "vendors", icon: <TbUsersGroup />, to: `${base}/vendors`, allow: ["SU", "ADMIN"], hideIfNotAllowed: true },
    { key: "user", label: "user", icon: <MdOutlineAdminPanelSettings />, to: `${base}/user`, allow: ["SU"], hideIfNotAllowed: true },
    { key: "settings", label: "settings", icon: <FiSettings />, to: `${base}/settings`, allow: ["SU", "ADMIN", "VENDER", "PLANNING", "PURCHASE"], hideIfNotAllowed: true },
  ];

  const visibleNav = NAV_ITEMS.filter((it) => {
    if (!it.allow) return true;
    if (it.hideIfNotAllowed ?? true) return hasAnyRole(...it.allow);
    return true;
  });

  return (
    <aside
      className={[
        "relative flex flex-col",
        isViewport ? "sticky top-0 max-h-dvh h-dvh" : "h-auto self-stretch",
        "transition-all duration-300 ease-in-out",
        collapsed ? "w-20" : "w-64",
        className,
      ].join(" ")}
      style={{
        background: mode === "dark" 
          ? "linear-gradient(180deg, #0f1419 0%, #1a1f2e 100%)" 
          : "linear-gradient(180deg, #ffffff 0%, #fafbfc 100%)",
        borderRight: mode === "dark" ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.06)"
      }}
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between px-4 py-5 mb-2"
        style={{
          borderBottom: mode === "dark" ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.06)"
        }}
      >
        <div 
          className={`flex items-center transition-all duration-300 ${
            collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
          }`}
        >
          <a href={`${base}/forecast`} className="flex items-center">
            <img
              src={mode === "dark" ? logo_companywhite : logo_company}
              alt="PROSPIRA Logo"
              className="h-5 object-contain transition-opacity hover:opacity-80"
            />
          </a>
        </div>
        
        <button
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={() => setCollapsed((v) => !v)}
          className={[
            "p-2 rounded-lg transition-all duration-200",
            mode === "dark" 
              ? "text-gray-400 hover:text-white hover:bg-white/5" 
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          ].join(" ")}
          title={collapsed ? "Expand" : "Collapse"}
          type="button"
        >
          <FiMenu className="text-xl"/>
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-2 px-3">
        <ul className="flex flex-col gap-1">
          {visibleNav.map((item) => {
            const active = (() => {
              if (item.key === "orders") {
                return (
                  location.pathname.startsWith(`${base}/orders`) ||
                  location.pathname.startsWith(`${base}/order-form/`)
                );
              }

              if (item.key === "invoices") {
                return (
                  location.pathname.startsWith(`${base}/invoices`) ||
                  location.pathname.startsWith(`${base}/invoice-form/`)
                );
              }

              if (item.key === "vendors") {
                return (
                  location.pathname.startsWith(`${base}/vendors`) ||
                  location.pathname.startsWith(`${base}/vendor-detail`)
                );
              }

              return item.to ? location.pathname.startsWith(item.to) : false;
            })();

            const allowed = item.allow ? hasAnyRole(...item.allow) : true;
            const disabled = item.allow && !allowed && (item.hideIfNotAllowed === false);

            return (
              <li key={item.key} className="relative">
                {item.to ? (
                  <NavLink
                    to={disabled ? "#" : item.to}
                    onClick={(e) => {
                      if (disabled) e.preventDefault();
                    }}
                    className={({ isActive }) => {
                      const isDark = mode === "dark";
                      return [
                        "group relative flex items-center gap-3 w-full py-3 px-3.5 rounded-xl transition-all duration-200",
                        collapsed ? "justify-center" : "",
                        disabled
                          ? "opacity-40 pointer-events-none cursor-not-allowed"
                          : "",
                        active || isActive
                          ? (isDark 
                              ? "bg-linear-to-r from-cyan-500/10 to-emerald-500/10 shadow-lg shadow-cyan-500/5" 
                              : "bg-linear-to-r from-cyan-50 to-emerald-50 shadow-sm")
                          : (isDark 
                              ? "hover:bg-white/5" 
                              : "hover:bg-gray-50"),
                      ].join(" ");
                    }}
                    aria-disabled={disabled}
                    title={disabled ? "ไม่มีสิทธิ์เข้าถึงเมนูนี้" : undefined}
                  >
                    {/* Active indicator */}
                    <span
                      className={[
                        "absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-r-full transition-all duration-200",
                        "bg-linear-to-b from-cyan-400 to-emerald-400",
                        active ? "opacity-100 scale-100" : "opacity-0 scale-75",
                        disabled ? "hidden" : "",
                      ].join(" ")}
                    />

                    {/* Icon */}
                    <span
                      className={[
                        "text-xl shrink-0 transition-all duration-200",
                        active 
                          ? mode === "dark" ? "text-cyan-400" : "text-cyan-600"
                          : mode === "dark" ? "text-gray-400 group-hover:text-gray-300" : "text-gray-500 group-hover:text-gray-700",
                        disabled ? "text-gray-400" : "",
                      ].join(" ")}
                    >
                      {item.icon}
                    </span>

                    {/* Label */}
                    {!collapsed && (
                      <span 
                        className={[
                          "font-medium text-sm tracking-wide transition-all duration-200 capitalize",
                          active
                            ? mode === "dark" ? "text-white" : "text-gray-900"
                            : mode === "dark" ? "text-gray-400 group-hover:text-gray-300" : "text-gray-600 group-hover:text-gray-900",
                        ].join(" ")}
                      >
                        {item.label}
                      </span>
                    )}

                    {/* Hover glow effect */}
                    {!disabled && (
                      <span 
                        className={[
                          "absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none",
                          mode === "dark" 
                            ? "bg-linear-to-r from-cyan-500/5 to-emerald-500/5" 
                            : "bg-linear-to-r from-cyan-50/50 to-emerald-50/50"
                        ].join(" ")}
                      />
                    )}
                  </NavLink>
                ) : (
                  <div className="py-3 px-3.5 text-gray-500">{item.label}</div>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom gradient fade */}
      <div 
        className="pointer-events-none h-8"
        style={{
          background: mode === "dark"
            ? "linear-gradient(to bottom, transparent, rgba(15,20,25,0.3))"
            : "linear-gradient(to bottom, transparent, rgba(250,251,252,0.3))"
        }}
      />
    </aside>
  );
}
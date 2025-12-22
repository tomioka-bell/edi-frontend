import { useEffect } from "react";
import Cookies from "js-cookie";
import { Menu, Dropdown, Avatar, Spin, message, Tooltip } from "antd";
import {
  // UserOutlined,
  LogoutOutlined,

} from "@ant-design/icons";
import { useUser } from "../contexts/useUserHook";
import { buildImageURL } from "../utils/get-image";
import { RiShieldUserLine } from "react-icons/ri";
import { GoShareAndroid } from "react-icons/go";
import { FiSun, FiMoon } from "react-icons/fi";
import { useTheme } from "../contexts/useThemeHook";
import ModalNotification from "./modal-notification";

export default function Navbar() {
  const lang = location.pathname.split("/")[1];

  const { user, loading, error, logout, getInitials } = useUser();

  useEffect(() => {
    if (error) message.error(error);
  }, [error]);

  const handleLogout = () => {
    Cookies.remove("auth_token");
    message.success("Log out successfully");
    logout();
    window.location.replace(`${window.location.origin}/${lang}/login`);
  };

  const imageURL = buildImageURL(user?.profile ?? "");
  const { mode, toggleTheme } = useTheme();

  const menu = (
    <Menu
      className="min-w-50 bg-white rounded-xl shadow-2xl"
      items={[
        {
          key: "role",
          label: (
            <span className="flex items-center gap-3 py-2 px-3 text-root hover:text-[#08a4b8] transition-colors">
              <RiShieldUserLine className="text-lg" />
              <span className="font-medium">Role : {user?.role_name}</span>
            </span>
          ),
        },
        // {
        //   key: "profile",
        //   label: (
        //     <span className="flex items-center gap-3 py-2 px-3 text-gray-800 hover:text-[#08a4b8] transition-colors">
        //       <UserOutlined className="text-lg" />
        //       <span className="font-medium">โปรไฟล์</span>
        //     </span>
        //   ),
        //   onClick: () => navigate(`${lang}/admin/profile`),
        // },
        // {
        //   key: "settings",
        //   label: (
        //     <span className="flex items-center gap-3 py-2 px-3 text-gray-800 hover:text-[#08a4b8] transition-colors">
        //       <SettingOutlined className="text-lg" />
        //       <span className="font-medium">ตั้งค่า</span>
        //     </span>
        //   ),
        //   onClick: () => navigate(`${lang}/admin/settings`),
        // },
        { type: "divider", className: "!bg-gray-700/50 !my-2" },
        {
          key: "logout",
          label: (
            <span className="flex items-center gap-3 py-2 px-3 text-red-400 hover:text-red-300 transition-colors">
              <LogoutOutlined className="text-lg" />
              <span className="font-medium">Log out</span>
            </span>
          ),
          onClick: handleLogout,
        },
      ]}
    />
  );

  return (
    <div className="sticky top-0 z-50 bg-white/10 backdrop-blur-lg  px-6 py-0 h-20 shadow-md">
      <div className="max-w-480 mx-auto h-full flex items-center justify-between">

        {/* ฝั่งซ้าย: แสดง group */}
        <div className="flex items-center gap-6">
          <Tooltip title="Group">
            <div className="flex items-center gap-2 mr-4">
              <GoShareAndroid className="text-lg text-[#08a4b8]" />
              <p className="font-medium text-sm text-gray-500 pt-4">{user?.group ?? ""}</p>
            </div>
          </Tooltip>

        </div>

        {/* ฝั่งขวา: กระดิ่ง + โปรไฟล์ */}
        <div className="flex items-center gap-2">
          {loading ? (
            <div className="flex items-center gap-3 px-4 py-2 bg-white shadow-2xl rounded-full border border-gray-200/50">
              <Spin size="small" className="text-[#08a4b8]" />
              <span className="text-gray-400 text-sm font-medium">Loading...</span>
            </div>
          ) : (
            <>
              <Tooltip
                title={mode === "dark" ? "Light mode" : "Dark mode"}
                className="mr-2"
              >
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="relative flex items-center justify-center w-10 h-10 rounded-full card-root shadow-2xl border hover:border-[#08a4b8]/50 hover:bg-gray-100/60 transition-all duration-300 overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-linear-to-r from-yellow-400/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full blur-sm" />

                  <div className="relative">
                    <FiSun
                      className={`absolute inset-0 text-yellow-400 text-lg transition-all duration-500 ${mode === "dark"
                          ? "opacity-100 rotate-0 scale-100"
                          : "opacity-0 -rotate-180 scale-0"
                        }`}
                    />
                    <FiMoon
                      className={`text-violet-600 text-lg transition-all duration-500 ${mode === "dark"
                          ? "opacity-0 rotate-180 scale-0"
                          : "opacity-100 rotate-0 scale-100"
                        }`}
                    />
                  </div>
                </button>
              </Tooltip>

             <ModalNotification/>



              <Dropdown overlay={menu} trigger={["click"]} placement="bottomRight">
                <div className="flex items-center gap-3 px-4 py-2 rounded-full card-root shadow-2xl hover:bg-gray-100/50 border border-white/50 hover:border-[#08a4b8]/50 cursor-pointer transition-all duration-300 group">
                  <Avatar
                    className="shadow-lg shadow-[#08a4b8]/30 group-hover:shadow-[#08a4b8]/50 transition-all duration-300"
                    style={{
                      background: "linear-gradient(135deg, #08a4b8 0%, #06849a 100%)",
                      border: "2px solid rgba(8, 164, 184, 0.3)",
                    }}
                    size={42}
                  >
                    {imageURL ? (
                      <img
                        className="w-full h-full object-cover rounded-full"
                        src={imageURL}
                        alt={user?.display_name ?? ""}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = "none";
                          const span = document.createElement("span");
                          span.className = "font-semibold text-base text-white";
                          span.textContent = getInitials(user);
                          e.currentTarget.parentElement?.appendChild(span);
                        }}
                      />
                    ) : (
                      <span className="font-semibold text-base text-white">
                        {getInitials(user)}
                      </span>
                    )}
                  </Avatar>


                  <div className="hidden xl:flex flex-col">
                    <span className="text-root font-semibold text-sm leading-tight">
                      {user
                        ? `${(user.display_name ?? "").trim()}`.trim() ||
                        user.username
                        : "—"}
                    </span>
                    <span className="text-xs text-gray-500 font-medium">
                      {user?.username ?? "—"}
                    </span>
                  </div>
                  <div className="hidden xl:block ml-2 text-gray-500 group-hover:text-white transition-colors">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                      <path d="M6 8L2 4h8L6 8z" />
                    </svg>
                  </div>
                </div>
              </Dropdown>

            </>
          )}
        </div>
      </div>
    </div>

  );
}

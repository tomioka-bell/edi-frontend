import { useEffect, useRef, useState } from "react";
import axios from "axios";
import type { AxiosError } from "axios";
import Cookies from "js-cookie";
import logo_company from "../../images/logo_header.svg";
import toast, { Toaster } from "react-hot-toast";
import withLang from "../../utils/normalize-lang";
import { API_BASE } from "../../utils/api-base";
import bgVideo from "../../images/video/113385-697718118.mp4";
import { Radio } from "antd";
import edilogo from "../../images/edi-logo.png";
import { IoIosArrowBack } from "react-icons/io";

type Step = "credentials" | "otp";
type ErrorResponse = { error?: string; message?: string };
// type LoginType = "vendor" | "employee" | null;   

export default function LoginPage() {
    const [step, setStep] = useState<Step>("credentials");
    const [password, setPassword] = useState("");
    const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
    const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const lang = location.pathname.split("/")[1];
    const [identifier, setIdentifier] = useState("");

    const [loginType, setLoginType] = useState("vendor");
    const [resendTimer, setResendTimer] = useState(0);
    const timerRef = useRef<number | null>(null);

    useEffect(() => {
        if (step === "otp") {
            inputsRef.current[0]?.focus();
        }
    }, [step]);

    const handleStart = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            let url = "";
                let payload: Record<string, string> = {};

            if (loginType === "vendor") {
                url = `${API_BASE}/api/user/login/start`;
                payload = { email: identifier, password };
            } else if (loginType === "employee") {
                url = `${API_BASE}/api/employee/login/ldap`;
                payload = { username: identifier, password };
            } else {
                toast.error("Please select login type");
                return;
            }

            const res = await axios.post(url, payload);

            const token = res.data?.token;
            if (token) {
                Cookies.set("auth_token", token, {
                    expires: 1,
                    secure: true,
                    sameSite: "strict",
                });
                toast.success("Login successful");
                window.location.href = `/${lang}/forecast`;
                return;
            }

            toast.success(res.data?.message || "We sent you a 6-digit code.");
            setStep("otp");
            startResendCountdown(60);

        } catch (err) {
            const axiosError = err as AxiosError<ErrorResponse>;
            const msg =
                axiosError.response?.data?.error ||
                axiosError.response?.data?.message ||
                "Invalid login credentials";
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const verifyWithCode = async (code: string) => {
        if (loading) return;
        setLoading(true);
        setError(null);

        try {
            let url = "";
            let payload: Record<string, string> = {};

            if (loginType === "vendor") {
                url = `${API_BASE}/api/user/login/verify`;
                payload = { email: identifier, code };
            } else if (loginType === "employee") {
                url = `${API_BASE}/api/employee/login/verify-code`;
                payload = { email: identifier, code };
            } else {
                toast.error("Please select login type");
                return;
            }

            const res = await axios.post(url, payload);

            const token = res.data?.token;
            if (token) {
                Cookies.set("auth_token", token, {
                    expires: 1,
                    secure: true,
                    sameSite: "strict"
                });

                toast.success("Login successful");
                window.location.href = `/${lang}/forecast`;
            } else {
                throw new Error("Missing token");
            }
        } catch (err) {
            const axiosError = err as AxiosError<ErrorResponse>;
            const msg =
                axiosError.response?.data?.error ||
                axiosError.response?.data?.message ||
                "Invalid or expired code";
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = (e: React.FormEvent) => {
        e.preventDefault();
        verifyWithCode(otp.join(""));
    };

    const fillOtpFrom = (startIdx: number, digits: string) => {
        const chars = digits.replace(/\D/g, "").slice(0, 6);
        if (!chars) return;

        const next = [...otp];
        let i = startIdx;
        for (const ch of chars) {
            next[i] = ch;
            if (i === 5) break;
            i++;
        }
        setOtp(next);

        const nextFocus = Math.min(i + 1, 5);
        inputsRef.current[nextFocus]?.focus();

        if (next.every((d) => d && d.length === 1)) {
            verifyWithCode(next.join(""));
        }
    };

    const onChangeOtp = (idx: number, val: string) => {
        const digits = val.replace(/\D/g, "");
        if (digits.length <= 1) {
            const next = [...otp];
            next[idx] = digits;
            setOtp(next);
            if (digits && idx < 5) inputsRef.current[idx + 1]?.focus();
            if (next.every((d) => d)) verifyWithCode(next.join(""));
        } else {
            fillOtpFrom(idx, digits);
        }
    };

    const onKeyDownOtp = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !otp[idx] && idx > 0) {
            inputsRef.current[idx - 1]?.focus();
        }
        if ((e.key === "ArrowLeft" || e.key === "Left") && idx > 0) {
            inputsRef.current[idx - 1]?.focus();
        }
        if ((e.key === "ArrowRight" || e.key === "Right") && idx < 5) {
            inputsRef.current[idx + 1]?.focus();
        }
    };

    const handleResend = async () => {
        if (resendTimer > 0) {
            toast.error(`Please wait ${resendTimer}s`);
            return;
        }

        setLoading(true);

        try {
            let url = "";
            let payload: Record<string, string> = {};

            if (loginType === "vendor") {
                url = `${API_BASE}/api/user/login/start`;
                payload = { email: identifier, password };
            } else if (loginType === "employee") {
                url = `${API_BASE}/api/employee/login/ldap`;
                payload = { username: identifier, password };
            }

            const res = await axios.post(url, payload);
            toast.success(res.data?.message || "A new code was sent to your email");

            setOtp(["", "", "", "", "", ""]);
            inputsRef.current[0]?.focus();
            startResendCountdown(60);

        } catch (err) {
            const axiosError = err as AxiosError<ErrorResponse>;
            const msg =
                axiosError.response?.data?.error ||
                axiosError.response?.data?.message ||
                "Failed to resend code";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };



    const startResendCountdown = (seconds = 60) => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        setResendTimer(seconds);
    };

    useEffect(() => {
        if (resendTimer <= 0) return;

        timerRef.current = window.setInterval(() => {
            setResendTimer((t) => {
                if (t <= 1) {
                    if (timerRef.current) {
                        clearInterval(timerRef.current);
                        timerRef.current = null;
                    }
                    return 0;
                }
                return t - 1;
            });
        }, 1000);

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [resendTimer]);

    return (
        <div
            className="min-h-screen bg-neutral-50 flex relative items-center justify-center px-4"

        >
            <video
                autoPlay
                muted
                loop
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
            >
                <source src={bgVideo} type="video/mp4" />
            </video>
            <Toaster position="top-right" />

            <div className="relative w-full max-w-[800px] min-h-[600px] grid grid-cols-1 md:grid-cols-2 rounded-2xl border border-neutral-200 shadow-2xl overflow-hidden bg-white/85">
                <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[1.4px] h-[80%] bg-[#08a4b8]" />

                {/* ซ้าย: โลโก้ */}
                <div className="relative flex items-center justify-center bg-white px-8 py-16">
                    {/* background soft pattern */}
                    <div
                        className="absolute inset-0 pointer-events-none opacity-10"
                        style={{
                            backgroundImage:
                                "radial-gradient(40% 40% at 20% 20%, rgba(0,0,0,0.15) 0%, transparent 60%)",
                        }}
                    />

                    <div className="relative z-10 flex flex-col items-center text-center space-y-8 max-w-sm">
                        {/* Company Logo */}
                        <img
                            src={logo_company}
                            alt="PROSPIRA Logo"
                            className="w-56 h-auto object-contain drop-shadow-sm"
                        />

                        {/* Divider (optional แต่ช่วยให้ดูพรีเมียม) */}
                        <div className="h-px w-24 bg-gray-300" />

                        {/* EDI Logo */}
                        <img
                            src={edilogo}
                            alt="EDI Logo"
                            className="h-20 w-20 object-contain opacity-90"
                        />

                        <div className="space-y-1 animate-fade-in-delayed-more">
                            <p className="
                                text-[14px] font-semibold  
                                bg-linear-to-r from-gray-800 to-cyan-500
                                bg-clip-text text-transparent
                            ">
                                Electronic Data Integration (EDI)
                            </p>
                            <p className="text-xs text-gray-400 tracking-wide">
                                Platform
                            </p>
                        </div>

                    </div>
                </div>


                {/* ขวา: ฟอร์ม */}
                <div className="relative p-8 md:p-10">
                    <div className="mb-6 text-center pt-[68px]">
                        {step === "otp" && (
                            <div className="flex justify-start">
                                <button
                                style={{color: "black"}}
                                    type="button"
                                    onClick={() => setStep("credentials")}
                                    className="
                                    group inline-flex items-center gap-2
                                    px-4 py-2
                                    text-sm font-medium
                                    rounded-xl
                                    border border-gray-200
                                    bg-white
                                    text-gray-600
                                    shadow-sm
                                    transition-all duration-200
                                    hover:border-gray-300
                                    hover:bg-gray-50
                                    hover:text-gray-800
                                    hover:shadow
                                    focus:outline-none
                                    focus:ring-2 focus:ring-[#08a4b8]/30
                                    active:scale-[0.97]
                                "
                                >
                                    <IoIosArrowBack
                                        className="
                                    text-sm
                                    transition-transform duration-200
                                    group-hover:-translate-x-1
                                    "
                                    />
                                    Back
                                </button>
                            </div>
                        )}

                        {step === "otp" && (
                            <hr className="mt-2 mb-8 border-neutral-200 w-[300px] mx-auto" />
                        )}

                        <h2 className="text-2xl font-bold text-[#08a4b8]">
                            {step === "credentials" ? "Log In" : "Enter 6-digit code"}
                        </h2>
                        {step === "otp" && (
                            <p className="text-neutral-500 text-sm mt-2">
                                We sent a code to <span className="font-medium text-[#08a4b8]">{identifier}</span>
                            </p>
                        )}
                    </div>

                    {step === "credentials" ? (
                        <form onSubmit={handleStart} className="space-y-4">
                            <div>
                                <input
                                    type="text"
                                    value={identifier}
                                     style={{color: "black"}}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-white border border-neutral-300 rounded-lg text-root placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/60 focus:border-cyan-500/60"
                                    placeholder="Email or Username"
                                    required
                                />
                            </div>

                            <div>
                                <input
                                    type="password"
                                    value={password}
                                    style={{color: "black"}}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-white border border-neutral-300 rounded-lg text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/60 focus:border-cyan-500/60"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>


                            <div className="flex justify-end pr-1">
                                <a
                                    href={loginType === "employee" ? undefined : withLang(lang, "/forgot-password")}
                                    className={`text-[13px] font-medium ${loginType === "employee"
                                        ? "text-gray-400 pointer-events-none cursor-not-allowed"
                                        : "text-blue-400 hover:underline"
                                        }`}
                                >
                                    Forgot password?
                                </a>
                            </div>


                            {error && (
                                <div className="mt-3 rounded-lg border border-red-300 bg-red-50 text-red-700 px-4 py-2 text-sm text-center shadow-sm">
                                    {error}
                                </div>
                            )}

                            <div className="flex items-center justify-center pt-2">
                                <button
                                    style={{ color: "white" }}
                                    type="submit"
                                    disabled={loading}
                                    className="
                                    px-34 py-2.5
                                    bg-linear-to-r from-[#08a4b8] to-cyan-500
                                    text-white font-semibold
                                    rounded-lg shadow
                                    transition-transform duration-200 ease-out
                                    transform
                                    hover:scale-[1.02]
                                    hover:opacity-95
                                    disabled:opacity-70
                                "
                                >
                                    {loading ? "Loading..." : "Login"}
                                </button>


                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handleVerify} className="space-y-6">
                            <div className="flex justify-center gap-2">
                                {otp.map((v, i) => (
                                    <input
                                        key={i}
                                        ref={(el) => { inputsRef.current[i] = el; }}
                                        type="text"
                                         style={{color: "black"}}
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        maxLength={6}
                                        value={v}
                                        onChange={(e) => onChangeOtp(i, e.target.value)}
                                        onKeyDown={(e) => onKeyDownOtp(i, e)}
                                        className="w-12 h-12 text-center text-xl font-semibold bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/60 focus:border-cyan-500/60"
                                    />
                                ))}
                            </div>

                            {error && (
                                <div className="mt-3 rounded-lg border border-red-300 bg-red-50 text-red-700 px-4 py-2 text-sm text-center shadow-sm">
                                    {error}
                                </div>
                            )}

                            <div className="flex items-center justify-center">
                                <button
                                    type="button"
                                    onClick={handleResend}
                                    disabled={loading || resendTimer > 0}
                                    style={{ color: "black", fontSize: 12 }}
                                    className="text-blue-500 hover:underline disabled:opacity-50 disabled:no-underline"
                                    aria-disabled={loading || resendTimer > 0}
                                    title={resendTimer > 0 ? `Please wait ${resendTimer}s` : "Resend code"}
                                >
                                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend code"}
                                </button>
                            </div>
                        </form>
                    )}

                    {step === "credentials" ? (
                        <div className="flex justify-end gap-6 pt-5 ml-2">
                            <Radio.Group
                                onChange={(e) => setLoginType(e.target.value)}
                                value={loginType}
                                className="flex gap-8 text-base"
                            >
                                <Radio value="vendor" style={{ color: "#708090" }} className="font-medium">
                                    Vendor
                                </Radio>
                                <Radio value="employee" style={{ color: "#708090" }} className="font-medium">
                                    Prospira
                                </Radio>
                            </Radio.Group>
                        </div>
                    ) : null}


                    <hr className="my-6 border-[#08a4b8]/50 w-[300px] mx-auto" />

                    <p className="text-center text-[#08a4b8] text-xs mt-8">
                        © {new Date().getFullYear()} Prospira (Thailand) Co., Ltd.
                    </p>

                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-[#08a4b8]/40 to-transparent opacity-60" />
                </div>
            </div>
        </div>
    );
}

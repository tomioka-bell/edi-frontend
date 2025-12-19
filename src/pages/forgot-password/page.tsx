import { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import bgVideo from "../../images/video/136959-765457947.mp4";
import wrongPasswordImg from "../../images/icon/mobile-password-forgot.png";

export default function ForgotPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get("token") ?? "", [searchParams]);

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setEmail("");
    setPassword("");
    setConfirm("");
  }, [token]);

  const API = import.meta.env.VITE_API_BASE_URL

  const handleRequestLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return toast.error("Please enter your email");
    setLoading(true);
    try {
      await axios.post(`${API}/api/user/request-password-reset`, { email });
      toast.success("If this email exists, the system will automatically send a reset link.");
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Unable to send request";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResetByToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return toast.error("Invalid token");
    if (password.length < 8) return toast.error("Password must be at least 8 characters");
    if (password !== confirm) return toast.error("Passwords do not match");
    setLoading(true);
    try {
      await axios.post(`${API}/api/user/reset-password`, {
        token,
        new_password: password,
      });
      toast.success("Password reset successfully");
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Unable to set a new password";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const RequestForm = (
    <form onSubmit={handleRequestLink} className="space-y-4">
      <div>
        <label className="block text-neutral-700 text-sm mb-1">Email</label>
        <input
          type="email"
          style={{ color: "black" }}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2.5 bg-white border border-neutral-300 rounded-lg text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/60 focus:border-cyan-500/60"
          placeholder="prospira@gmail.com"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        style={{ color: "white" }}
        className="w-full py-2.5 bg-linear-to-r from-[#08a4b8] to-cyan-500 text-white font-semibold rounded-lg shadow-lg hover:opacity-95 transition disabled:opacity-70"
      >
        {loading ? "Sending..." : "Send reset link"}
      </button>

  
    </form>
  );

  const ResetForm = (
    <form onSubmit={handleResetByToken} className="space-y-4">
      <div className="rounded-lg border border-amber-200 bg-amber-50 text-amber-800 px-4 py-2 text-sm">
        Set a new password for your account.
      </div>

      <div>
        <label className="block text-neutral-700 text-sm mb-1">New Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2.5 bg-white border border-neutral-300 rounded-lg text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/60 focus:border-cyan-500/60"
          placeholder="At least 8 characters"
          required
        />
      </div>

      <div>
        <label className="block text-neutral-700 text-sm mb-1">Confirm Password</label>
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full px-4 py-2.5 bg-white border border-neutral-300 rounded-lg text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/60 focus:border-cyan-500/60"
          placeholder="Confirm Password"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        style={{ color: "white" }}
        className="w-full py-2.5 bg-linear-to-r from-[#08a4b8] to-cyan-500 text-white font-semibold rounded-lg shadow-lg hover:opacity-95 transition disabled:opacity-70"
      >
        {loading ? "Updating..." : "Update Password"}
      </button>
    </form>
  );

  return (
   <div className="min-h-screen relative flex items-center justify-center px-4 overflow-hidden">
  {/* วิดีโอพื้นหลัง */}
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
     <div className="relative w-full max-w-md bg-white/75 backdrop-blur-sm border border-neutral-200 rounded-2xl shadow-2xl p-8 z-10">
        <h1 className="text-2xl font-bold text-neutral-900 text-center">
          {token ? "Reset Password" : "Forgot Password"}
        </h1>
        <p className="text-neutral-500 text-sm text-center mt-1">
          {token ? "Set a new password for your account." : "Enter your email to receive a password change link."}
        </p>

        <hr className="my-6 border-neutral-200" />

        {token ? ResetForm : RequestForm}

        <div className="text-center mt-6">
          <Link to="/en/login" className="text-cyan-600 hover:underline text-sm">
            Back to login
          </Link>
        </div>

           <img 
            src={wrongPasswordImg} 
            alt="Wrong Password" 
            className="absolute -top-8 left-0 w-[74px] h-[74px]" 
          />
      </div>
    </div>
  );
}

import React, { useMemo, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import bgVideo from "../../images/video/136959-765457947.mp4";
import Rocket from "../../images/icon/rocket.png"
import Flying from "../../images/icon/flying.png"

export default function ResetPasswordPage() {
  const [sp] = useSearchParams();
  const token = sp.get("token") || "";

  const nav = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const rules = useMemo(() => {
    const length = password.length >= 8;
    const upper = /[A-Z]/.test(password);
    const lower = /[a-z]/.test(password);
    const digit = /\d/.test(password);
    const symbol = /[^A-Za-z0-9]/.test(password);
    return { length, upper, lower, digit, symbol };
  }, [password]);

  const strength = useMemo(() => {
    const score = Object.values(rules).filter(Boolean).length;
    return score; 
  }, [rules]);

  const canSubmit =
    !loading &&
    !!token &&
    password.length >= 8 &&
    password === confirm &&
    strength >= 3;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!token) {
      setError("Missing or invalid reset token.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/user/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password: password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.message || "Unable to reset password.");
      }

      setMessage("Password updated successfully. You can now sign in.");
      setTimeout(() => nav("/login"), 1500);
    } catch (err: any) {
      setError(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const barSegments = new Array(5).fill(0).map((_, i) => i < strength);

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

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/80 backdrop-blur-sm border border-neutral-200 shadow-xl rounded-2xl p-6 md:p-8">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-neutral-900">Set a New Password</h1>
            <p className="text-gray-500 mt-1">
              Please create a strong password to secure your account.
            </p>
          </div>

          {!token && (
            <div className="mb-4 p-3 rounded-lg bg-amber-50 text-amber-800 border border-amber-200">
              This page was opened without a reset token. Please use the link from your email.
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 border border-red-200">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
              {message}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700">New password</label>
              <div className="relative mt-1">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  style={{ color: "black" }}
                  className="w-full rounded-xl border border-gray-400 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  autoComplete="new-password"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                   style={{ color: "black" }}
                  onClick={() => setShowPw((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 text-sm"
                >
                  {showPw ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Confirm password</label>
              <input
                type={showPw ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                 style={{ color: "black" }}
                className="mt-1 w-full rounded-xl border border-gray-400 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                autoComplete="new-password"
                required
                minLength={8}
              />
              {confirm && confirm !== password && (
                <p className="mt-2 text-sm text-red-600">Passwords do not match.</p>
              )}
            </div>

            {/* Strength meter */}
            <div>
              <div className="flex gap-1" aria-hidden>
                {barSegments.map((filled, i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full ${
                      filled ? "bg-indigo-600" : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>
              <ul className="pt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-gray-600">
                <Rule ok={rules.length}>At least 8 characters</Rule>
                <Rule ok={rules.digit}>Contains a number</Rule>
                <Rule ok={rules.upper}>Uppercase letter</Rule>
                <Rule ok={rules.lower}>Lowercase letter</Rule>
                <Rule ok={rules.symbol}>Symbol (e.g. !@#$)</Rule>
              </ul>
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              style={{ color: "white" }}
              className={`w-full rounded-xl px-4 py-2.5 font-medium transition ${
                canSubmit && !loading
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                  : "bg-gray-300 cursor-not-allowed text-gray-500"
              }`}
            >
              {loading ? "Updating..." : "Update password"}
            </button>

            <div className="text-center text-sm text-blue-400 mt-4">
              <Link to="/login" className="hover:underline">Back to sign in</Link>
            </div>
          </form>
        </div>
      <img 
            src={Rocket} 
            alt="Rocket" 
            className="absolute -bottom-4 -right-4 w-12 h-12" 
          />
      <img 
            src={Flying} 
            alt="Rocket" 
            className="absolute -top-4 -left-4 w-12 h-12" 
          />
      </div>
    </div>
  );
}

function Rule({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <li className={`flex items-center gap-2 ${ok ? "text-emerald-700" : "text-gray-600"}`}>
      <span
        className={`inline-block h-2 w-2 rounded-full ${ok ? "bg-emerald-500" : "bg-gray-300"}`}
        aria-hidden
      />
      <span>{children}</span>
    </li>
  );
}

 
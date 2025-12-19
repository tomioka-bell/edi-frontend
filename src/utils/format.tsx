// Utility สำหรับฟอร์แมตวันที่ให้เป็นเวลาไทย
export const fmtDate = (s?: string | null): string =>
  !s
    ? "-"
    : new Date(s).toLocaleString("th-TH", {
      timeZone: "Asia/Bangkok",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });


export const statusColor = (v?: string): string => {
  const raw = (v ?? "").trim();
  const s = raw.toUpperCase();

  if (s === "PENDING") {
    return "bg-yellow-100 text-yellow-700 ring-yellow-200";
  }

  if (s === "CONT, PENDING APPROVED") {
    return "bg-yellow-100 text-yellow-700 ring-yellow-200";
  }

  if (s === "FULLY CONFIRM") {
    return "bg-green-100 text-green-700 ring-green-200";
  }


  if (s === "CONFIRM") {
    return "bg-blue-100 text-blue-700 ring-blue-200";
  }

  if (s === "APPROVED") {
    return "bg-emerald-100 text-emerald-700 ring-emerald-200";
  }

  if (s === "Confirmed") {
    return "bg-green-100 text-green-700 ring-green-200";
  }

  if (s === "PARTIALLY_CONFIRMED") {
    return "bg-orange-100 text-orange-700 ring-orange-200";
  }

  if (s === "REJECT") {
    return "bg-rose-100 text-rose-700 ring-rose-200";
  }

  if (s === "DRAFT") {
    return "bg-slate-100 text-slate-700 ring-slate-200";
  }

  if (s === "FULLY_CONFIRMED") {
    return "bg-green-100 text-green-700 ring-green-200";
  }

  if (s == "CHANGE") {
    return "bg-amber-100 text-amber-700 ring-amber-200";
  }

  return "bg-cyan-100 text-cyan-700 ring-cyan-200";
};

// Utility สำหรับสร้างอักษรย่อจากชื่อ-นามสกุล
export const getInitialsFromName = (
  first?: string | null,
  last?: string | null
): string => {
  const a = (first ?? "").trim();
  const b = (last ?? "").trim();
  if (a && b) return (a[0] + b[0]).toUpperCase();
  if (a) return a.slice(0, 2).toUpperCase();
  if (b) return b.slice(0, 2).toUpperCase();
  return "?";
};

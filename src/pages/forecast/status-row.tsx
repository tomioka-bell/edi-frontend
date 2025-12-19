interface StatusRowProps {
  label: string;
  value: number;
  colorClass: string;
}

export default function StatusRow({ label, value, colorClass }: StatusRowProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span
          className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold ${colorClass}`}
        >
          {label.charAt(0)}
        </span>
        <span className="text-sm text-slate-700">{label}</span>
      </div>
      <span className="text-sm font-semibold text-slate-900">
        {value.toLocaleString()}
      </span>
    </div>
  );
}

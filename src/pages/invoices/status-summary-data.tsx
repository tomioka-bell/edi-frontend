import { useEffect, useState } from "react";
import apiBaseClient from "../../utils/api-base-client";
import iconConfirm from "../../images/icon/confirm.png";
import iconReject from "../../images/icon/rejected.png";
import iconApproved from "../../images/icon/approved.png";
import iconTotal from "../../images/icon/pie-chart.png";
import iconMessage from "../../images/icon/email-false.png";

type StatusSummary = {
    vendor_code: string;
    new_count: number;
    confirm_count: number;
    reject_count: number;
    approved_count: number;
    total_count: number;
};

type StatusSummaryDataProps = {
    vendorCode: string;
};

export default function StatusSummaryData({ vendorCode }: StatusSummaryDataProps) {
    const [data, setData] = useState<StatusSummary | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!vendorCode) {
            setData(null);
            return;
        }

        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                const resp = await apiBaseClient.get(
                    `/api/invoice/get-status-invoice-summary-by-vendor-code?vendor_code=${encodeURIComponent(
                        vendorCode,
                    )}`,
                );

                const json = resp.data as StatusSummary;
                setData(json);
            } catch (err: unknown) {
                setError((err as Error).message || "เกิดข้อผิดพลาด");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [vendorCode]);

    if (loading) {
        return (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <div
                        key={i}
                        className="h-28 animate-pulse rounded-3xl bg-gray-100"
                    />
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="mt-8 text-center">
                <div className="inline-flex items-center gap-2 rounded-full bg-red-50 px-5 py-2.5 text-sm text-red-600 dark:bg-red-900/30">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {error}
                </div>
            </div>
        );
    }

    if (!data) {
        return null;
    }

    const cards = [
            {
                key: "new",
                label: "New",
                value: data.new_count,
                icon: iconMessage,
                borderClass: "border-gray-500",
                mainColor: "#9ca3af",      
                secondaryColor: "#d1d5db", 
            },
        {
            key: "confirm",
            label: "Confirm",
            value: data.confirm_count,
            icon: iconConfirm,
            borderClass: "border-blue-500",
            mainColor: "#3b82f6",
            secondaryColor: "#60a5fa"
        },
        {
            key: "reject",
            label: "Reject",
            value: data.reject_count,
            icon: iconReject,
            borderClass: "border-red-500",
            mainColor: "#ef4444",
            secondaryColor: "#f97373"
        },
        {
            key: "approved",
            label: "Approved",
            value: data.approved_count,
            icon: iconApproved,
            borderClass: "border-emerald-500",
            mainColor: "#10b981",
            secondaryColor: "#34d399"
        },
        {
            key: "total",
            label: "Total",
            value: data.total_count,
            icon: iconTotal,
            borderClass: "border-yellow-500",
            mainColor: "#eab308",
            secondaryColor: "#fbbf24"
        },
    ];


    return (
        <div className="mt-4 space-y-6">
            <div className="text-sm text-gray-600 ">
               Invoice Status Summary : {" "}
                <span className="font-bold text-root ">
                    {data.vendor_code}
                </span>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5 pt-6">
                {cards.map((card) => (
                    <WaveStatCard
                        key={card.key}
                        label={card.label}
                        value={card.value}
                        borderClass={card.borderClass}
                        mainColor={card.mainColor}
                        secondaryColor={card.secondaryColor}
                        icon={card.icon}
                    />
                ))}
            </div>
        </div>
    );
}

type WaveStatCardProps = {
    label: string;
    value: number;
    borderClass: string;
    mainColor: string;
    secondaryColor: string;
    icon: string;
};

function WaveStatCard({
    label,
    value,
    borderClass,
    mainColor,
    secondaryColor,
    icon
}: WaveStatCardProps) {
    return (
        <div className={`relative overflow-visible rounded-lg border-l-4 bg-white shadow-sm transition-all hover:shadow-md ${borderClass}`}>
            {/* Animated Wave Background */}
            <div className="absolute inset-0 opacity-10 top-2">
                <svg
                    className="absolute h-full w-full"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 1440 320"
                    preserveAspectRatio="none"
                >
                    <path
                        fill={mainColor}
                        fillOpacity="1"
                        d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                    >
                        <animate
                            attributeName="d"
                            dur="6s"
                            repeatCount="indefinite"
                            values="
                                M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z;
                                M0,160L48,144C96,128,192,96,288,90.7C384,85,480,107,576,128C672,149,768,171,864,165.3C960,160,1056,128,1152,122.7C1248,117,1344,139,1392,149.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z;
                                M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z
                            "
                        />
                    </path>
                </svg>

                <svg
                    className="absolute h-full w-full"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 1440 320"
                    preserveAspectRatio="none"
                >
                    <path
                        fill={secondaryColor}
                        fillOpacity="0.5"
                        d="M0,192L48,197.3C96,203,192,213,288,192C384,171,480,117,576,101.3C672,85,768,107,864,122.7C960,139,1056,149,1152,138.7C1248,128,1344,96,1392,80L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                    >
                        <animate
                            attributeName="d"
                            dur="8s"
                            repeatCount="indefinite"
                            values="
                                M0,192L48,197.3C96,203,192,213,288,192C384,171,480,117,576,101.3C672,85,768,107,864,122.7C960,139,1056,149,1152,138.7C1248,128,1344,96,1392,80L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z;
                                M0,128L48,138.7C96,149,192,171,288,181.3C384,192,480,192,576,176C672,160,768,128,864,117.3C960,107,1056,117,1152,133.3C1248,149,1344,171,1392,181.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z;
                                M0,192L48,197.3C96,203,192,213,288,192C384,171,480,117,576,101.3C672,85,768,107,864,122.7C960,139,1056,149,1152,138.7C1248,128,1344,96,1392,80L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z
                            "
                        />
                    </path>
                </svg>
            </div>

            <div className="absolute -top-3 -right-2 z-20 flex size-12 items-center justify-center rounded-full bg-white/45 shadow-md">
                <img
                    src={icon}
                    alt="icon"
                    className="size-7 object-contain"
                />
            </div>

            {/* Content */}
            <div className="relative z-10 p-6">
                <div className="flex justify-between">
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-500">{label}</p>
                </div>
                <div className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
                    {value.toLocaleString()}
                </div>


            </div>

        </div>
    );
}

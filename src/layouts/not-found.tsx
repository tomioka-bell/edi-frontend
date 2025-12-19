export default function NotFound() {
    return (
        <div className="relative min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-cyan-50 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
            </div>

            <div className="relative flex flex-col items-center justify-center min-h-screen text-center px-6">
                <div className="mb-8 relative">
                    <h1 className="text-[140px] md:text-[180px] font-black text-transparent bg-clip-text bg-linear-to-r from-cyan-500 via-blue-500 to-indigo-500 leading-none mb-0">
                        404
                    </h1>
                </div>

                <div className="max-w-md space-y-4 mb-10">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-800 tracking-tight">
                        Page Not Found
                    </h2>
                    <p className="text-lg text-gray-600 leading-relaxed">
                        The page you're looking for doesn't exist or has been moved to a new location.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <a
                        href="/"
                        className="group relative px-8 py-4 bg-linear-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40 transition-all duration-300 hover:scale-105"
                    >
                        <span className="relative z-10">Back to Home</span>
                        <div className="absolute inset-0 bg-linear-to-r from-cyan-600 to-blue-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </a>

                    <button
                        onClick={() => window.history.back()}
                        className="px-8 py-4 bg-white text-gray-700 font-semibold rounded-xl shadow-md hover:shadow-lg border-2 border-gray-200 hover:border-cyan-300 transition-all duration-300 hover:scale-105"
                    >
                        Go Back
                    </button>
                </div>

                <p className="pt-6 text-sm text-gray-500">
                    Error Code: 404 • Page Not Found
                </p>
            </div>

            <style>{`
                @keyframes blob {
                    0%, 100% {
                        transform: translate(0, 0) scale(1);
                    }
                    33% {
                        transform: translate(30px, -50px) scale(1.1);
                    }
                    66% {
                        transform: translate(-20px, 20px) scale(0.9);
                    }
                }
            `}</style>
        </div>
    );
}
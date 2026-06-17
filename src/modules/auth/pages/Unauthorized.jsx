// src/modules/auth/pages/Unauthorized.jsx
export default function Unauthorized() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="text-center">
                <h1 className="text-6xl font-bold text-[#1565C0]">403</h1>
                <p className="text-[#546E7A] mt-2">Accès refusé — permissions insuffisantes</p>
            </div>
        </div>
    )
}
// src/modules/notifications/components/NotifBadge.jsx
import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { getNonLuesCount } from '../api/notifications.api';

export default function NotifBadge() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!user) return;
        const fetchCount = () =>
            getNonLuesCount()
                .then(data => setCount(data.count ?? 0))
                .catch(() => {});

        fetchCount();
        const interval = setInterval(fetchCount, 30000);
        return () => clearInterval(interval);
    }, [user]);

    const roleBase = user?.role?.toLowerCase();
    const path = `/${roleBase}/notifications`;

    return (
        <button
            onClick={() => navigate(path)}
            className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Notifications"
        >
            {/* ✅ Cloche verte sur fond blanc */}
            <Bell size={22} className="text-[#1B7A5A]" />
            {count > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold
                         rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
          {count > 99 ? '99+' : count}
        </span>
            )}
        </button>
    );
}
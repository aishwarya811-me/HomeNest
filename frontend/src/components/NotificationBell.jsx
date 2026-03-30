import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { Bell } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

// Panel loaded only when bell is first clicked
const NotificationPanel = lazy(() => import('./NotificationPanel'));

export default function NotificationBell() {
    const { user } = useAuth();
    const [open, setOpen] = useState(false);
    const [unread, setUnread] = useState(0);
    const [data, setData] = useState({ notifications: [], unread_count: 0 });
    const [panelEverOpened, setPanelEverOpened] = useState(false);
    const ref = useRef();

    const fetchNotifications = async () => {
        try {
            const { data: d } = await api.get('/notifications');
            setData(d);
            setUnread(d.unread_count);
        } catch { }
    };

    useEffect(() => {
        if (!user) return;
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [user]);

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleOpen = () => {
        setOpen(o => !o);
        setPanelEverOpened(true);   // triggers lazy load of panel
        if (!open) fetchNotifications();
    };

    if (!user) return null;

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={handleOpen}
                className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors">
                <Bell size={20} />
                {unread > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                        {unread > 9 ? '9+' : unread}
                    </span>
                )}
            </button>

            {/* Panel only mounts after first click */}
            {panelEverOpened && (
                <Suspense fallback={
                    <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl border border-gray-200 shadow-xl z-50 flex items-center justify-center h-32">
                        <div className="w-6 h-6 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                    </div>
                }>
                    {open && (
                        <NotificationPanel
                            data={data}
                            setData={setData}
                            setUnread={setUnread}
                            onClose={() => setOpen(false)}
                        />
                    )}
                </Suspense>
            )}
        </div>
    );
}
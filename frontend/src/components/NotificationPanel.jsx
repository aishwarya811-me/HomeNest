import { Bell, X, CheckCheck, Trash2 } from 'lucide-react';
import api from '../utils/api';

const TYPE_COLORS = {
    review: 'bg-yellow-100 text-yellow-700',
    contact: 'bg-blue-100 text-blue-700',
    info: 'bg-gray-100 text-gray-700'
};

export default function NotificationPanel({ data, setData, setUnread, onClose }) {
    const markAllRead = async () => {
        await api.put('/notifications/read-all');
        setUnread(0);
        setData(prev => ({
            ...prev,
            unread_count: 0,
            notifications: prev.notifications.map(n => ({ ...n, is_read: 1 }))
        }));
    };

    const deleteOne = async (id) => {
        await api.delete(`/notifications/${id}`);
        setData(prev => ({
            ...prev,
            notifications: prev.notifications.filter(n => n.id !== id)
        }));
    };

    return (
        <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl border border-gray-200 shadow-xl z-50 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <h3 className="font-semibold text-sm">Notifications</h3>
                <div className="flex gap-2">
                    {data.unread_count > 0 && (
                        <button
                            onClick={markAllRead}
                            className="text-xs text-primary-600 hover:underline flex items-center gap-1">
                            <CheckCheck size={13} /> Mark all read
                        </button>
                    )}
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={15} />
                    </button>
                </div>
            </div>

            <div className="max-h-80 overflow-y-auto">
                {data.notifications.length === 0 ? (
                    <div className="text-center py-10 text-gray-400">
                        <Bell size={28} className="mx-auto mb-2 opacity-40" />
                        <p className="text-sm">No notifications yet</p>
                    </div>
                ) : (
                    data.notifications.map(n => (
                        <div key={n.id}
                            className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${!n.is_read ? 'bg-blue-50/40' : ''}`}>
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className={`badge text-xs px-2 py-0.5 ${TYPE_COLORS[n.type] || TYPE_COLORS.info}`}>
                                            {n.type}
                                        </span>
                                        {!n.is_read && <span className="w-2 h-2 bg-blue-500 rounded-full" />}
                                    </div>
                                    <p className="text-sm font-medium text-gray-900">{n.title}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {new Date(n.created_at).toLocaleString('en-IN')}
                                    </p>
                                </div>
                                <button
                                    onClick={() => deleteOne(n.id)}
                                    className="text-gray-300 hover:text-red-500 transition-colors mt-1">
                                    <Trash2 size={13} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
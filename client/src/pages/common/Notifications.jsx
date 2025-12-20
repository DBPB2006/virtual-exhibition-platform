import React, { useState, useEffect } from 'react';
import api from '@/api/axios';
import { Navbar } from '@/components/common/Navbar';
import { Spinner } from '@/components/ui/spinner';
import { Bell, Check, ExternalLink, Info, CreditCard, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Renders the user notifications page, displaying a list of alerts and updates with read/unread status management
const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await api.get('/api/notifications');
            setNotifications(response.data);
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleNotificationClick = async (notif) => {
        // Mark as read if unread
        if (!notif.isRead) {
            try {
                await api.patch(`/api/notifications/${notif._id}/read`);
                // Update local state
                setNotifications(prev => prev.map(n =>
                    n._id === notif._id ? { ...n, isRead: true } : n
                ));
            } catch (error) {
                console.error("Mark read error", error);
            }
        }

        // Redirect if link exists
        if (notif.link) {
            navigate(notif.link);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'payment': return <CreditCard className="w-5 h-5 text-emerald-500" />;
            case 'participant': return <User className="w-5 h-5 text-blue-500" />;
            default: return <Info className="w-5 h-5 text-neutral-500" />;
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
            <Spinner className="w-8 h-8 text-black" />
        </div>
    );

    return (
        <div className="min-h-screen bg-neutral-50 font-sans text-neutral-900">
            <Navbar forceDark={true} />

            <div className="pt-32 pb-20 px-6 max-w-4xl mx-auto">
                <header className="mb-10 flex items-center gap-4">
                    <div className="p-3 bg-black text-white rounded-full">
                        <Bell className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-light">Notifications</h1>
                        <p className="text-neutral-500 text-sm">Stay updated with your gallery activity.</p>
                    </div>
                </header>

                <div className="space-y-4">
                    {notifications.length === 0 ? (
                        <div className="text-center py-12 text-neutral-400 border-2 border-dashed border-neutral-200 rounded-xl">
                            No notifications yet.
                        </div>
                    ) : (
                        notifications.map((notif) => (
                            <div
                                key={notif._id}
                                onClick={() => handleNotificationClick(notif)}
                                className={`
                                    relative p-6 rounded-xl border transition-all cursor-pointer group
                                    ${notif.isRead
                                        ? 'bg-white border-neutral-200 hover:border-neutral-300'
                                        : 'bg-white border-l-4 border-l-black border-y-neutral-200 border-r-neutral-200 shadow-sm'
                                    }
                                `}
                            >
                                <div className="flex gap-6 items-start">
                                    <div className={`p-3 rounded-full shrink-0 ${notif.isRead ? 'bg-neutral-100' : 'bg-neutral-50'}`}>
                                        {getIcon(notif.type)}
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className={`text-base ${notif.isRead ? 'font-medium text-neutral-700' : 'font-bold text-black'}`}>
                                                {notif.title}
                                            </h3>
                                            <span className="text-xs font-mono text-neutral-400 shrink-0 ml-4">
                                                {new Date(notif.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-neutral-500 leading-relaxed mb-3">
                                            {notif.message}
                                        </p>

                                        {notif.link && (
                                            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-400 group-hover:text-black transition-colors">
                                                View Details <ExternalLink className="w-3 h-3" />
                                            </div>
                                        )}
                                    </div>

                                    {!notif.isRead && (
                                        <div className="absolute top-6 right-6 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Notifications;

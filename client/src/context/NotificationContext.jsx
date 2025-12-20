import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '@/api/axios';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const NotificationContext = createContext();

export function useNotification() {
    return useContext(NotificationContext);
}

// Provides notification state and real-time polling updates for the application
export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [latestNotification, setLatestNotification] = useState(null);
    const [showToast, setShowToast] = useState(false);
    const navigate = useNavigate();

    const { user } = useSelector((state) => state.auth);

    const fetchNotifications = useCallback(async (initial = false) => {
        if (!user) return;

        try {
            const response = await api.get('/api/notifications');
            const data = response.data;

            // Refresh notifications triggers toast if new unread message exists
            if (!initial && data.length > 0) {
                const newLatest = data[0]; // Assuming sorted desc by backend
                const currentLatestId = notifications.length > 0 ? notifications[0]._id : null;

                // Logic: If the newest fetched ID is different from our current newest, it's new
                if (newLatest._id !== currentLatestId && !newLatest.isRead) {
                    setLatestNotification(newLatest);
                    setShowToast(true);

                    // Dismiss toast automatically
                    setTimeout(() => setShowToast(false), 5000);
                }
            }

            setNotifications(data);
        } catch (error) {
            // Silence 401 errors during polling to avoid console spam
            if (error.response?.status !== 401) {
                console.error("Notification Poll Error", error);
            }
        }
    }, [user, notifications]);

    const closeToast = useCallback(() => setShowToast(false), []);

    // Initial Fetch on Mount
    useEffect(() => {
        if (user) {
            fetchNotifications(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    // Polling Mechanism (Every 15s)
    useEffect(() => {
        if (!user) return;
        const interval = setInterval(() => {
            fetchNotifications(false);
        }, 15000);
        return () => clearInterval(interval);
    }, [fetchNotifications, user]);

    const handleToastClick = () => {
        if (latestNotification?.link) {
            navigate(latestNotification.link);
        }
        setShowToast(false);
    };

    return (
        <NotificationContext.Provider value={{ notifications, fetchNotifications }}>
            {children}

            {/* Global Toast for alerts */}
            <AnimatePresence>
                {showToast && latestNotification && (
                    <motion.div
                        initial={{ opacity: 0, y: -50, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: -20, x: '-50%' }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[100] w-[90%] max-w-md"
                    >
                        <div
                            onClick={handleToastClick}
                            className="bg-white/80 backdrop-blur-md border border-neutral-200 shadow-2xl rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:bg-white transition-colors"
                        >
                            <div className="bg-black text-white p-3 rounded-full shrink-0">
                                <Bell className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-sm text-neutral-900 truncate">
                                    {latestNotification.title}
                                </h4>
                                <p className="text-xs text-neutral-500 truncate">
                                    {latestNotification.message}
                                </p>
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); closeToast(); }}
                                className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-neutral-400 hover:text-black"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </NotificationContext.Provider>
    );
};

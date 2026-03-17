import React, { useState, useEffect, useContext, useRef } from 'react';
import { Bell, CheckCheck, ExternalLink } from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const NotificationBell = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    const fetchNotifications = async () => {
        if (!user) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/notifications`, config);
            setNotifications(data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, [user]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAsRead = async (id, e) => {
        e.stopPropagation();
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.patch(`${import.meta.env.VITE_API_URL}/notifications/read/${id}`, {}, config);
            setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const handleNotificationClick = (notif) => {
        setShowDropdown(false);
        navigate(`/requirement/${notif.requirementId}`);
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="relative p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-all"
            >
                <Bell size={22} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white ring-2 ring-transparent transition-all">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {showDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 py-2 z-[60] animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 border-b border-gray-50 mb-1 flex justify-between items-center">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Notifications</p>
                    </div>
                    <div className="max-h-96 overflow-y-auto px-2 space-y-1">
                        {notifications.length > 0 ? (
                            notifications.map(notif => (
                                <div
                                    key={notif._id}
                                    onClick={() => handleNotificationClick(notif)}
                                    className={`w-full flex flex-col gap-1 px-3 py-3 text-sm rounded-xl transition-colors cursor-pointer ${notif.read ? 'text-gray-500 hover:bg-gray-50' : 'text-gray-800 bg-primary-50/50 hover:bg-primary-50 border-l-4 border-primary-600'}`}
                                >
                                    <div className="flex justify-between items-start">
                                        <p className={`font-bold leading-tight ${notif.read ? 'text-gray-700' : 'text-primary-900'}`}>{notif.message}</p>
                                        {!notif.read && (
                                            <button
                                                onClick={(e) => markAsRead(notif._id, e)}
                                                className="text-primary-600 hover:text-primary-800 p-1"
                                                title="Mark as read"
                                            >
                                                <CheckCheck size={16} />
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-gray-400 font-medium">
                                        {new Date(notif.createdAt).toLocaleString()}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <div className="py-8 text-center text-gray-400">
                                <p className="text-sm font-medium">No notifications yet</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;

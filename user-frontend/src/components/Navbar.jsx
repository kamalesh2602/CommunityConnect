import React, { useContext, useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, HeartHandshake, User, Settings, ChevronDown, MessageSquare } from 'lucide-react';
import axios from 'axios';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    useEffect(() => {
        const fetchUnreadCount = async () => {
            if (!user) return;
            try {
                const config = {
                    headers: { Authorization: `Bearer ${user.token}` }
                };
                const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/chat/unread-count`, config);
                setUnreadCount(data.unreadCount);
            } catch (error) {
                console.error('Error fetching unread count:', error);
            }
        };

        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 30000); // Poll every 30 seconds
        return () => clearInterval(interval);
    }, [user]);

    return (
        <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <NavLink to="/" className="flex items-center gap-2">
                            <HeartHandshake className="text-primary-600" size={28} />
                            <span className="text-xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-secondary-600">
                                CommunityConnect
                            </span>
                        </NavLink>
                    </div>
                    <div className="flex items-center gap-6">
                        {user ? (
                            <>
                                {user.role === 'volunteer' && (
                                    <>
                                        <NavLink to="/volunteer/dashboard" className={({ isActive }) => `text-sm font-semibold transition-colors ${isActive ? 'text-primary-600' : 'text-gray-500 hover:text-gray-900'}`}>Dashboard</NavLink>
                                        <NavLink to="/volunteer/ngos" className={({ isActive }) => `text-sm font-semibold transition-colors ${isActive ? 'text-primary-600' : 'text-gray-500 hover:text-gray-900'}`}>Browse NGOs</NavLink>
                                        <NavLink to="/volunteer/followed" className={({ isActive }) => `text-sm font-semibold transition-colors ${isActive ? 'text-primary-600' : 'text-gray-500 hover:text-gray-900'}`}>Followed NGOs</NavLink>
                                    </>
                                )}
                                {user.role === 'ngo' && (
                                    <>
                                        <NavLink to="/ngo/dashboard" className={({ isActive }) => `text-sm font-semibold transition-colors ${isActive ? 'text-secondary-600' : 'text-gray-500 hover:text-gray-900'}`}>Dashboard</NavLink>
                                        <NavLink to="/ngo/requirements" className={({ isActive }) => `text-sm font-semibold transition-colors ${isActive ? 'text-secondary-600' : 'text-gray-500 hover:text-gray-900'}`}>Post Requirement</NavLink>
                                        <NavLink to="/ngo/followers" className={({ isActive }) => `text-sm font-semibold transition-colors ${isActive ? 'text-secondary-600' : 'text-gray-500 hover:text-gray-900'}`}>Followers</NavLink>
                                    </>
                                )}
                                <div className="h-6 w-px bg-gray-200"></div>
                                
                                <div className="flex items-center gap-4">
                                    {/* Chat Notification Icon */}
                                    <button 
                                        onClick={() => navigate(user.role === 'volunteer' ? '/volunteer/chat' : '/ngo/chat')}
                                        className="relative p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-all"
                                    >
                                        <MessageSquare size={22} />
                                        {unreadCount > 0 && (
                                            <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white ring-2 ring-transparent transition-all">
                                                {unreadCount > 99 ? '99+' : unreadCount}
                                            </span>
                                        )}
                                    </button>

                                    {/* Profile Dropdown */}
                                    <div className="relative">
                                        <button 
                                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                                            className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white text-xs font-bold">
                                                {(user.name || user.ngoName).charAt(0).toUpperCase()}
                                            </div>
                                            <div className="hidden sm:block text-left">
                                                <p className="text-sm font-bold text-gray-800 leading-none">{user.name || user.ngoName}</p>
                                                <p className="text-[10px] text-gray-500 mt-1 capitalize">{user.role}</p>
                                            </div>
                                            <ChevronDown size={14} className={`text-gray-400 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
                                        </button>

                                        {showProfileMenu && (
                                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 py-2 z-[60] animate-in fade-in slide-in-from-top-2 duration-200">
                                                <div className="px-4 py-3 border-b border-gray-50 mb-1">
                                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Account</p>
                                                </div>
                                                <div className="px-2 space-y-1">
                                                    <button 
                                                        onClick={() => { navigate(user.role === 'volunteer' ? '/volunteer/profile' : '/ngo/profile'); setShowProfileMenu(false); }}
                                                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-colors font-medium"
                                                    >
                                                        <Settings size={18} /> Edit Profile
                                                    </button>
                                                    <button 
                                                        onClick={handleLogout}
                                                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors font-medium text-left"
                                                    >
                                                        <LogOut size={18} /> Logout
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-4">
                                <NavLink to="/login" className="text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors">Sign In</NavLink>
                                <NavLink to="/register" className="text-sm font-bold bg-primary-600 text-white px-5 py-2.5 rounded-xl hover:bg-primary-700 shadow-sm hover:shadow-md transition-all active:scale-95">Get Started</NavLink>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {/* Removed FloatingChatWidget as requested */}
        </nav>
    );
};

export default Navbar;

import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, HeartHandshake } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

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
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-bold text-gray-800">{user.name || user.ngoName}</span>
                                    <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded-md transition-colors font-semibold">
                                        <LogOut size={16} /> Logout
                                    </button>
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
        </nav>
    );
};

export default Navbar;

import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, Users, Building2, LogOut } from 'lucide-react';

const Sidebar = () => {
    const { logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="w-64 bg-white shadow-xl h-screen fixed top-0 left-0 border-r border-gray-100">
            <div className="p-6">
                <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                    Admin Connect
                </h1>
            </div>
            <nav className="mt-6 flex flex-col gap-2 px-4">
                <NavLink to="/dashboard" className={({ isActive }) => `flex items-center gap-3 p-3 font-medium rounded-xl transition-all duration-200 ${isActive ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                    <LayoutDashboard size={20} /> Dashboard
                </NavLink>
                <NavLink to="/volunteers" className={({ isActive }) => `flex items-center gap-3 p-3 font-medium rounded-xl transition-all duration-200 ${isActive ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                    <Users size={20} /> Volunteers
                </NavLink>
                <NavLink to="/ngos" className={({ isActive }) => `flex items-center gap-3 p-3 font-medium rounded-xl transition-all duration-200 ${isActive ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                    <Building2 size={20} /> NGOs
                </NavLink>
            </nav>
            <div className="absolute bottom-0 w-full p-4 border-t border-gray-100">
                <button onClick={handleLogout} className="flex items-center gap-3 p-3 w-full font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                    <LogOut size={20} /> Logout
                </button>
            </div>
        </div>
    );
};

export default Sidebar;

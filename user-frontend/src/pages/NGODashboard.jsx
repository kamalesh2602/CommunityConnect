import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { FileText, IndianRupee, MessageCircle, AlertCircle, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const NGODashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        postedRequirements: 0,
        receivedDonations: 0,
        totalAmount: 0,
        unreadMessages: 0
    });
    const [donations, setDonations] = useState([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };

                const { data: reqData } = await axios.get(`${import.meta.env.VITE_API_URL}/requirements/ngo/${user._id}`, config);
                const { data: donData } = await axios.get(`${import.meta.env.VITE_API_URL}/donations/ngo`, config);

                setDonations(donData);
                const totalDonated = donData.reduce((acc, curr) => acc + curr.amount, 0);

                const { data: unreadData } = await axios.get(`${import.meta.env.VITE_API_URL}/chat/unread-count`, config);

                setStats({
                    postedRequirements: reqData.length,
                    receivedDonations: donData.length,
                    totalAmount: totalDonated,
                    unreadMessages: unreadData.unreadCount
                });

            } catch (error) {
                console.error(error);
            }
        };
        if (user) fetchDashboardData();
    }, [user]);

    return (
        <div className="py-8">
            <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Organization Dashboard</h1>
            <div className="flex items-center gap-3 mb-8">
                <span className="text-lg text-gray-600 font-medium">Welcome back, {user.ngoName}</span>
                {!user.verified && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 border border-amber-200 text-amber-800 rounded-lg text-sm font-bold shadow-sm">
                        <AlertCircle size={16} /> Pending Verification
                    </span>
                )}
            </div>

            {!user.verified && (
                <div className="bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 text-amber-800 p-6 rounded-3xl mb-8 shadow-sm">
                    <h3 className="text-lg font-black mb-1 flex items-center gap-2">
                        <AlertCircle size={20} className="text-amber-600" /> Account Pending Verification
                    </h3>
                    <p className="font-medium text-amber-700 mb-4">Your account is currently under review by an administrator. You can post requirements, but they won't be visible to volunteers until your account is verified.</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <Link to="/ngo/requirements" className="bg-white hover:bg-gray-50 rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center gap-6 transition-all group">
                    <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <FileText size={28} />
                    </div>
                    <div>
                        <p className="text-gray-500 font-medium mb-1">Active Requirements</p>
                        <h3 className="text-3xl font-black text-gray-800">{stats.postedRequirements}</h3>
                    </div>
                </Link>
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center gap-6">
                    <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                        <IndianRupee size={28} />
                    </div>
                    <div>
                        <p className="text-gray-500 font-medium mb-1">Total Funds Raised</p>
                        <h3 className="text-3xl font-black text-gray-800">₹{stats.totalAmount}</h3>
                    </div>
                </div>
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center gap-6">
                    <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                        <MessageCircle size={28} />
                    </div>
                    <div>
                        <p className="text-gray-500 font-medium mb-1">Donations Received</p>
                        <h3 className="text-3xl font-black text-gray-800">{stats.receivedDonations}</h3>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h2 className="text-xl font-bold text-gray-900">Recent Donations</h2>
                </div>
                {donations.length > 0 ? (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 text-sm font-bold text-gray-500 uppercase tracking-wide">
                                <th className="px-6 py-4">Volunteer</th>
                                <th className="px-6 py-4">Requirement</th>
                                <th className="px-6 py-4 text-center">Amount</th>
                                <th className="px-6 py-4 text-right">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {donations.map(don => (
                                <tr key={don._id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-gray-800">{don.volunteerId?.name || 'Unknown'}</p>
                                        <p className="text-xs text-gray-500 font-medium mt-0.5">{don.volunteerId?.email}</p>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 font-medium">{don.requirementId?.title || 'Unknown Req'}</td>
                                    <td className="px-6 py-4 font-black text-emerald-600 text-center text-lg">₹{don.amount}</td>
                                    <td className="px-6 py-4 text-gray-500 text-sm font-medium text-right">{new Date(don.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="p-16 text-center text-gray-500 bg-gray-50/30">
                        <p className="text-lg font-medium">No donations received yet. Stay active to attract more volunteers!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NGODashboard;

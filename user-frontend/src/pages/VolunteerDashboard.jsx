import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Heart, MessageCircle, Building2 } from 'lucide-react';

const VolunteerDashboard = () => {
    const { user } = useContext(AuthContext);
    const [stats, setStats] = useState({
        followedNGOs: 0,
        donatedAmount: 0,
        donationsCount: 0
    });
    const [donations, setDonations] = useState([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                // Fetch donations
                const { data: donationsData } = await axios.get(`${import.meta.env.VITE_API_URL}/donations/volunteer`, config);
                setDonations(donationsData);
                const totalDonated = donationsData.reduce((acc, curr) => acc + curr.amount, 0);

                // Fetch Followed NGOs
                const { data: followedData } = await axios.get(`${import.meta.env.VITE_API_URL}/volunteer/followed-ngos`, config);

                setStats({
                    followedNGOs: followedData.length,
                    donatedAmount: totalDonated,
                    donationsCount: donationsData.length
                });

            } catch (error) {
                console.error(error);
            }
        };
        if (user) fetchDashboardData();
    }, [user]);

    return (
        <div className="py-8">
            <h1 className="text-3xl font-black text-gray-900 mb-8 tracking-tight">Welcome, {user.name}</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center gap-6">
                    <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                        <Heart size={28} />
                    </div>
                    <div>
                        <p className="text-gray-500 font-medium mb-1">Total Impact</p>
                        <h3 className="text-3xl font-black text-gray-800">₹{stats.donatedAmount}</h3>
                    </div>
                </div>
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center gap-6">
                    <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                        <Building2 size={28} />
                    </div>
                    <div>
                        <p className="text-gray-500 font-medium mb-1">Followed NGOs</p>
                        <h3 className="text-3xl font-black text-gray-800">{stats.followedNGOs}</h3>
                    </div>
                </div>
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center gap-6">
                    <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                        <MessageCircle size={28} />
                    </div>
                    <div>
                        <p className="text-gray-500 font-medium mb-1">Total Donations</p>
                        <h3 className="text-3xl font-black text-gray-800">{stats.donationsCount}</h3>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">Recent Donations</h2>
                </div>
                {donations.length > 0 ? (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 text-sm font-bold text-gray-500 uppercase tracking-wide">
                                <th className="px-6 py-4">NGO</th>
                                <th className="px-6 py-4">Requirement</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {donations.map(don => (
                                <tr key={don._id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 font-semibold text-gray-800">{don.ngoId?.ngoName || 'NGO Deleted'}</td>
                                    <td className="px-6 py-4 text-gray-600">{don.requirementId?.title || 'Req Deleted'}</td>
                                    <td className="px-6 py-4 font-bold text-emerald-600">₹{don.amount}</td>
                                    <td className="px-6 py-4 text-gray-500 text-sm">{new Date(don.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="p-12 text-center text-gray-500 bg-gray-50/30">
                        <p className="font-medium">No donations yet. Browse NGOs to start making an impact!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VolunteerDashboard;

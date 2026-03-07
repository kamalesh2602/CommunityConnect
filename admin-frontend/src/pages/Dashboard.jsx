import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Users, Building2, FileText, IndianRupee } from 'lucide-react';

const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-6">
        <div className={`p-4 rounded-xl ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-gray-500 font-medium mb-1">{title}</p>
            <h3 className="text-3xl font-black text-gray-800">{value}</h3>
        </div>
    </div>
);

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const { admin } = useContext(AuthContext);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${admin.token}` } };
                const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/admin/dashboard`, config);
                setStats(data);
            } catch (error) {
                console.error(error);
            }
        };
        if (admin) fetchStats();
    }, [admin]);

    if (!stats) return <div className="p-8 text-gray-500">Loading dashboard data...</div>;

    return (
        <div>
            <h1 className="text-3xl font-black text-gray-900 mb-8 tracking-tight">Dashboard Overview</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <StatCard
                    title="Total Volunteers"
                    value={stats.totalVolunteers}
                    icon={<Users size={28} className="text-blue-600" />}
                    color="bg-blue-50"
                />
                <StatCard
                    title="Total NGOs"
                    value={stats.totalNGOs}
                    icon={<Building2 size={28} className="text-emerald-600" />}
                    color="bg-emerald-50"
                />
                <StatCard
                    title="Active Requirements"
                    value={stats.totalRequirements}
                    icon={<FileText size={28} className="text-purple-600" />}
                    color="bg-purple-50"
                />
                <StatCard
                    title="Total Donations"
                    value={`₹${stats.totalDonationsAmount}`}
                    icon={<IndianRupee size={28} className="text-orange-600" />}
                    color="bg-orange-50"
                />
            </div>
        </div>
    );
};

export default Dashboard;

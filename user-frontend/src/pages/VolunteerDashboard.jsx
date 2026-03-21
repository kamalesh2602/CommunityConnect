import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Heart, Building2, ChevronRight, Bell, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import RequirementCard from '../components/RequirementCard';

const VolunteerDashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        followedNGOs: 0,
        donatedAmount: 0,
        donationsCount: 0,
        unreadNotifications: 0
    });
    const [recentRequirements, setRecentRequirements] = useState([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                
                // Fetch stats
                const { data: donationsData } = await axios.get(`${import.meta.env.VITE_API_URL}/donations/volunteer`, config);
                const totalDonated = donationsData.reduce((acc, curr) => acc + curr.amount, 0);

                const { data: followedData } = await axios.get(`${import.meta.env.VITE_API_URL}/volunteer/followed-ngos`, config);

                const { data: notificationsData } = await axios.get(`${import.meta.env.VITE_API_URL}/notifications`, config);
                const unreadNotifs = notificationsData.filter(n => !n.read).length;

                setStats({
                    followedNGOs: followedData.length,
                    donatedAmount: totalDonated,
                    donationsCount: donationsData.length,
                    unreadNotifications: unreadNotifs
                });

                // Fetch recent requirements (last 3 from feed)
                const { data: feedData } = await axios.get(`${import.meta.env.VITE_API_URL}/requirements/feed`, config);
                setRecentRequirements(feedData.slice(0, 3));

            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            }
        };
        if (user) fetchDashboardData();
    }, [user]);

    return (
        <div className="py-8">
            <header className="mb-12">
                <h1 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">Hello, {user.name}</h1>
                <p className="text-gray-500 font-medium text-lg">Here's what's happening in your community today.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
                        <Heart size={24} />
                    </div>
                    <p className="text-gray-500 font-bold text-xs uppercase tracking-widest mb-1">Total Impact</p>
                    <h3 className="text-3xl font-black text-gray-800">₹{stats.donatedAmount.toLocaleString()}</h3>
                </div>
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
                        <Building2 size={24} />
                    </div>
                    <p className="text-gray-500 font-bold text-xs uppercase tracking-widest mb-1">Organizations</p>
                    <h3 className="text-3xl font-black text-gray-800">{stats.followedNGOs}</h3>
                </div>
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                    <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-4">
                        <Bell size={24} />
                    </div>
                    <p className="text-gray-500 font-bold text-xs uppercase tracking-widest mb-1">Messages</p>
                    <h3 className="text-3xl font-black text-gray-800">{stats.unreadNotifications}</h3>
                </div>
                <button 
                    onClick={() => navigate('/volunteer/activity')}
                    className="bg-primary-600 text-white rounded-3xl p-6 shadow-lg shadow-primary-600/20 hover:-translate-y-1 transition-all group text-left"
                >
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Activity size={24} />
                    </div>
                    <p className="text-white/70 font-bold text-xs uppercase tracking-widest mb-1">View Activity</p>
                    <h3 className="text-2xl font-black flex items-center gap-2">History <ChevronRight size={20} /></h3>
                </button>
            </div>

            <section>
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Recent Requirements</h2>
                    <button 
                        onClick={() => navigate('/requirements')}
                        className="text-primary-600 font-bold text-sm hover:underline flex items-center gap-1"
                    >
                        View All <ChevronRight size={16} />
                    </button>
                </div>

                {recentRequirements.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {recentRequirements.map(req => (
                            <RequirementCard 
                                key={req._id} 
                                requirement={req} 
                                onNavigate={(id) => navigate(`/requirement/${id}`)}
                                isPreview={true}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="bg-gray-50 rounded-3xl p-12 text-center border-2 border-dashed border-gray-200">
                        <p className="text-gray-500 font-medium">No recent requirements found. Try following more NGOs!</p>
                        <button 
                            onClick={() => navigate('/volunteer/ngos')}
                            className="mt-4 text-primary-600 font-black"
                        >
                            Explore Organizations
                        </button>
                    </div>
                )}
            </section>
        </div>
    );
};

export default VolunteerDashboard;

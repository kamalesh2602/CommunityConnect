import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Heart, ArrowLeft, IndianRupee, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const VolunteerActivity = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDonations = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/donations/volunteer`, config);
                setDonations(data);
            } catch (error) {
                console.error('Error fetching donations:', error);
            } finally {
                setLoading(false);
            }
        };
        if (user) fetchDonations();
    }, [user]);

    if (loading) return <div className="text-center py-20 font-bold text-gray-400">Loading activity...</div>;

    return (
        <div className="py-8 max-w-5xl mx-auto">
             <button 
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-500 hover:text-primary-600 font-bold mb-8 transition-colors group"
            >
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Back
            </button>

            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-primary-100 text-primary-600 rounded-2xl">
                    <Heart size={28} />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Your Activity</h1>
                    <p className="text-gray-500 font-medium">History of your contributions and impact</p>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">Donation History</h2>
                </div>
                {donations.length > 0 ? (
                    <div className="overflow-x-auto">
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
                                        <td className="px-6 py-4 text-gray-600">{don.requirementId?.title || 'Requirement Deleted'}</td>
                                        <td className="px-6 py-4 font-bold text-emerald-600">
                                            <span className="flex items-center gap-0.5"><IndianRupee size={14} /> {don.amount.toLocaleString()}</span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 text-sm">
                                            <span className="flex items-center gap-1.5"><Calendar size={14} /> {new Date(don.createdAt).toLocaleDateString()}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-16 text-center text-gray-500 bg-gray-50/30">
                        <Heart size={48} className="mx-auto text-gray-200 mb-4" />
                        <p className="font-medium text-lg">No donations yet. Start your journey of giving today!</p>
                        <button 
                            onClick={() => navigate('/requirements')}
                            className="mt-6 bg-primary-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-700 transition-all shadow-md"
                        >
                            View Requirements
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VolunteerActivity;

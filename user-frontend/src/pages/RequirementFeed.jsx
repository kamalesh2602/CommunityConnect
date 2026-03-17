import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { IndianRupee, Calendar, Building2, ChevronRight, LayoutGrid } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RequirementFeed = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [requirements, setRequirements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeed = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/requirements/feed`, config);
                setRequirements(data);
            } catch (error) {
                console.error('Error fetching feed:', error);
            } finally {
                setLoading(false);
            }
        };
        if (user) fetchFeed();
    }, [user]);

    if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-gray-400">Loading your feed...</div>;

    return (
        <div className="py-8 max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-primary-100 text-primary-600 rounded-2xl">
                    <LayoutGrid size={28} />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Your Feed</h1>
                    <p className="text-gray-500 font-medium">Requirements from NGOs you follow</p>
                </div>
            </div>

            {requirements.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {requirements.map((req) => (
                        <div 
                            key={req._id} 
                            onClick={() => navigate(`/requirement/${req._id}`)}
                            className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group flex flex-col h-full"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-gray-50 rounded-xl text-gray-400 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                                    <Building2 size={20} />
                                </div>
                                <div className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${req.status === 'open' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-600'}`}>
                                    {req.status}
                                </div>
                            </div>
                            
                            <div className="flex-1 mb-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight group-hover:text-primary-600 transition-colors">{req.title}</h3>
                                <p className="text-sm text-gray-500 font-bold mb-3 flex items-center gap-1.5 line-clamp-1">
                                    by {req.ngoId?.ngoName}
                                </p>
                                <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">{req.description}</p>
                            </div>

                            <div className="flex items-center justify-between border-t border-gray-50 pt-5">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Goal</span>
                                    <span className="text-lg font-black text-emerald-600 flex items-center gap-0.5">
                                        <IndianRupee size={16} /> {req.amountNeeded.toLocaleString()}
                                    </span>
                                </div>
                                {req.deadline && (
                                    <div className="flex flex-col items-end">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Deadline</span>
                                        <span className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
                                            <Calendar size={14} className="text-gray-400" /> 
                                            {new Date(req.deadline).toLocaleDateString()}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
                    <Building2 size={48} className="mx-auto text-gray-200 mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Your feed is empty</h3>
                    <p className="text-gray-500 max-w-sm mx-auto mb-8 font-medium">Follow more NGOs or check back later for new requirements from your favorite organizations.</p>
                    <button 
                        onClick={() => navigate('/volunteer/ngos')}
                        className="bg-primary-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-700 transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center gap-2 mx-auto"
                    >
                        Browse NGOs <ChevronRight size={18} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default RequirementFeed;

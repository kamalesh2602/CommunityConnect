import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Building2, UserPlus, CheckCircle } from 'lucide-react';

const BrowseNGOs = () => {
    const [ngos, setNgos] = useState([]);
    const [followedNgos, setFollowedNgos] = useState([]);
    const [selectedNgo, setSelectedNgo] = useState(null);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    const fetchNGOs = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/volunteer/ngos`, config);
            setNgos(data);

            // Getting followed NGOs
            const followed = await axios.get(`${import.meta.env.VITE_API_URL}/volunteer/followed-ngos`, config);
            setFollowedNgos(followed.data.map(n => n._id));

        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (user) fetchNGOs();
    }, [user]);

    const handleFollow = async (ngoId) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.post(`${import.meta.env.VITE_API_URL}/volunteer/follow`, { ngoId }, config);
            setFollowedNgos([...followedNgos, ngoId]);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="py-8">
            <h1 className="text-3xl font-black text-gray-900 mb-8 tracking-tight">Discover NGOs</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ngos.map(ngo => (
                    <div key={ngo._id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                                <Building2 size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1 leading-tight">{ngo.ngoName}</h3>
                                <p className="text-sm text-gray-500 font-medium inline-flex items-center gap-1.5 bg-gray-50 px-2 py-0.5 rounded-md">
                                    <CheckCircle size={14} className="text-emerald-500" /> Verified
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => setSelectedNgo(ngo)}
                                className="w-full py-2.5 bg-primary-50 hover:bg-primary-100 text-primary-700 font-bold rounded-xl transition-colors border border-primary-100"
                            >
                                View Full Profile
                            </button>
                            <button
                                onClick={() => navigate(`/volunteer/ngos/${ngo._id}/requirements`)}
                                className="w-full py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold rounded-xl transition-colors border border-gray-200"
                            >
                                View Requirements
                            </button>
                            {followedNgos.includes(ngo._id) ? (
                                <button disabled className="w-full py-2.5 bg-emerald-50 text-emerald-700 font-bold rounded-xl flex items-center justify-center gap-2">
                                    <CheckCircle size={18} /> Following
                                </button>
                            ) : (
                                <button
                                    onClick={() => handleFollow(ngo._id)}
                                    className="w-full py-2.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
                                >
                                    <UserPlus size={18} /> Follow NGO
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* NGO Profile Modal */}
            {selectedNgo && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
                        <div className="bg-gradient-to-r from-primary-600 to-secondary-600 px-8 py-10 relative">
                            <button 
                                onClick={() => setSelectedNgo(null)}
                                className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
                            >
                                <Building2 size={24} />
                            </button>
                            <div className="flex flex-col items-center text-center">
                                <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center text-white mb-4 border border-white/30">
                                    <Building2 size={40} />
                                </div>
                                <h2 className="text-2xl font-black text-white">{selectedNgo.ngoName}</h2>
                                <p className="text-primary-100 flex items-center gap-2 mt-2">
                                    <CheckCircle size={16} /> Verified Organization
                                </p>
                            </div>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email</p>
                                    <p className="text-gray-800 font-semibold">{selectedNgo.email}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Phone</p>
                                    <p className="text-gray-800 font-semibold">{selectedNgo.phone}</p>
                                </div>
                                <div className="space-y-1 col-span-2">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Address</p>
                                    <p className="text-gray-800 font-semibold">{selectedNgo.address}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Registration No.</p>
                                    <p className="text-gray-800 font-semibold">{selectedNgo.registrationNumber}</p>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button 
                                    onClick={() => navigate('/volunteer/chat', { state: { directNgoId: selectedNgo._id } })}
                                    className="flex-1 bg-primary-600 text-white font-bold py-3 rounded-xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-200"
                                >
                                    Message NGO
                                </button>
                                <button 
                                    onClick={() => setSelectedNgo(null)}
                                    className="flex-1 bg-gray-100 text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-200 transition-all"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {ngos.length === 0 && (
                    <div className="col-span-full p-12 text-center text-gray-500 bg-white rounded-3xl border border-dashed border-gray-300">
                        <Building2 size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-lg font-medium">No verified NGOs have posted requirements yet.</p>
                    </div>
                )}
        </div>
    );
};

export default BrowseNGOs;

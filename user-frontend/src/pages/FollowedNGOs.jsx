import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Heart, Building2 } from 'lucide-react';

const FollowedNGOs = () => {
    const [followedNgos, setFollowedNgos] = useState([]);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchFollowed = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/volunteer/followed-ngos`, config);
                setFollowedNgos(data);
            } catch (error) {
                console.error(error);
            }
        };
        if (user) fetchFollowed();
    }, [user]);

    return (
        <div className="py-8">
            <h1 className="text-3xl font-black text-gray-900 mb-8 tracking-tight flex items-center gap-3">
                <Heart className="text-rose-500" size={32} /> My Followed NGOs
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {followedNgos.map(ngo => (
                    <div key={ngo._id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center shrink-0">
                                <Building2 size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1 leading-tight">{ngo.ngoName}</h3>
                                <p className="text-sm text-gray-500">{ngo.email}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate(`/volunteer/ngos/${ngo._id}/requirements`)}
                            className="w-full py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold rounded-xl transition-colors"
                        >
                            View Requirements
                        </button>
                    </div>
                ))}
                {followedNgos.length === 0 && (
                    <div className="col-span-full p-12 text-center text-gray-500 bg-white rounded-3xl border border-dashed border-gray-300">
                        <Heart size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-lg font-medium">You aren't following any NGOs yet.</p>
                        <button onClick={() => navigate('/volunteer/ngos')} className="mt-4 px-6 py-2 bg-blue-50 text-blue-600 font-bold rounded-xl hover:bg-blue-100 transition-colors">
                            Discover NGOs
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FollowedNGOs;

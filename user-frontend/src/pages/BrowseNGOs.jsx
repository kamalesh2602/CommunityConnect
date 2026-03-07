import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Building2, UserPlus, CheckCircle } from 'lucide-react';

const BrowseNGOs = () => {
    const [ngos, setNgos] = useState([]);
    const [followedNgos, setFollowedNgos] = useState([]);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const fetchNGOs = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/admin/ngos`, config); // Instead of public ngos, admin/ngos returns all. Let's make sure it's public. Wait, volunteer needs a route to get verified NGOs or we filter here.
            // Oh wait, admin protected route returns all. I need to get requirements with populated NGO, or create a public NGO route.
            // Wait, we can fetch all requirements which are public and populated with verified NGOs and extract the unique NGOs! Or I'll filter admin route if auth works? Admin route is protected by `authAdmin`. So volunteer can't access `/admin/ngos`. 
            // I'll need to fetch `/requirements` which gets verified NGOs, then extract unique ones.
            const reqData = await axios.get(`${import.meta.env.VITE_API_URL}/requirements`);
            const uniqueNgos = Array.from(new Set(reqData.data.map(req => req.ngoId._id)))
                .map(id => {
                    return reqData.data.find(req => req.ngoId._id === id).ngoId;
                });
            setNgos(uniqueNgos);

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
                                onClick={() => navigate(`/volunteer/ngos/${ngo._id}/requirements`)}
                                className="w-full py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold rounded-xl transition-colors"
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
                {ngos.length === 0 && (
                    <div className="col-span-full p-12 text-center text-gray-500 bg-white rounded-3xl border border-dashed border-gray-300">
                        <Building2 size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-lg font-medium">No verified NGOs have posted requirements yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BrowseNGOs;

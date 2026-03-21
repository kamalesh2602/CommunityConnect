import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Users, MessageCircle, User, Phone, Mail, Hash, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NGOFollowers = () => {
    const { user } = useContext(AuthContext);
    const [followers, setFollowers] = useState([]);
    const [selectedVolunteer, setSelectedVolunteer] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchFollowers = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/ngo/followers`, config);
                setFollowers(data);
            } catch (error) {
                console.error(error);
            }
        };
        if (user) fetchFollowers();
    }, [user]);

    return (
        <div className="py-8">
            <h1 className="text-3xl font-black text-gray-900 mb-8 tracking-tight flex items-center gap-3">
                <Users className="text-indigo-600" size={32} /> Our Followers
            </h1>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                {followers.length > 0 ? (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 text-sm font-bold text-gray-500 uppercase tracking-wide border-b border-gray-100">
                                <th className="px-6 py-4">Volunteer Name</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {followers.map(volunteer => (
                                <tr key={volunteer._id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-5 font-bold text-gray-800 text-lg">{volunteer.name}</td>
                                    <td className="px-6 py-5 text-gray-600 font-medium">{volunteer.email}</td>
                                    <td className="px-6 py-5 text-right flex justify-end gap-3">
                                        <button
                                            onClick={() => setSelectedVolunteer(volunteer)}
                                            className="inline-flex items-center gap-2 bg-gray-50 text-gray-600 hover:bg-gray-100 px-4 py-2 rounded-xl font-bold transition-colors border border-gray-200"
                                        >
                                            <User size={18} /> View Profile
                                        </button>
                                        <button
                                            onClick={() => navigate(`/chat/${volunteer._id}`, { state: { name: volunteer.name } })}
                                            className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-4 py-2 rounded-xl font-bold transition-colors"
                                        >
                                            <MessageCircle size={18} /> Chat
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="p-16 text-center text-gray-500 bg-gray-50/30">
                        <Users size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-lg font-medium">You don't have any followers yet. Keep posting active campaigns!</p>
                    </div>
                )}
            </div>

            {/* Volunteer Profile Modal */}
            {selectedVolunteer && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in duration-200">
                        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-8 py-10 relative">
                            <button 
                                onClick={() => setSelectedVolunteer(null)}
                                className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
                            >
                                <X size={24} />
                            </button>
                            <div className="flex flex-col items-center text-center">
                                <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center text-white mb-4 border border-white/30 text-3xl font-black">
                                    {selectedVolunteer.name.charAt(0)}
                                </div>
                                <h2 className="text-2xl font-black text-white">{selectedVolunteer.name}</h2>
                                <p className="text-indigo-100 mt-1 font-medium">Community Volunteer</p>
                            </div>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
                                        <Mail size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email Address</p>
                                        <p className="text-gray-800 font-bold">{selectedVolunteer.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
                                        <Phone size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Phone Number</p>
                                        <p className="text-gray-800 font-bold">{selectedVolunteer.phone}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
                                        <Hash size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Aadhar Reference</p>
                                        <p className="text-gray-800 font-bold">Verified {selectedVolunteer.aadhar.replace(/.(?=.{4})/g, '*')}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button 
                                    onClick={() => {
                                        navigate(`/chat/${selectedVolunteer._id}`, { state: { name: selectedVolunteer.name } });
                                        setSelectedVolunteer(null);
                                    }}
                                    className="flex-1 bg-indigo-600 text-white font-bold py-3.5 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
                                >
                                    <MessageCircle size={20} /> Chat
                                </button>
                                <button 
                                    onClick={() => setSelectedVolunteer(null)}
                                    className="flex-1 bg-gray-100 text-gray-600 font-bold py-3.5 rounded-xl hover:bg-gray-200 transition-all"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NGOFollowers;

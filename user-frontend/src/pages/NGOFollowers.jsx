import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Users, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NGOFollowers = () => {
    const { user } = useContext(AuthContext);
    const [followers, setFollowers] = useState([]);
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
                                    <td className="px-6 py-5 text-right">
                                        <button
                                            onClick={() => navigate('/ngo/chat', { state: { volunteerId: volunteer._id, volunteerName: volunteer.name } })}
                                            className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-4 py-2 rounded-xl font-bold transition-colors"
                                        >
                                            <MessageCircle size={18} /> Direct Message
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
        </div>
    );
};

export default NGOFollowers;

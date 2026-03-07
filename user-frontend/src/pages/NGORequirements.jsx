import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { IndianRupee, MessageCircle, X, Heart } from 'lucide-react';

const NGORequirements = () => {
    const { id } = useParams(); // ngoId
    const { user } = useContext(AuthContext);
    const [requirements, setRequirements] = useState([]);
    const [isDonating, setIsDonating] = useState(false);
    const [selectedReq, setSelectedReq] = useState(null);
    const [amount, setAmount] = useState('');
    const [message, setMessage] = useState('');
    const location = useLocation();
    const navigate = useNavigate();
    const ngoName = location.state?.ngoName || 'NGO';

    useEffect(() => {
        const fetchReqs = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/requirements/ngo/${id}`, config);
                setRequirements(data);
            } catch (error) {
                console.error(error);
            }
        };
        if (user) fetchReqs();
    }, [user, id]);

    const handleDonateClick = (req) => {
        setSelectedReq(req);
        setIsDonating(true);
    };

    const submitDonation = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.post(`${import.meta.env.VITE_API_URL}/donations`, {
                ngoId: id,
                requirementId: selectedReq._id,
                amount: Number(amount),
                message
            }, config);
            setIsDonating(false);
            setAmount('');
            setMessage('');
            alert('Donation successful! Thank you.');
        } catch (error) {
            console.error(error);
            alert('Donation failed.');
        }
    };

    return (
        <div className="py-8 relative">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">{ngoName} Requirements</h1>
                    <p className="text-gray-500 font-medium">Support the causes that matter to you</p>
                </div>
                <button
                    onClick={() => navigate('/volunteer/chat', { state: { ngoId: id, ngoName } })}
                    className="flex items-center gap-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm"
                >
                    <MessageCircle size={20} /> Chat with NGO
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {requirements.map(req => (
                    <div key={req._id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-md transition-shadow">
                        <div className="mb-4 flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{req.title}</h3>
                            <p className="text-gray-600 mb-4 whitespace-pre-wrap">{req.description}</p>
                            <div className="flex gap-4 mb-2">
                                <div className="bg-orange-50 text-orange-700 px-3 py-1.5 rounded-lg flex items-center gap-1 font-bold text-sm">
                                    <IndianRupee size={16} /> Needed: {req.amountNeeded}
                                </div>
                                <div className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg flex items-center gap-1 font-bold text-sm">
                                    Deadline: {new Date(req.deadline).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => handleDonateClick(req)}
                            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:from-emerald-600 hover:to-teal-600 shadow-md hover:shadow-lg transition-all"
                        >
                            <Heart size={18} /> Donate Now
                        </button>
                    </div>
                ))}
                {requirements.length === 0 && (
                    <div className="col-span-full p-12 text-center text-gray-500 bg-white rounded-3xl border border-dashed border-gray-300">
                        <p className="text-lg font-medium">This NGO hasn't posted any requirements yet.</p>
                    </div>
                )}
            </div>

            {isDonating && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-xl font-black text-gray-900">Make a Donation</h3>
                            <button onClick={() => setIsDonating(false)} className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-1.5 rounded-lg transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={submitDonation} className="p-6 space-y-5">
                            <div className="bg-gray-50 rounded-xl p-4 mb-2">
                                <p className="text-sm text-gray-500 font-medium mb-1">Contributing to</p>
                                <p className="font-bold text-gray-900">{selectedReq.title}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Amount (₹)</label>
                                <input
                                    type="number"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 transition-all text-gray-900 font-bold bg-gray-50 focus:bg-white"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="Enter amount"
                                    min="1"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Message (Optional)</label>
                                <textarea
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 transition-all text-gray-900 bg-gray-50 focus:bg-white resize-none h-24"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Write a message to the NGO..."
                                ></textarea>
                            </div>
                            <button
                                type="submit"
                                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg rounded-xl shadow-md hover:shadow-lg transition-all border border-transparent"
                            >
                                Confirm Donation
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NGORequirements;

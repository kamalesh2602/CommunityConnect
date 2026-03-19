import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { IndianRupee, Calendar, Building2, MessageCircle, Heart, ArrowLeft, CheckCircle2 } from 'lucide-react';

const RequirementDetails = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [requirement, setRequirement] = useState(null);
    const [loading, setLoading] = useState(true);
    const [amount, setAmount] = useState('');

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/requirements/${id}`);
                setRequirement(data);
            } catch (error) {
                console.error('Error fetching details:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id]);

    const handleDonate = async () => {
        if (!user) return navigate('/login');
        if (!amount || amount <= 0) return alert('Please enter a valid amount');

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            
            // 1. Create order at backend
            const { data: order } = await axios.post(`${import.meta.env.VITE_API_URL}/payment/create-order`, {
                amount: Number(amount)
            }, config);

            // 2. Setup Razorpay options
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: "Community Connect",
                description: `Donation for ${requirement.title}`,
                order_id: order.id,
                handler: async (response) => {
                    // 3. Payment success - record donation in db
                    try {
                        await axios.post(`${import.meta.env.VITE_API_URL}/donations`, {
                            ngoId: requirement.ngoId._id,
                            requirementId: requirement._id,
                            amount: Number(amount),
                            message: `Donation for ${requirement.title} (Payment ID: ${response.razorpay_payment_id})`
                        }, config);

                        alert('Thank you for your donation!');
                        setAmount('');
                        // refresh data
                        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/requirements/${id}`);
                        setRequirement(data);
                    } catch (dbError) {
                        console.error('Recording donation failed:', dbError);
                        alert('Payment was successful, but failed to record donation. Please contact support.');
                    }
                },
                prefill: {
                    name: user.name,
                    email: user.email,
                },
                theme: {
                    color: "#2563eb"
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (error) {
            console.error('Donation flow failed:', error);
            alert(error.response?.data?.message || 'Payment initiation failed');
        }
    };

    const handleChat = () => {
        if (!user) return navigate('/login');
        navigate('/volunteer/chat', { state: { ngoId: requirement.ngoId._id, ngoName: requirement.ngoId.ngoName } });
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-gray-400">Loading details...</div>;
    if (!requirement) return <div className="min-h-screen flex items-center justify-center font-bold text-red-400">Requirement not found</div>;

    const isFulfilled = requirement.status === 'fulfilled';

    return (
        <div className="py-8 max-w-4xl mx-auto">
            <button 
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-500 hover:text-primary-600 font-bold mb-8 transition-colors group"
            >
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Back
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 h-full">
                        <div className="flex items-center justify-between mb-6">
                             <div className={`text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full ${isFulfilled ? 'bg-gray-100 text-gray-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                {requirement.status}
                            </div>
                            <span className="text-xs font-bold text-gray-400">Posted on {new Date(requirement.createdAt).toLocaleDateString()}</span>
                        </div>

                        <h1 className="text-4xl font-black text-gray-900 mb-4 leading-tight">{requirement.title}</h1>
                        
                        <div className="flex items-center gap-3 mb-8 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                             <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-primary-600 shadow-sm border border-gray-100">
                                <Building2 size={24} />
                             </div>
                             <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Organized by</p>
                                <p className="text-lg font-black text-gray-800 leading-none">{requirement.ngoId?.ngoName}</p>
                             </div>
                        </div>

                        <div className="prose prose-blue max-w-none">
                            <h3 className="text-xl font-bold text-gray-900 mb-3">About this requirement</h3>
                            <p className="text-gray-600 leading-relaxed whitespace-pre-line">{requirement.description}</p>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <div className="space-y-6 sticky top-24">
                        <div className="bg-white rounded-3xl p-6 shadow-xl shadow-primary-900/5 border border-primary-50">
                            <div className="mb-6">
                                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Target Amount</p>
                                <h2 className="text-3xl font-black text-emerald-600 flex items-center gap-1">
                                    <IndianRupee size={24} /> {requirement.amountNeeded.toLocaleString()}
                                </h2>
                            </div>

                            {requirement.deadline && (
                                <div className="mb-8 flex items-center gap-3 text-gray-600 bg-amber-50 p-3 rounded-xl border border-amber-100">
                                    <Calendar size={20} className="text-amber-500" />
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-tight text-amber-600">Deadline</p>
                                        <p className="font-bold text-sm">{new Date(requirement.deadline).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            )}

                            {!isFulfilled ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Donation Amount (₹)</label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</div>
                                            <input 
                                                type="number" 
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                                placeholder="500"
                                                className="w-full pl-8 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all font-black text-gray-800"
                                            />
                                        </div>
                                    </div>
                                    <button 
                                        onClick={handleDonate}
                                        className="w-full py-4 bg-primary-600 text-white rounded-2xl font-black text-lg shadow-lg shadow-primary-600/20 hover:bg-primary-700 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Heart size={20} /> Donate Now
                                    </button>
                                </div>
                            ) : (
                                <div className="bg-gray-50 rounded-2xl p-6 text-center border-2 border-dashed border-gray-200">
                                    <CheckCircle2 size={40} className="mx-auto text-emerald-500 mb-3" />
                                    <h3 className="text-lg font-black text-gray-800 mb-1">Requirement Completed</h3>
                                    <p className="text-sm text-gray-500 font-medium">This cause has reached its goal or has been closed by the NGO.</p>
                                </div>
                            )}
                        </div>

                        <button 
                            onClick={handleChat}
                            className="w-full py-4 bg-white text-gray-800 border-2 border-gray-100 rounded-2xl font-black transition-all hover:bg-gray-50 flex items-center justify-center gap-2 shadow-sm"
                        >
                            <MessageCircle size={20} className="text-primary-600" /> Chat with NGO
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RequirementDetails;

import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { IndianRupee, Calendar, Building2, MessageCircle, Heart, ArrowLeft, CheckCircle2, QrCode, CreditCard, Copy, Check, AlertCircle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const RequirementDetails = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [requirement, setRequirement] = useState(null);
    const [loading, setLoading] = useState(true);
    const [amount, setAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('razorpay');
    const [utrNumber, setUtrNumber] = useState('');
    const [copiedUpi, setCopiedUpi] = useState(false);
    const [submittingUpi, setSubmittingUpi] = useState(false);

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

    const handleRazorpayDonate = async () => {
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
                            paymentMethod: 'razorpay',
                            transactionId: response.razorpay_payment_id,
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

    const handleUpiDonate = async (e) => {
        e.preventDefault();
        if (!user) return navigate('/login');
        if (!amount || amount <= 0) return alert('Please enter a valid amount');

        setSubmittingUpi(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.post(`${import.meta.env.VITE_API_URL}/donations`, {
                ngoId: requirement.ngoId._id,
                requirementId: requirement._id,
                amount: Number(amount),
                paymentMethod: 'upi_qr',
                transactionId: utrNumber,
                message: `Donation for ${requirement.title} via UPI QR${utrNumber ? ` (Ref: ${utrNumber})` : ''}`
            }, config);

            alert('Thank you! Your donation via UPI QR has been recorded.');
            setAmount('');
            setUtrNumber('');
            // refresh data
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/requirements/${id}`);
            setRequirement(data);
        } catch (error) {
            console.error('UPI donation failed:', error);
            alert(error.response?.data?.message || 'Failed to record donation');
        } finally {
            setSubmittingUpi(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopiedUpi(true);
        setTimeout(() => setCopiedUpi(false), 2000);
    };

    const handleChat = () => {
        if (!user) return navigate('/login');
        navigate(`/chat/${requirement.ngoId._id}`, { state: { name: requirement.ngoId.ngoName } });
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-gray-400">Loading details...</div>;
    if (!requirement) return <div className="min-h-screen flex items-center justify-center font-bold text-red-400">Requirement not found</div>;

    const isFulfilled = requirement.status === 'fulfilled';
    const ngoUpiId = requirement.ngoId?.upiId;
    const upiUri = ngoUpiId ? `upi://pay?pa=${ngoUpiId}&pn=${encodeURIComponent(requirement.ngoId.ngoName)}&am=${amount || 0}&cu=INR&tn=${encodeURIComponent('Donation for ' + requirement.title)}` : '';

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
                                <div className="mb-6 flex items-center gap-3 text-gray-600 bg-amber-50 p-3 rounded-xl border border-amber-100">
                                    <Calendar size={20} className="text-amber-500" />
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-tight text-amber-600">Deadline</p>
                                        <p className="font-bold text-sm">{new Date(requirement.deadline).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            )}

                            {!isFulfilled ? (
                                <div className="space-y-5">
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

                                    {/* Payment Method Selector */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Select Payment Method</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setPaymentMethod('razorpay')}
                                                className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${paymentMethod === 'razorpay' ? 'border-primary-600 bg-primary-50 text-primary-700 shadow-sm' : 'border-gray-100 bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                                            >
                                                <CreditCard size={20} />
                                                <span>Razorpay</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setPaymentMethod('upi_qr')}
                                                className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${paymentMethod === 'upi_qr' ? 'border-emerald-600 bg-emerald-50 text-emerald-700 shadow-sm' : 'border-gray-100 bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                                            >
                                                <QrCode size={20} />
                                                <span>NGO UPI QR</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Razorpay Flow */}
                                    {paymentMethod === 'razorpay' && (
                                        <button 
                                            onClick={handleRazorpayDonate}
                                            className="w-full py-4 bg-primary-600 text-white rounded-2xl font-black text-lg shadow-lg shadow-primary-600/20 hover:bg-primary-700 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                                        >
                                            <Heart size={20} /> Donate via Razorpay
                                        </button>
                                    )}

                                    {/* Direct NGO UPI QR Flow */}
                                    {paymentMethod === 'upi_qr' && (
                                        <div className="space-y-4 pt-2">
                                            {ngoUpiId ? (
                                                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-center space-y-3">
                                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Scan with GPay / PhonePe / Paytm</p>
                                                    <div className="bg-white p-3 rounded-xl inline-block border border-gray-100 shadow-sm">
                                                        <QRCodeSVG value={upiUri} size={160} level="H" />
                                                    </div>
                                                    
                                                    <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-gray-200 text-xs">
                                                        <span className="font-mono font-bold text-gray-700 truncate mr-2">{ngoUpiId}</span>
                                                        <button 
                                                            type="button"
                                                            onClick={() => copyToClipboard(ngoUpiId)}
                                                            className="text-primary-600 hover:text-primary-700 font-bold flex items-center gap-1 shrink-0"
                                                        >
                                                            {copiedUpi ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                                                            {copiedUpi ? 'Copied' : 'Copy'}
                                                        </button>
                                                    </div>

                                                    <div className="text-left space-y-1.5 pt-2">
                                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">UTR / Ref ID (Optional)</label>
                                                        <input 
                                                            type="text" 
                                                            value={utrNumber}
                                                            onChange={(e) => setUtrNumber(e.target.value)}
                                                            placeholder="e.g. 324156789012"
                                                            className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                                                        />
                                                    </div>

                                                    <button 
                                                        onClick={handleUpiDonate}
                                                        disabled={submittingUpi}
                                                        className="w-full py-3.5 bg-emerald-600 text-white rounded-xl font-black text-sm shadow-md hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                                                    >
                                                        <CheckCircle2 size={18} /> {submittingUpi ? 'Recording...' : 'Confirm UPI Donation'}
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl p-4 text-xs font-semibold flex items-start gap-2.5">
                                                    <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                                                    <span>This NGO has not configured a UPI ID yet. Please use Razorpay to complete your donation.</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
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

import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { IndianRupee, MessageCircle, X, Heart, QrCode, CreditCard, Copy, Check, CheckCircle2, AlertCircle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const NGORequirements = () => {
    const { id } = useParams(); // ngoId
    const { user } = useContext(AuthContext);
    const [requirements, setRequirements] = useState([]);
    const [isDonating, setIsDonating] = useState(false);
    const [selectedReq, setSelectedReq] = useState(null);
    const [amount, setAmount] = useState('');
    const [message, setMessage] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('razorpay');
    const [utrNumber, setUtrNumber] = useState('');
    const [copiedUpi, setCopiedUpi] = useState(false);
    const [submittingUpi, setSubmittingUpi] = useState(false);
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
        setPaymentMethod('razorpay');
        setUtrNumber('');
    };

    const submitRazorpayDonation = async (e) => {
        e.preventDefault();
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
                description: `Donation for ${selectedReq.title}`,
                order_id: order.id,
                handler: async (response) => {
                    // 3. Payment success - record donation in db
                    try {
                        await axios.post(`${import.meta.env.VITE_API_URL}/donations`, {
                            ngoId: id,
                            requirementId: selectedReq._id,
                            amount: Number(amount),
                            paymentMethod: 'razorpay',
                            transactionId: response.razorpay_payment_id,
                            message: `${message} (Payment ID: ${response.razorpay_payment_id})`
                        }, config);

                        setIsDonating(false);
                        setAmount('');
                        setMessage('');
                        alert('Donation successful! Thank you.');
                        
                        // refresh data
                        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/requirements/ngo/${id}`, config);
                        setRequirements(data);
                    } catch (dbError) {
                        console.error('Recording donation failed:', dbError);
                        alert('Payment successful, but failed to record. Contact support.');
                    }
                },
                prefill: {
                    name: user.name,
                    email: user.email,
                },
                theme: {
                    color: "#059669" // emerald-600
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (error) {
            console.error('Donation failed:', error);
            alert('Donation initiation failed.');
        }
    };

    const submitUpiDonation = async (e) => {
        e.preventDefault();
        if (!amount || amount <= 0) return alert('Please enter a valid amount');

        setSubmittingUpi(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.post(`${import.meta.env.VITE_API_URL}/donations`, {
                ngoId: id,
                requirementId: selectedReq._id,
                amount: Number(amount),
                paymentMethod: 'upi_qr',
                transactionId: utrNumber,
                message: `${message || 'Donation via NGO UPI QR'}${utrNumber ? ` (Ref: ${utrNumber})` : ''}`
            }, config);

            setIsDonating(false);
            setAmount('');
            setMessage('');
            setUtrNumber('');
            alert('Donation via UPI QR successfully recorded! Thank you.');
            
            // refresh data
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/requirements/ngo/${id}`, config);
            setRequirements(data);
        } catch (error) {
            console.error('UPI donation recording failed:', error);
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

    const ngoUpiId = selectedReq?.ngoId?.upiId ? String(selectedReq.ngoId.upiId).trim() : '';
    const upiUri = ngoUpiId ? `upi://pay?pa=${ngoUpiId}&pn=${encodeURIComponent(ngoName)}&am=${amount || 0}&cu=INR&tn=${encodeURIComponent('Donation for ' + (selectedReq?.title || 'NGO'))}` : '';

    return (
        <div className="py-8 relative">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">{ngoName} Requirements</h1>
                    <p className="text-gray-500 font-medium">Support the causes that matter to you</p>
                </div>
                <button
                    onClick={() => navigate(`/chat/${id}`, { state: { name: ngoName } })}
                    className="flex items-center gap-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm"
                >
                    <MessageCircle size={20} /> Chat
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
                        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
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
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Select Payment Method</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod('razorpay')}
                                        className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${paymentMethod === 'razorpay' ? 'border-emerald-600 bg-emerald-50 text-emerald-700 shadow-sm' : 'border-gray-100 bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                                    >
                                        <CreditCard size={20} />
                                        <span>Razorpay</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod('upi_qr')}
                                        className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${paymentMethod === 'upi_qr' ? 'border-teal-600 bg-teal-50 text-teal-700 shadow-sm' : 'border-gray-100 bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                                    >
                                        <QrCode size={20} />
                                        <span>NGO UPI QR</span>
                                    </button>
                                </div>
                            </div>

                            {paymentMethod === 'razorpay' ? (
                                <form onSubmit={submitRazorpayDonation} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Message (Optional)</label>
                                        <textarea
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 transition-all text-gray-900 bg-gray-50 focus:bg-white resize-none h-20"
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            placeholder="Write a message to the NGO..."
                                        ></textarea>
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg rounded-xl shadow-md hover:shadow-lg transition-all border border-transparent"
                                    >
                                        Donate via Razorpay
                                    </button>
                                </form>
                            ) : (
                                <form onSubmit={submitUpiDonation} className="space-y-4">
                                    {ngoUpiId ? (
                                        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-center space-y-3">
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Scan with GPay / PhonePe / Paytm</p>
                                            <div className="bg-white p-3 rounded-xl inline-block border border-gray-100 shadow-sm">
                                                <QRCodeSVG value={upiUri} size={150} level="H" />
                                            </div>

                                            <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-gray-200 text-xs">
                                                <span className="font-mono font-bold text-gray-700 truncate mr-2">{ngoUpiId}</span>
                                                <button 
                                                    type="button"
                                                    onClick={() => copyToClipboard(ngoUpiId)}
                                                    className="text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1 shrink-0"
                                                >
                                                    {copiedUpi ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                                                    {copiedUpi ? 'Copied' : 'Copy'}
                                                </button>
                                            </div>

                                            <div className="text-left space-y-1.5 pt-1">
                                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">UTR / Ref ID (Optional)</label>
                                                <input 
                                                    type="text" 
                                                    value={utrNumber}
                                                    onChange={(e) => setUtrNumber(e.target.value)}
                                                    placeholder="e.g. 324156789012"
                                                    className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-left text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Message (Optional)</label>
                                                <textarea
                                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 resize-none h-16 outline-none focus:ring-2 focus:ring-emerald-500"
                                                    value={message}
                                                    onChange={(e) => setMessage(e.target.value)}
                                                    placeholder="Write a message to the NGO..."
                                                ></textarea>
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={submittingUpi}
                                                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-xl shadow-md hover:shadow-lg transition-all border border-transparent flex items-center justify-center gap-2"
                                            >
                                                <CheckCircle2 size={18} /> {submittingUpi ? 'Recording...' : 'Confirm UPI Donation'}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl p-4 text-xs font-semibold flex items-start gap-2.5">
                                            <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                                            <span>This NGO has not configured a UPI ID yet. Please select Razorpay to complete your donation.</span>
                                        </div>
                                    )}
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NGORequirements;

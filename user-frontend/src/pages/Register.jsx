import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CheckCircle, UserPlus, XCircle } from 'lucide-react';

const sectorOptions = ['Education', 'Healthcare', 'Environment', 'Women Empowerment'];
const ngoTypeOptions = ['Section 8 Company', 'Trust', 'Society'];

const getLocationDataUrl = () => {
    const apiUrl = import.meta.env.VITE_API_URL || '';
    const backendOrigin = apiUrl.replace(/\/api\/?$/, '');
    return `${backendOrigin}/data/indiaStatesDistricts.json`;
};

const Register = () => {
    const [role, setRole] = useState('volunteer');
    const [formData, setFormData] = useState({
        name: '', ngoName: '', email: '', aadhar: '', phone: '', password: '',
        address: '', darpanId: '', state: '', district: '',
        sector: 'Education', ngoType: 'Section 8 Company'
    });
    const [stateDistrictOptions, setStateDistrictOptions] = useState({});
    const [error, setError] = useState('');
    const [verificationStatus, setVerificationStatus] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const { register, user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (user && !verificationStatus) {
            navigate(user.role === 'volunteer' ? '/volunteer/dashboard' : '/ngo/dashboard');
        }
    }, [user, navigate, verificationStatus]);

    useEffect(() => {
        fetch(getLocationDataUrl())
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Unable to load state and district options');
                }
                return response.json();
            })
            .then((locations) => setStateDistrictOptions(locations))
            .catch(() => setError('Unable to load state and district options. Please refresh and try again.'));
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        if (name === 'phone' || name === 'aadhar') {
            const numericValue = value.replace(/\D/g, '');
            if (name === 'phone' && numericValue.length > 10) return;
            if (name === 'aadhar' && numericValue.length > 12) return;
            setFormData({ ...formData, [name]: numericValue });
        } else if (name === 'state') {
            setFormData({
                ...formData,
                state: value,
                district: ''
            });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setVerificationStatus(null);
        setIsLoading(true);

        const dataToSend = role === 'volunteer'
            ? { name: formData.name, email: formData.email, aadhar: formData.aadhar, phone: formData.phone, password: formData.password }
            : {
                email: formData.email,
                password: formData.password,
                phone: formData.phone,
                address: formData.address,
                ngoName: formData.ngoName,
                darpanId: formData.darpanId,
                state: formData.state,
                district: formData.district,
                sector: formData.sector,
                ngoType: formData.ngoType
            };

        const res = await register(role, dataToSend);
        setIsLoading(false);
        if (res.success) {
            if (role === 'ngo') {
                setVerificationStatus({
                    verified: res.data.verified,
                    message: res.data.verificationMessage || (res.data.verified ? 'NGO Verified Successfully' : 'Verification Failed')
                });
                setTimeout(() => navigate('/ngo/dashboard'), 1400);
            } else {
                navigate('/volunteer/dashboard');
            }
        } else {
            setError(res.message);
        }
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
            <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden transform transition-all">
                <div className="p-8 md:p-10">
                    <div className="flex items-center justify-center mb-6">
                        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm">
                            <UserPlus size={32} />
                        </div>
                    </div>
                    <h2 className="text-3xl font-black text-center text-gray-900 tracking-tight mb-2">Create an Account</h2>
                    <p className="text-center text-gray-500 mb-8 font-medium">Join us to make a difference</p>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded shadow-sm text-sm font-medium">
                            {error}
                        </div>
                    )}

                    {verificationStatus && (
                        <div className={`mb-6 p-4 border-l-4 rounded shadow-sm text-sm font-bold flex items-center gap-2 ${verificationStatus.verified ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-amber-50 border-amber-500 text-amber-700'}`}>
                            {verificationStatus.verified ? <CheckCircle size={18} /> : <XCircle size={18} />}
                            {verificationStatus.message}
                        </div>
                    )}

                    <div className="flex bg-gray-100 p-1.5 rounded-xl mb-8 shadow-inner">
                        <button
                            type="button"
                            className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition-all ${role === 'volunteer' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setRole('volunteer')}
                        >
                            Volunteer
                        </button>
                        <button
                            type="button"
                            className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition-all ${role === 'ngo' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setRole('ngo')}
                        >
                            NGO
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {role === 'volunteer' && (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Full Name</label>
                                        <input type="text" name="name" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 transition-all bg-gray-50 focus:bg-white text-gray-800 font-medium" onChange={handleChange} value={formData.name} required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Phone Number</label>
                                        <input type="text" name="phone" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 transition-all bg-gray-50 focus:bg-white text-gray-800 font-medium" onChange={handleChange} value={formData.phone} required />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Aadhar Number</label>
                                    <input type="text" name="aadhar" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 transition-all bg-gray-50 focus:bg-white text-gray-800 font-medium" onChange={handleChange} value={formData.aadhar} required />
                                </div>
                            </>
                        )}

                        {role === 'ngo' && (
                            <>
                                <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-5 space-y-5">
                                    <h3 className="text-lg font-black text-gray-900">Login & Contact Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Email Address</label>
                                            <input type="email" name="email" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 transition-all bg-white text-gray-800 font-medium" onChange={handleChange} value={formData.email} required placeholder="you@example.com" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Password</label>
                                            <input type="password" name="password" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 transition-all bg-white text-gray-800 font-medium" onChange={handleChange} value={formData.password} required placeholder="Password" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Phone Number</label>
                                            <input type="text" name="phone" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 transition-all bg-white text-gray-800 font-medium" onChange={handleChange} value={formData.phone} required />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Full Address</label>
                                            <input type="text" name="address" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 transition-all bg-white text-gray-800 font-medium" onChange={handleChange} value={formData.address} required />
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-gray-100 bg-blue-50/40 p-5 space-y-5">
                                    <h3 className="text-lg font-black text-gray-900">NGO Verification Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-bold text-gray-700 mb-1.5">NGO Name</label>
                                            <input type="text" name="ngoName" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 transition-all bg-white text-gray-800 font-medium" onChange={handleChange} value={formData.ngoName} required />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1.5">NGO Darpan ID</label>
                                            <input type="text" name="darpanId" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 transition-all bg-white text-gray-800 font-medium" onChange={handleChange} value={formData.darpanId} required />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Sector</label>
                                            <select name="sector" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 transition-all bg-white text-gray-800 font-medium" onChange={handleChange} value={formData.sector} required>
                                                {sectorOptions.map(sector => <option key={sector} value={sector}>{sector}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1.5">State</label>
                                            <select name="state" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 transition-all bg-white text-gray-800 font-medium" onChange={handleChange} value={formData.state} required>
                                                <option value="">Select State</option>
                                                {Object.keys(stateDistrictOptions).map(state => <option key={state} value={state}>{state}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1.5">District</label>
                                            <select name="district" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 transition-all bg-white text-gray-800 font-medium disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed" onChange={handleChange} value={formData.district} required disabled={!formData.state}>
                                                <option value="">{formData.state ? 'Select District' : 'Select state first'}</option>
                                                {(stateDistrictOptions[formData.state] || []).map(district => <option key={district} value={district}>{district}</option>)}
                                            </select>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-bold text-gray-700 mb-1.5">NGO Type</label>
                                            <select name="ngoType" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 transition-all bg-white text-gray-800 font-medium" onChange={handleChange} value={formData.ngoType} required>
                                                {ngoTypeOptions.map(type => <option key={type} value={type}>{type}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {role === 'volunteer' && (
                            <>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Email Address</label>
                                    <input type="email" name="email" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 transition-all bg-gray-50 focus:bg-white text-gray-800 font-medium" onChange={handleChange} value={formData.email} required placeholder="you@example.com" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Password</label>
                                    <input type="password" name="password" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 transition-all bg-gray-50 focus:bg-white text-gray-800 font-medium" onChange={handleChange} value={formData.password} required placeholder="Password" />
                                </div>
                            </>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-4 px-4 rounded-xl text-white font-bold text-lg shadow-md transition-all mt-6 ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg hover:-translate-y-0.5 active:scale-95'}`}
                        >
                            {isLoading ? 'Registering...' : `Register as ${role === 'volunteer' ? 'Volunteer' : 'NGO'}`}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-sm font-medium text-gray-600">
                        Already have an account? <Link to="/login" className="text-blue-600 hover:text-blue-800 font-bold ml-1">Sign in here</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;

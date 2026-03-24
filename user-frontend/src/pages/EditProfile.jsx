import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Phone, MapPin, Hash, Lock, Save, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EditProfile = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    
    const [formData, setFormData] = useState({
        name: '',
        ngoName: '',
        email: '',
        phone: '',
        address: '',
        registrationNumber: '',
        panNumber: '',
        aadhar: '',
        password: '',
        confirmPassword: ''
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const config = {
                    headers: { Authorization: `Bearer ${user.token}` }
                };
                const endpoint = user.role === 'volunteer' ? '/volunteer/profile' : '/ngo/profile';
                const { data } = await axios.get(`${import.meta.env.VITE_API_URL}${endpoint}`, config);
                
                setFormData({
                    ...formData,
                    ...data,
                    password: '',
                    confirmPassword: ''
                });
                setLoading(false);
            } catch (error) {
                console.error('Error fetching profile:', error);
                setMessage({ type: 'error', text: 'Failed to load profile data' });
                setLoading(false);
            }
        };

        if (user) fetchProfile();
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'phone') {
            const numericValue = value.replace(/\D/g, '');
            if (numericValue.length > 10) return;
            setFormData({ ...formData, [name]: numericValue });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password && formData.password !== formData.confirmPassword) {
            return setMessage({ type: 'error', text: 'Passwords do not match' });
        }

        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` }
            };
            const endpoint = user.role === 'volunteer' ? '/volunteer/profile' : '/ngo/profile';
            
            const payload = { ...formData };
            if (!payload.password) delete payload.password;
            delete payload.confirmPassword;

            await axios.put(`${import.meta.env.VITE_API_URL}${endpoint}`, payload, config);
            
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            // Optionally refresh user context if names changed
            setTimeout(() => {
                navigate(-1);
            }, 2000);
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Update failed' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-64 text-gray-500">Loading profile...</div>;

    return (
        <div className="max-w-2xl mx-auto py-8 px-4">
            <button 
                onClick={() => navigate(-1)}
                className="mb-6 flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors font-medium"
            >
                <ArrowLeft size={18} /> Back
            </button>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-primary-600 to-secondary-600 px-8 py-6">
                    <h1 className="text-2xl font-bold text-white">Edit Profile</h1>
                    <p className="text-primary-100 text-sm opacity-90">Keep your information up to date</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {message.text && (
                        <div className={`p-4 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                            {message.text}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Common Fields */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700 ml-1">
                                {user.role === 'volunteer' ? 'Full Name' : 'NGO Name'}
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    name={user.role === 'volunteer' ? 'name' : 'ngoName'}
                                    value={user.role === 'volunteer' ? formData.name : formData.ngoName}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700 ml-1">Email Address</label>
                            <div className="relative opacity-50">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                                    disabled
                                />
                            </div>
                            <span className="text-[10px] text-gray-400 ml-1">Email cannot be changed</span>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700 ml-1">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none transition-all"
                                    required
                                />
                            </div>
                        </div>

                        {user.role === 'volunteer' ? (
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700 ml-1">Aadhar Number</label>
                                <div className="relative opacity-50">
                                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        name="aadhar"
                                        value={formData.aadhar}
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                                        disabled
                                    />
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-gray-700 ml-1">Registration No.</label>
                                    <div className="relative opacity-50">
                                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="text"
                                            value={formData.registrationNumber}
                                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                                            disabled
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5 md:col-span-2">
                                    <label className="text-sm font-semibold text-gray-700 ml-1">Address</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                                        <textarea
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none transition-all min-h-[100px]"
                                            required
                                        />
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Change Password</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700 ml-1">New Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="password"
                                        name="password"
                                        placeholder="Leave blank to keep current"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700 ml-1">Confirm New Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full bg-primary-600 text-white font-bold py-3.5 rounded-xl hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all flex items-center justify-center gap-2 group disabled:opacity-70"
                    >
                        {saving ? 'Saving...' : (
                            <>
                                <Save size={20} />
                                Save Profile Changes
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EditProfile;

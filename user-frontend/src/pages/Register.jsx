import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { UserPlus } from 'lucide-react';

const Register = () => {
    const [role, setRole] = useState('volunteer');
    const [formData, setFormData] = useState({
        name: '', ngoName: '', email: '', aadhar: '', phone: '', password: '',
        registrationNumber: '', panNumber: '', address: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { register, user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate(user.role === 'volunteer' ? '/volunteer/dashboard' : '/ngo/dashboard');
        }
    }, [user, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const dataToSend = role === 'volunteer'
            ? { name: formData.name, email: formData.email, aadhar: formData.aadhar, phone: formData.phone, password: formData.password }
            : { ngoName: formData.ngoName, email: formData.email, registrationNumber: formData.registrationNumber, panNumber: formData.panNumber, address: formData.address, phone: formData.phone, password: formData.password };

        const res = await register(role, dataToSend);
        setIsLoading(false);
        if (res.success) {
            navigate(role === 'volunteer' ? '/volunteer/dashboard' : '/ngo/dashboard');
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
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">NGO Name</label>
                                    <input type="text" name="ngoName" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 transition-all bg-gray-50 focus:bg-white text-gray-800 font-medium" onChange={handleChange} value={formData.ngoName} required />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Registration Number</label>
                                        <input type="text" name="registrationNumber" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 transition-all bg-gray-50 focus:bg-white text-gray-800 font-medium" onChange={handleChange} value={formData.registrationNumber} required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5">PAN Number</label>
                                        <input type="text" name="panNumber" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 transition-all bg-gray-50 focus:bg-white text-gray-800 font-medium" onChange={handleChange} value={formData.panNumber} required />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Phone Number</label>
                                        <input type="text" name="phone" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 transition-all bg-gray-50 focus:bg-white text-gray-800 font-medium" onChange={handleChange} value={formData.phone} required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Full Address</label>
                                        <input type="text" name="address" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 transition-all bg-gray-50 focus:bg-white text-gray-800 font-medium" onChange={handleChange} value={formData.address} required />
                                    </div>
                                </div>
                            </>
                        )}

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Email Address</label>
                            <input type="email" name="email" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 transition-all bg-gray-50 focus:bg-white text-gray-800 font-medium" onChange={handleChange} value={formData.email} required placeholder="you@example.com" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Password</label>
                            <input type="password" name="password" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 transition-all bg-gray-50 focus:bg-white text-gray-800 font-medium" onChange={handleChange} value={formData.password} required placeholder="••••••••" />
                        </div>

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

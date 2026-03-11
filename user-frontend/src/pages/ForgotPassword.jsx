import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { Mail, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const role = queryParams.get('role') || 'volunteer';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setIsLoading(true);

        try {
            const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const endpoint = role === 'volunteer' ? '/volunteer/forgot-password' : '/ngo/forgot-password';

            const res = await axios.post(`${apiBaseUrl}${endpoint}`, { email });
            setMessage('A password reset link has been sent to your email. (Simulated)');

            // For development purposes, if the backend returns the token, we could log it or show it
            if (res.data.resetToken) {
                console.log('Reset Token:', res.data.resetToken);
                setMessage(`Reset link: http://localhost:5173/reset-password/${res.data.resetToken}?role=${role}`);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden transform transition-all">
                <div className="p-8 pb-10">
                    <div className="flex items-center justify-center mb-6">
                        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm">
                            <Mail size={32} />
                        </div>
                    </div>
                    <h2 className="text-3xl font-black text-center text-gray-900 tracking-tight mb-2">Forgot Password</h2>
                    <p className="text-center text-gray-500 mb-8 font-medium">Enter your email to reset your password</p>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded shadow-sm text-sm font-medium">
                            {error}
                        </div>
                    )}

                    {message && (
                        <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded shadow-sm text-sm font-medium break-all">
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Email Address ({role.toUpperCase()})</label>
                            <input
                                type="email"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium text-gray-800 bg-gray-50 focus:bg-white placeholder-gray-400"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-4 px-4 rounded-xl text-white font-bold text-lg shadow-md transition-all mt-4 ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg hover:-translate-y-0.5 active:scale-95'}`}
                        >
                            {isLoading ? 'Sending...' : 'Send Reset Link'}
                        </button>
                    </form>

                    <Link to="/login" className="mt-8 flex items-center justify-center text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors">
                        <ArrowLeft size={16} className="mr-2" />
                        Back to Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;

import React, { useState } from 'react';
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { Lock, ArrowLeft, CheckCircle } from 'lucide-react';

const ResetPassword = () => {
    const { resetToken } = useParams();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const role = queryParams.get('role') || 'volunteer';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            return setError('Passwords do not match');
        }

        setIsLoading(true);

        try {
            const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const endpoint = role === 'volunteer' ? `/volunteer/reset-password/${resetToken}` : `/ngo/reset-password/${resetToken}`;

            await axios.put(`${apiBaseUrl}${endpoint}`, { password });
            setIsSuccess(true);
            setMessage('Password has been reset successfully. You can now log in.');

            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid or expired token. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden transform transition-all">
                <div className="p-8 pb-10">
                    <div className="flex items-center justify-center mb-6">
                        <div className={`w-16 h-16 ${isSuccess ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'} rounded-2xl flex items-center justify-center shadow-sm`}>
                            {isSuccess ? <CheckCircle size={32} /> : <Lock size={32} />}
                        </div>
                    </div>
                    <h2 className="text-3xl font-black text-center text-gray-900 tracking-tight mb-2">
                        {isSuccess ? 'Success!' : 'Set New Password'}
                    </h2>
                    <p className="text-center text-gray-500 mb-8 font-medium">
                        {isSuccess ? 'Your password has been updated' : 'Enter your new password below'}
                    </p>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded shadow-sm text-sm font-medium">
                            {error}
                        </div>
                    )}

                    {message && (
                        <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded shadow-sm text-sm font-medium">
                            {message}
                        </div>
                    )}

                    {!isSuccess && (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">New Password</label>
                                <input
                                    type="password"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium text-gray-800 bg-gray-50 focus:bg-white placeholder-gray-400"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Confirm Password</label>
                                <input
                                    type="password"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium text-gray-800 bg-gray-50 focus:bg-white placeholder-gray-400"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full py-4 px-4 rounded-xl text-white font-bold text-lg shadow-md transition-all mt-4 ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg hover:-translate-y-0.5 active:scale-95'}`}
                            >
                                {isLoading ? 'Updating...' : 'Reset Password'}
                            </button>
                        </form>
                    )}

                    <Link to="/login" className="mt-8 flex items-center justify-center text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors">
                        <ArrowLeft size={16} className="mr-2" />
                        Back to Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;

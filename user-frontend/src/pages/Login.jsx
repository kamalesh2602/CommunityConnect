import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogIn } from 'lucide-react';

const Login = () => {
    const [role, setRole] = useState('volunteer');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login, user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate(user.role === 'volunteer' ? '/volunteer/dashboard' : '/ngo/dashboard');
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        const res = await login(role, { email, password });
        setIsLoading(false);
        if (res.success) {
            navigate(role === 'volunteer' ? '/volunteer/dashboard' : '/ngo/dashboard');
        } else {
            setError(res.message);
        }
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden transform transition-all">
                <div className="p-8 pb-10">
                    <div className="flex items-center justify-center mb-6">
                        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm">
                            <LogIn size={32} />
                        </div>
                    </div>
                    <h2 className="text-3xl font-black text-center text-gray-900 tracking-tight mb-2">Welcome Back</h2>
                    <p className="text-center text-gray-500 mb-8 font-medium">Sign in to your account</p>

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
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Email Address</label>
                            <input
                                type="email"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium text-gray-800 bg-gray-50 focus:bg-white placeholder-gray-400"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Password</label>
                            <input
                                type="password"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium text-gray-800 bg-gray-50 focus:bg-white placeholder-gray-400"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                            <div className="flex justify-end mt-1">
                                <Link to={`/forgot-password?role=${role}`} className="text-xs font-bold text-blue-600 hover:text-blue-800">
                                    Forgot password?
                                </Link>
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-4 px-4 rounded-xl text-white font-bold text-lg shadow-md transition-all mt-4 ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg hover:-translate-y-0.5 active:scale-95'}`}
                        >
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-sm font-medium text-gray-600">
                        Don't have an account? <Link to="/register" className="text-blue-600 hover:text-blue-800 font-bold ml-1">Register here</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;

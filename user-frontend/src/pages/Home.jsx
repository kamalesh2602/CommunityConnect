import React from 'react';
import { Link } from 'react-router-dom';
import { HeartHandshake } from 'lucide-react';

const Home = () => {
    return (
        <div className="flex-1 flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="mb-8 p-6 bg-blue-100 rounded-full inline-block shadow-sm">
                <HeartHandshake size={80} className="text-blue-600" />
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tight mb-6">
                Connect. <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Empower.</span> Change.
            </h1>
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
                Join CommunityConnect today and bridge the gap between passionate volunteers and impactful NGOs. Together, we can make a difference.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register" className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all text-lg border border-transparent">
                    Join as Volunteer or NGO
                </Link>
                <Link to="/login" className="px-8 py-4 bg-white text-blue-600 border border-blue-100 font-bold rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-all text-lg shadow-sm hover:shadow-md">
                    Sign In to Account
                </Link>
            </div>

            <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4 w-full">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-left hover:shadow-md transition-shadow">
                    <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 font-black text-2xl shadow-sm">1</div>
                    <h3 className="text-xl font-bold mb-3 text-gray-900">Register Profile</h3>
                    <p className="text-gray-600 font-medium leading-relaxed">Create your account as a dedicated volunteer or a registered NGO looking for support.</p>
                </div>
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-left hover:shadow-md transition-shadow">
                    <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 font-black text-2xl shadow-sm">2</div>
                    <h3 className="text-xl font-bold mb-3 text-gray-900">Connect & Collaborate</h3>
                    <p className="text-gray-600 font-medium leading-relaxed">Follow NGOs, chat with organizers, and stay updated on urgent requirements.</p>
                </div>
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-left hover:shadow-md transition-shadow">
                    <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 font-black text-2xl shadow-sm">3</div>
                    <h3 className="text-xl font-bold mb-3 text-gray-900">Make an Impact</h3>
                    <p className="text-gray-600 font-medium leading-relaxed">Fund verified requirements and see exactly how your contribution changes lives.</p>
                </div>
            </div>
        </div>
    );
};

export default Home;

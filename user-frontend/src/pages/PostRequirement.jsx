import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { PlusCircle, FileText, IndianRupee } from 'lucide-react';

const PostRequirement = () => {
    const { user } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        amountNeeded: '',
        deadline: ''
    });
    const [requirements, setRequirements] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchMyRequirements = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/requirements/ngo/${user._id}`, config);
            setRequirements(data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (user) fetchMyRequirements();
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.post(`${import.meta.env.VITE_API_URL}/requirements`, formData, config);
            setFormData({ title: '', description: '', amountNeeded: '', deadline: '' });
            fetchMyRequirements();
            alert('Requirement posted successfully!');
        } catch (error) {
            console.error(error);
            alert('Failed to post requirement');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="py-8 grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-1">
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8 sticky top-24">
                    <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                        <PlusCircle className="text-blue-600" /> Post Requirement
                    </h2>

                    {!user.verified && (
                        <div className="mb-6 p-4 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-sm font-medium">
                            Note: Your account is pending verification. Posted requirements will not be visible to volunteers yet.
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Campaign Title</label>
                            <input
                                type="text"
                                name="title"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-all font-medium text-gray-800"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="E.g., Winter Clothes Distribution"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Description</label>
                            <textarea
                                name="description"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-all resize-none h-32 font-medium text-gray-800"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Describe why you need these funds..."
                                required
                            ></textarea>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Amount (₹)</label>
                                <input
                                    type="number"
                                    name="amountNeeded"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-all font-bold text-gray-800"
                                    value={formData.amountNeeded}
                                    onChange={handleChange}
                                    placeholder="50000"
                                    min="1"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Deadline</label>
                                <input
                                    type="date"
                                    name="deadline"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-all font-bold text-gray-800"
                                    value={formData.deadline}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full py-4 mt-2 rounded-xl text-white font-black text-lg shadow-md transition-all ${isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5'}`}
                        >
                            {isSubmitting ? 'Posting...' : 'Create Campaign'}
                        </button>
                    </form>
                </div>
            </div>

            <div className="xl:col-span-2 space-y-6">
                <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3 px-2">
                    <FileText className="text-purple-600" /> Active Campaigns ({requirements.length})
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {requirements.map((req) => (
                        <div key={req._id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col h-full">
                            <div className="flex-1 mb-4">
                                <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">{req.title}</h3>
                                <p className="text-sm text-gray-600 line-clamp-3 mb-4 leading-relaxed">{req.description}</p>
                            </div>
                            <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                                <div className="text-emerald-600 font-black flex items-center gap-1 text-lg">
                                    <IndianRupee size={18} /> {req.amountNeeded}
                                </div>
                                <div className="text-gray-500 text-sm font-bold bg-gray-100 px-3 py-1.5 rounded-lg">
                                    Due: {new Date(req.deadline).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    ))}
                    {requirements.length === 0 && (
                        <div className="col-span-full p-12 bg-white rounded-3xl border border-dashed border-gray-300 text-center text-gray-500">
                            <p className="text-lg font-medium">You haven't posted any requirements yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PostRequirement;

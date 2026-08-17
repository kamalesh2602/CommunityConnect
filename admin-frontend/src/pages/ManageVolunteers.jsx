import React, { useEffect, useState, useContext, useMemo } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Trash2, Search, Users, RefreshCw } from 'lucide-react';

const ManageVolunteers = () => {
    const [volunteers, setVolunteers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { admin } = useContext(AuthContext);

    const fetchVolunteers = async () => {
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${admin.token}` } };
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/admin/volunteers`, config);
            setVolunteers(data);
        } catch (error) {
            console.error('Error fetching volunteers:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (admin) fetchVolunteers();
    }, [admin]);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this volunteer?')) {
            try {
                const config = { headers: { Authorization: `Bearer ${admin.token}` } };
                await axios.delete(`${import.meta.env.VITE_API_URL}/admin/volunteers/${id}`, config);
                fetchVolunteers();
            } catch (error) {
                console.error('Error deleting volunteer:', error);
            }
        }
    };

    const filteredVolunteers = useMemo(() => {
        if (!searchTerm.trim()) return volunteers;
        const query = searchTerm.toLowerCase();
        return volunteers.filter(vol => 
            vol.name?.toLowerCase().includes(query) ||
            vol.email?.toLowerCase().includes(query) ||
            vol.phone?.toLowerCase().includes(query) ||
            vol.aadhar?.toLowerCase().includes(query)
        );
    }, [volunteers, searchTerm]);

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Manage Volunteers</h1>
                    <p className="text-gray-500 font-medium text-sm mt-1">
                        View and manage registered volunteer accounts
                    </p>
                </div>
                <button
                    onClick={fetchVolunteers}
                    className="self-start md:self-auto flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold rounded-xl text-sm transition-all shadow-sm"
                >
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
                </button>
            </div>

            {/* Filter Bar Controls */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                {/* Search Bar */}
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name, email, phone, or Aadhar..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none transition-all"
                    />
                </div>

                {searchTerm && (
                    <button
                        onClick={() => setSearchTerm('')}
                        className="text-xs font-bold text-gray-500 hover:text-red-600 px-3 py-2 border border-gray-200 rounded-xl hover:bg-red-50 transition-colors"
                    >
                        Clear Search
                    </button>
                )}
            </div>

            {/* Results Counter */}
            <div className="flex justify-between items-center px-1">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Showing {filteredVolunteers.length} of {volunteers.length} Volunteers
                </span>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/70 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wide">
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4">Phone</th>
                                <th className="px-6 py-4">Aadhar</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredVolunteers.map(vol => (
                                <tr key={vol._id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 font-semibold text-gray-800">{vol.name}</td>
                                    <td className="px-6 py-4 text-gray-600 text-sm">{vol.email}</td>
                                    <td className="px-6 py-4 text-gray-600 text-sm">{vol.phone}</td>
                                    <td className="px-6 py-4 text-gray-600 font-mono text-xs">{vol.aadhar}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleDelete(vol._id)}
                                            className="p-2 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-xl transition-all border border-transparent hover:border-red-100"
                                            title="Delete Volunteer"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredVolunteers.length === 0 && !loading && (
                                <tr>
                                    <td colSpan="5" className="p-12 text-center text-gray-500">
                                        <Users size={40} className="mx-auto text-gray-300 mb-3" />
                                        <p className="font-bold text-base text-gray-700">No volunteers match your search</p>
                                        <p className="text-xs text-gray-400 mt-1">Try searching with a different name, email, or number.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ManageVolunteers;


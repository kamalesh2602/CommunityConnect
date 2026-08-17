import React, { useEffect, useState, useContext, useMemo } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Trash2, CheckCircle, XCircle, Search, Filter, Building2, SlidersHorizontal, RefreshCw } from 'lucide-react';

const ManageNGOs = () => {
    const [ngos, setNgos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'verified' | 'pending'
    const [sectorFilter, setSectorFilter] = useState('all');
    const { admin } = useContext(AuthContext);

    const fetchNGOs = async () => {
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${admin.token}` } };
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/admin/ngos`, config);
            setNgos(data);
        } catch (error) {
            console.error('Error fetching NGOs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (admin) fetchNGOs();
    }, [admin]);

    const handleVerifyToggle = async (id) => {
        try {
            const config = { headers: { Authorization: `Bearer ${admin.token}` } };
            await axios.put(`${import.meta.env.VITE_API_URL}/admin/ngos/${id}/verify`, {}, config);
            fetchNGOs();
        } catch (error) {
            console.error('Error toggling verification:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this NGO?')) {
            try {
                const config = { headers: { Authorization: `Bearer ${admin.token}` } };
                await axios.delete(`${import.meta.env.VITE_API_URL}/admin/ngos/${id}`, config);
                fetchNGOs();
            } catch (error) {
                console.error('Error deleting NGO:', error);
            }
        }
    };

    // Derived Statistics
    const counts = useMemo(() => {
        const total = ngos.length;
        const verified = ngos.filter(n => n.verified).length;
        const pending = ngos.filter(n => !n.verified).length;
        return { total, verified, pending };
    }, [ngos]);

    // Unique Sectors for Filter Dropdown
    const availableSectors = useMemo(() => {
        const sectors = new Set(ngos.map(n => n.sector).filter(Boolean));
        return Array.from(sectors);
    }, [ngos]);

    // Filtered NGOs
    const filteredNgos = useMemo(() => {
        return ngos.filter(ngo => {
            // Status Filter
            if (statusFilter === 'verified' && !ngo.verified) return false;
            if (statusFilter === 'pending' && ngo.verified) return false;

            // Sector Filter
            if (sectorFilter !== 'all' && ngo.sector !== sectorFilter) return false;

            // Search Query Filter
            if (searchTerm.trim() !== '') {
                const query = searchTerm.toLowerCase();
                const nameMatch = ngo.ngoName?.toLowerCase().includes(query);
                const emailMatch = ngo.email?.toLowerCase().includes(query);
                const darpanMatch = ngo.darpanId?.toLowerCase().includes(query);
                const upiMatch = ngo.upiId?.toLowerCase().includes(query);
                const sectorMatch = ngo.sector?.toLowerCase().includes(query);
                const locationMatch = `${ngo.district || ''} ${ngo.state || ''}`.toLowerCase().includes(query);
                return nameMatch || emailMatch || darpanMatch || upiMatch || sectorMatch || locationMatch;
            }

            return true;
        });
    }, [ngos, statusFilter, sectorFilter, searchTerm]);

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Manage NGOs</h1>
                    <p className="text-gray-500 font-medium text-sm mt-1">
                        Verify, filter, and manage registered NGO organizations
                    </p>
                </div>
                <button
                    onClick={fetchNGOs}
                    className="self-start md:self-auto flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold rounded-xl text-sm transition-all shadow-sm"
                >
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
                </button>
            </div>

            {/* Quick Status Filter Tabs & Counters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                    onClick={() => setStatusFilter('all')}
                    className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${statusFilter === 'all' ? 'bg-primary-50/70 border-primary-500 shadow-sm ring-1 ring-primary-500' : 'bg-white border-gray-100 hover:border-gray-200'}`}
                >
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">All NGOs</p>
                        <h3 className="text-2xl font-black text-gray-900 mt-1">{counts.total}</h3>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                        <Building2 size={20} />
                    </div>
                </button>

                <button
                    onClick={() => setStatusFilter('verified')}
                    className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${statusFilter === 'verified' ? 'bg-emerald-50/70 border-emerald-500 shadow-sm ring-1 ring-emerald-500' : 'bg-white border-gray-100 hover:border-gray-200'}`}
                >
                    <div>
                        <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Verified NGOs</p>
                        <h3 className="text-2xl font-black text-emerald-700 mt-1">{counts.verified}</h3>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                        <CheckCircle size={20} />
                    </div>
                </button>

                <button
                    onClick={() => setStatusFilter('pending')}
                    className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${statusFilter === 'pending' ? 'bg-amber-50/70 border-amber-500 shadow-sm ring-1 ring-amber-500' : 'bg-white border-gray-100 hover:border-gray-200'}`}
                >
                    <div>
                        <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Pending Verification</p>
                        <h3 className="text-2xl font-black text-amber-700 mt-1">{counts.pending}</h3>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                        <XCircle size={20} />
                    </div>
                </button>
            </div>

            {/* Filter Bar Controls */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                {/* Search Bar */}
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name, email, ID, UPI..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none transition-all"
                    />
                </div>

                {/* Dropdown Filters */}
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    {/* Status Select */}
                    <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 border border-gray-200 rounded-xl">
                        <Filter size={16} className="text-gray-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-transparent text-sm font-bold text-gray-700 outline-none cursor-pointer"
                        >
                            <option value="all">Status: All</option>
                            <option value="verified">Verified Only</option>
                            <option value="pending">Pending Only</option>
                        </select>
                    </div>

                    {/* Sector Select */}
                    <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 border border-gray-200 rounded-xl">
                        <SlidersHorizontal size={16} className="text-gray-400" />
                        <select
                            value={sectorFilter}
                            onChange={(e) => setSectorFilter(e.target.value)}
                            className="bg-transparent text-sm font-bold text-gray-700 outline-none cursor-pointer"
                        >
                            <option value="all">Sector: All</option>
                            {availableSectors.map(sec => (
                                <option key={sec} value={sec}>{sec}</option>
                            ))}
                        </select>
                    </div>

                    {(searchTerm || statusFilter !== 'all' || sectorFilter !== 'all') && (
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setStatusFilter('all');
                                setSectorFilter('all');
                            }}
                            className="text-xs font-bold text-gray-500 hover:text-red-600 px-3 py-2 border border-gray-200 rounded-xl hover:bg-red-50 transition-colors"
                        >
                            Clear Filters
                        </button>
                    )}
                </div>
            </div>

            {/* Results Counter */}
            <div className="flex justify-between items-center px-1">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Showing {filteredNgos.length} of {ngos.length} Organizations
                </span>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/70 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wide">
                                <th className="px-6 py-4">NGO Name</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4">Darpan ID</th>
                                <th className="px-6 py-4">UPI ID</th>
                                <th className="px-6 py-4">Sector</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredNgos.map(ngo => (
                                <tr key={ngo._id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 font-semibold text-gray-800">
                                        {ngo.ngoName}
                                        {ngo.district && <p className="text-[11px] text-gray-400 font-normal">{ngo.district}, {ngo.state}</p>}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 text-sm">{ngo.email}</td>
                                    <td className="px-6 py-4 text-gray-600 font-mono text-xs">{ngo.darpanId}</td>
                                    <td className="px-6 py-4 text-gray-600 font-mono text-xs">{ngo.upiId || <span className="text-gray-300 italic">Not set</span>}</td>
                                    <td className="px-6 py-4 text-gray-600 text-sm">
                                        <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md text-xs font-medium">
                                            {ngo.sector || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${ngo.verified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                            {ngo.verified ? <CheckCircle size={14} /> : <XCircle size={14} />}
                                            {ngo.verified ? 'Verified' : 'Pending'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => handleVerifyToggle(ngo._id)}
                                            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all shadow-sm ${ngo.verified ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'}`}
                                        >
                                            {ngo.verified ? 'Revoke Verification' : 'Verify NGO'}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(ngo._id)}
                                            className="p-1.5 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-xl transition-all border border-transparent hover:border-red-100"
                                            title="Delete NGO"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredNgos.length === 0 && !loading && (
                                <tr>
                                    <td colSpan="7" className="p-12 text-center text-gray-500">
                                        <Building2 size={40} className="mx-auto text-gray-300 mb-3" />
                                        <p className="font-bold text-base text-gray-700">No organizations match your filters</p>
                                        <p className="text-xs text-gray-400 mt-1">Try adjusting your search query or reset filter options.</p>
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

export default ManageNGOs;


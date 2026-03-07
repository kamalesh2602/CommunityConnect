import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Trash2, CheckCircle, XCircle } from 'lucide-react';

const ManageNGOs = () => {
    const [ngos, setNgos] = useState([]);
    const { admin } = useContext(AuthContext);

    const fetchNGOs = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${admin.token}` } };
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/admin/ngos`, config);
            setNgos(data);
        } catch (error) {
            console.error(error);
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
            console.error(error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this NGO?')) {
            try {
                const config = { headers: { Authorization: `Bearer ${admin.token}` } };
                await axios.delete(`${import.meta.env.VITE_API_URL}/admin/ngos/${id}`, config);
                fetchNGOs();
            } catch (error) {
                console.error(error);
            }
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-black text-gray-900 mb-8 tracking-tight">Manage NGOs</h1>
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-sm font-bold text-gray-500 uppercase tracking-wide">
                            <th className="px-6 py-4">NGO Name</th>
                            <th className="px-6 py-4">Email</th>
                            <th className="px-6 py-4">Reg No.</th>
                            <th className="px-6 py-4 text-center">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ngos.map(ngo => (
                            <tr key={ngo._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4 font-semibold text-gray-800">{ngo.ngoName}</td>
                                <td className="px-6 py-4 text-gray-600">{ngo.email}</td>
                                <td className="px-6 py-4 text-gray-600 font-mono text-sm mt-1">{ngo.registrationNumber}</td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${ngo.verified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                        {ngo.verified ? <CheckCircle size={14} /> : <XCircle size={14} />}
                                        {ngo.verified ? 'Verified' : 'Pending'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 flex items-center justify-end gap-3">
                                    <button
                                        onClick={() => handleVerifyToggle(ngo._id)}
                                        className={`px-4 py-1.5 rounded-lg font-bold text-sm transition-all shadow-sm ${ngo.verified ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
                                    >
                                        {ngo.verified ? 'Revoke' : 'Verify'}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(ngo._id)}
                                        className="p-1.5 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-xl transition-all"
                                        title="Delete NGO"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {ngos.length === 0 && (
                            <tr><td colSpan="5" className="p-8 text-center text-gray-500">No NGOs found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManageNGOs;

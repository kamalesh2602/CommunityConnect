import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Trash2 } from 'lucide-react';

const ManageVolunteers = () => {
    const [volunteers, setVolunteers] = useState([]);
    const { admin } = useContext(AuthContext);

    const fetchVolunteers = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${admin.token}` } };
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/admin/volunteers`, config);
            setVolunteers(data);
        } catch (error) {
            console.error(error);
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
                console.error(error);
            }
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-black text-gray-900 mb-8 tracking-tight">Manage Volunteers</h1>
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-sm font-bold text-gray-500 uppercase tracking-wide">
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4">Email</th>
                            <th className="px-6 py-4">Phone</th>
                            <th className="px-6 py-4">Aadhar</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {volunteers.map(vol => (
                            <tr key={vol._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4 font-semibold text-gray-800">{vol.name}</td>
                                <td className="px-6 py-4 text-gray-600">{vol.email}</td>
                                <td className="px-6 py-4 text-gray-600">{vol.phone}</td>
                                <td className="px-6 py-4 text-gray-600">{vol.aadhar}</td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => handleDelete(vol._id)}
                                        className="p-2 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-xl transition-all shadow-sm border border-transparent hover:border-red-100"
                                        title="Delete Volunteer"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {volunteers.length === 0 && (
                            <tr><td colSpan="5" className="p-8 text-center text-gray-500">No volunteers found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManageVolunteers;

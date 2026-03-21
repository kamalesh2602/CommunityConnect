import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { LayoutGrid, Building2, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import RequirementCard from '../components/RequirementCard';

const RequirementFeed = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [requirements, setRequirements] = useState([]);
    const [loading, setLoading] = useState(true);

    const handleChat = (ngoId, ngoName) => {
        navigate(`/chat/${ngoId}`, { state: { name: ngoName } });
    };

    const handleDonate = (id) => {
        navigate(`/requirement/${id}`);
    };

    useEffect(() => {
        const fetchFeed = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/requirements/feed`, config);
                setRequirements(data);
            } catch (error) {
                console.error('Error fetching feed:', error);
            } finally {
                setLoading(false);
            }
        };
        if (user) fetchFeed();
    }, [user]);

    if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-gray-400">Loading requirements...</div>;

    return (
        <div className="py-8 max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-primary-100 text-primary-600 rounded-2xl">
                    <LayoutGrid size={28} />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Requirements</h1>
                    <p className="text-gray-500 font-medium">Causes from organizations you follow</p>
                </div>
            </div>

            {requirements.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {requirements.map((req) => (
                        <RequirementCard 
                            key={req._id} 
                            requirement={req} 
                            onNavigate={(id) => navigate(`/requirement/${id}`)}
                            onDonate={handleDonate}
                            onChat={handleChat}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
                    <Building2 size={48} className="mx-auto text-gray-200 mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No requirements yet</h3>
                    <p className="text-gray-500 max-w-sm mx-auto mb-8 font-medium">Follow more organizations or check back later for new causes.</p>
                    <button 
                        onClick={() => navigate('/volunteer/ngos')}
                        className="bg-primary-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-700 transition-all shadow-md flex items-center gap-2 mx-auto"
                    >
                        Organizations <ChevronRight size={18} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default RequirementFeed;

import React, { useEffect, useState, useContext, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { Send, ArrowLeft } from 'lucide-react';

const VolunteerChat = () => {
    const { user } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();
    const ngoId = location.state?.ngoId;
    const ngoName = location.state?.ngoName || 'NGO';

    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (!ngoId) {
            navigate('/volunteer/ngos');
            return;
        }

        const fetchMessages = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/chat/messages/${ngoId}/${user._id}`, config);
                setMessages(data);
            } catch (error) {
                console.error(error);
            }
        };

        fetchMessages();
        const interval = setInterval(fetchMessages, 3000);
        return () => clearInterval(interval);
    }, [ngoId, user, navigate]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.post(`${import.meta.env.VITE_API_URL}/chat/send`, {
                ngoId,
                volunteerId: user._id,
                text: newMessage
            }, config);
            setNewMessage('');
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-100 flex items-center gap-4 bg-gray-50/50">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 bg-white rounded-xl shadow-sm border border-gray-100 text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h2 className="text-xl font-black text-gray-900 leading-tight">{ngoName}</h2>
                    <p className="text-xs text-emerald-600 font-bold tracking-wide uppercase mt-0.5">• Online</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-gray-50/30">
                {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-gray-400 font-medium">
                        Send a message to start the conversation!
                    </div>
                ) : (
                    messages.map((msg, idx) => {
                        const isMe = msg.sender === 'Volunteer';
                        return (
                            <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[75%] rounded-2xl px-5 py-3 shadow-sm ${isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'}`}>
                                    <p className="text-[15px] leading-relaxed">{msg.text}</p>
                                    <span className={`text-[10px] uppercase font-bold mt-1.5 block ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessage} className="p-4 bg-white border-t border-gray-100">
                <div className="flex gap-3">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 px-5 py-3.5 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-500 transition-all font-medium text-gray-800 bg-gray-50 focus:bg-white"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-3.5 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
                    >
                        <Send size={20} />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default VolunteerChat;

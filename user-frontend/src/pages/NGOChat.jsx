import React, { useEffect, useState, useContext, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { Send, ArrowLeft, MessageSquare } from 'lucide-react';

const NGOChat = () => {
    const { user } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();

    // An NGO might come here without a specific volunteer, in which case we should show a list of chats.
    // However, to keep it simple and match the "Chat directly with specific volunteer" logic:
    const volunteerId = location.state?.volunteerId;
    const volunteerName = location.state?.volunteerName || 'Volunteer';

    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [chatList, setChatList] = useState([]);
    const messagesEndRef = useRef(null);

    // If no volunteerId is provided via state, show a generic view or fetch all chats.
    // For this prompt, we'll assume the simple chat flows from the followers list button context.

    useEffect(() => {
        if (!volunteerId) {
            // Fetch all active chats if accessed directly without volunteerId
            const fetchChats = async () => {
                try {
                    const config = { headers: { Authorization: `Bearer ${user.token}` } };
                    const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/chat/ngo`, config);
                    setChatList(data);
                } catch (error) {
                    console.error('Failed fetching chat list', error);
                }
            };
            fetchChats();
            return;
        }

        const fetchMessages = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/chat/messages/${user._id}/${volunteerId}`, config);
                setMessages(data);
                // Mark as read
                await axios.put(`${import.meta.env.VITE_API_URL}/chat/mark-read/${volunteerId}`, {}, config);
            } catch (error) {
                console.error(error);
            }
        };

        fetchMessages();
        const interval = setInterval(fetchMessages, 3000);
        return () => clearInterval(interval);
    }, [volunteerId, user]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !volunteerId) return;

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.post(`${import.meta.env.VITE_API_URL}/chat/send`, {
                ngoId: user._id,
                volunteerId,
                text: newMessage
            }, config);
            setNewMessage('');
        } catch (error) {
            console.error(error);
        }
    };

    if (!volunteerId) {
        return (
            <div className="py-8">
                <h1 className="text-3xl font-black text-gray-900 mb-8 tracking-tight">Messages</h1>
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    {chatList.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                            {chatList.map(chat => (
                                <div key={chat._id} className="p-6 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-lg">{chat.volunteerId?.name || 'Unknown User'}</h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {chat.messages.length > 0 ? chat.messages[chat.messages.length - 1].text.substring(0, 50) + '...' : 'No messages yet'}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => navigate('/ngo/chat', { state: { volunteerId: chat.volunteerId?._id, volunteerName: chat.volunteerId?.name } })}
                                        className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm"
                                    >
                                        Open Chat
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-16 text-center text-gray-500 bg-gray-50/30">
                            <MessageSquare size={48} className="mx-auto text-gray-300 mb-4" />
                            <p className="font-medium text-lg">No active conversations. Your followers will appear here when they reach out.</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

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
                    <h2 className="text-xl font-black text-gray-900 leading-tight">{volunteerName}</h2>
                    <p className="text-xs text-blue-600 font-bold tracking-wide uppercase mt-0.5">• Active Volunteer</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-gray-50/30">
                {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-gray-400 font-medium">
                        Send a message to start the conversation!
                    </div>
                ) : (
                    messages.map((msg, idx) => {
                        const isMe = msg.sender === 'NGO';
                        return (
                            <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[75%] rounded-2xl px-5 py-3 shadow-sm ${isMe ? 'bg-emerald-600 text-white rounded-tr-none' : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'}`}>
                                    <p className="text-[15px] leading-relaxed">{msg.text}</p>
                                    <span className={`text-[10px] uppercase font-bold mt-1.5 block ${isMe ? 'text-emerald-200' : 'text-gray-400'}`}>
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
                        className="flex-1 px-5 py-3.5 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 transition-all font-medium text-gray-800 bg-gray-50 focus:bg-white"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white p-3.5 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
                    >
                        <Send size={20} />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default NGOChat;

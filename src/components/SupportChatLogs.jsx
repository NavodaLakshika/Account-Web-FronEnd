import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { supportService } from '../services/support.service'; // Adjust path if needed
import { MessageSquare, User, Building, Phone, Mail, Clock, X, Trash2 } from 'lucide-react';
import ConfirmModal from './modals/ConfirmModal';

const api = axios.create({
    baseURL: import.meta.env.PROD ? (import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://194.233.76.58:8282/api') : '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

const SupportChatLogs = () => {
    const [sessions, setSessions] = useState([]);
    const [selectedSession, setSelectedSession] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);

    const [confirmConfig, setConfirmConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        loading: false
    });
    const closeConfirm = () => setConfirmConfig(prev => ({ ...prev, isOpen: false }));

    // Make sure to attach the token for authenticated endpoints
    const getToken = () => sessionStorage.getItem('token');

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        setLoading(true);
        try {
            const token = getToken();
            const response = await api.get('/ChatLog/sessions', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSessions(response.data);
        } catch (error) {
            console.error("Error fetching sessions", error);
        }
        setLoading(false);
    };

    const fetchMessages = async (session) => {
        setSelectedSession(session);
        setMessages([]); // clear old
        try {
            const token = getToken();
            const response = await api.get(`/ChatLog/messages/${session.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessages(response.data);
        } catch (error) {
            console.error("Error fetching messages", error);
        }
    };

    // Only reading messages, no replying.
    const handleDeleteSession = async (e, sessionId) => {
        e.stopPropagation();
        setConfirmConfig({
            isOpen: true,
            title: 'Delete Chat Session',
            message: 'Are you sure you want to completely delete this chat session? This cannot be undone.',
            loading: false,
            onConfirm: async () => {
                setConfirmConfig(prev => ({ ...prev, loading: true }));
                try {
                    const token = getToken();
                    await api.delete(`/ChatLog/session/${sessionId}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (selectedSession?.id === sessionId) {
                        setSelectedSession(null);
                    }
                    closeConfirm();
                    fetchSessions();
                } catch (error) {
                    console.error("Error deleting session", error);
                    closeConfirm();
                    alert("Failed to delete the session.");
                }
            }
        });
    };

    const handleDeleteMessage = async (messageId) => {
        setConfirmConfig({
            isOpen: true,
            title: 'Delete Message',
            message: 'Delete this message permanently?',
            loading: false,
            onConfirm: async () => {
                setConfirmConfig(prev => ({ ...prev, loading: true }));
                try {
                    const token = getToken();
                    await api.delete(`/ChatLog/message/${messageId}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setMessages(messages.filter(m => m.id !== messageId));
                    closeConfirm();
                } catch (error) {
                    console.error("Error deleting message", error);
                    closeConfirm();
                    alert("Failed to delete the message.");
                }
            }
        });
    };

    return (
        <div className="flex h-[80vh] bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
            {/* Left Sidebar: Session List */}
            <div className="w-1/3 bg-slate-50 border-r border-slate-200 flex flex-col">
                <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between">
                    <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                        <MessageSquare className="text-blue-500" size={20} />
                        Support Chats
                    </h2>
                    <button onClick={fetchSessions} className="text-xs text-blue-600 font-semibold hover:underline">Refresh</button>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {loading ? (
                        <p className="text-center text-slate-400 mt-10 text-sm">Loading sessions...</p>
                    ) : sessions.length === 0 ? (
                        <p className="text-center text-slate-400 mt-10 text-sm">No chat logs found.</p>
                    ) : (
                        sessions.map(session => (
                            <div
                                key={session.id}
                                onClick={() => fetchMessages(session)}
                                className={`p-4 rounded-lg cursor-pointer transition-colors border ${selectedSession?.id === session.id ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-100 hover:border-blue-100 hover:shadow-sm'}`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-slate-800 text-sm">{session.name}</h4>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                            <Clock size={10} /> {new Date(session.createdAt).toLocaleDateString()}
                                        </span>
                                        <button
                                            onClick={(e) => handleDeleteSession(e, session.id)}
                                            className="text-slate-300 hover:text-red-500 transition-colors"
                                            title="Delete Session"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                </div>
                                <div className="text-xs text-slate-500 space-y-1">
                                    <p className="flex items-center gap-1.5"><Building size={12} /> {session.companyGroup}</p>
                                    <p className="flex items-center gap-1.5"><Phone size={12} /> {session.phone}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Right Side: Message Viewer */}
            <div className="flex-1 bg-white flex flex-col">
                {selectedSession ? (
                    <>
                        <div className="p-4 border-b border-slate-200 bg-white flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-slate-800 text-lg">{selectedSession.name}</h3>
                                <p className="text-xs text-slate-500">{selectedSession.email}</p>
                            </div>
                            <button onClick={() => setSelectedSession(null)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 space-y-4">
                            {messages.length === 0 ? (
                                <p className="text-center text-slate-400 mt-10 text-sm">No messages sent by this user.</p>
                            ) : (
                                messages.map(msg => (
                                    <div key={msg.id} className={`flex flex-col max-w-[80%] ${(msg.sender === 'user' || msg.sender === 'client') ? 'self-end items-end ml-auto' : 'self-start items-start'} group relative`}>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] text-slate-400 font-medium capitalize ml-1 mr-1">{msg.sender}</span>
                                            <button
                                                onClick={() => handleDeleteMessage(msg.id)}
                                                className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                title="Delete Message"
                                            >
                                                <Trash2 size={10} />
                                            </button>
                                        </div>
                                        <div className={`p-3 rounded-lg text-sm shadow-sm ${(msg.sender === 'user' || msg.sender === 'client') ? 'bg-blue-500 text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none'}`}>
                                            {msg.messageText}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                        <MessageSquare size={48} className="mb-4 text-slate-200" />
                        <p className="text-sm font-medium">Select a conversation to view messages</p>
                    </div>
                )}
            </div>

            {/* Super Admin Style Confirm Modal */}
            <ConfirmModal
                isOpen={confirmConfig.isOpen}
                onClose={closeConfirm}
                onConfirm={confirmConfig.onConfirm}
                title={confirmConfig.title}
                message={confirmConfig.message}
                loading={confirmConfig.loading}
                variant="danger"
                confirmText="Yes, Delete"
            />
        </div>
    );
};

export default SupportChatLogs;

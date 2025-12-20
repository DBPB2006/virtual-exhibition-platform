import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from "socket.io-client";
import api from '@/api/axios';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { motion, useMotionValue, useMotionTemplate, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLandmark, faWaveSquare, faChevronDown, faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import { Send, Users, MessageSquare, X } from "lucide-react";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Use Case: Heads-Up Display Component
const HUD = ({ activeUsersCount, onToggleChat, onNavigateHome, onScrollToInfo }) => {
    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
            <div className="flex items-center justify-between px-8 py-4 bg-white/90 backdrop-blur-md border border-neutral-200 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all hover:border-neutral-300">
                <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-sm" />
                    <span className="text-neutral-900 font-sans font-medium text-xs tracking-widest uppercase">
                        Live ({activeUsersCount})
                    </span>
                </div>

                <div className="h-4 w-[1px] bg-neutral-200" />

                <div className="flex gap-6 text-neutral-500">
                    <button onClick={onNavigateHome} className="hover:text-black transition-colors p-1" title="Return to Detail">
                        <FontAwesomeIcon icon={faLandmark} className="text-lg" />
                    </button>
                    <button onClick={onScrollToInfo} className="hover:text-black transition-colors p-1" title="Exhibition Info">
                        <FontAwesomeIcon icon={faCircleInfo} className="text-lg" />
                    </button>
                </div>

                <div className="h-4 w-[1px] bg-neutral-200" />

                <div className="flex gap-4">
                    <button onClick={onToggleChat} className="text-neutral-500 hover:text-black transition-colors p-1 flex items-center" title="Open Chat">
                        <MessageSquare className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

// Use Case: Exhibit Viewing Page
const ExhibitView = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // State: Content Data
    const [exhibition, setExhibition] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State: Real-time Interaction
    const [socket, setSocket] = useState(null);
    const [activeUsers, setActiveUsers] = useState([]);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState("");
    const [showChat, setShowChat] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    // State: UI Controls
    const [fullscreenMedia, setFullscreenMedia] = useState(null);

    // Refs
    const infoRef = useRef(null);
    const scrollRef = useRef(null);

    // Use Case: Fetch Exhibition Data
    useEffect(() => {
        const fetchContent = async () => {
            try {
                const accessRes = await api.get(`/api/exhibitions/${id}/access`);
                const accessData = accessRes.data;

                if (accessData.isExpired) {
                    setError("This exhibition has ended.");
                    setLoading(false);
                    return;
                }

                const response = await api.get(`/api/exhibitions/${id}/view`);
                setExhibition(response.data);

            } catch (err) {
                console.error("Access Error:", err);
                if (err.response?.status === 403) {
                    setError("Access Denied: You must purchase this exhibit.");
                    setTimeout(() => navigate(`/exhibitions/${id}`), 2000);
                } else if (err.response?.status === 401) {
                    navigate('/login');
                } else {
                    setError("Unable to load exhibition content.");
                }
            } finally {
                setLoading(false);
            }
        };
        fetchContent();
    }, [id, navigate]);

    // Use Case: Real-time Socket Connection
    useEffect(() => {
        if (!exhibition) return;

        const newSocket = io(SOCKET_URL, {
            withCredentials: true,
            transports: ['websocket', 'polling']
        });

        setSocket(newSocket);
        newSocket.on("connect", () => {
            newSocket.emit("join-exhibit", id);
        });

        newSocket.on("presence-update", (users) => setActiveUsers(users));
        newSocket.on("receive-message", (msg) => {
            setMessages((prev) => [...prev, msg]);
            if (scrollRef.current) scrollRef.current.scrollIntoView({ behavior: "smooth" });
        });

        return () => newSocket.disconnect();
    }, [exhibition, id]);

    // Use Case: Handler Functions
    const handleSendMessage = (e) => {
        e.preventDefault();
        if (inputMessage.trim() && socket) {
            socket.emit("send-message", { exhibitId: id, message: inputMessage });
            setInputMessage("");
        }
    };

    const handleNavigateHome = () => navigate(`/exhibitions/${id}`);
    const handleScrollToInfo = () => infoRef.current?.scrollIntoView({ behavior: 'smooth' });

    // Use Case: Dynamic Background
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const handleMouseMove = (e) => {
        mouseX.set(e.clientX);
        mouseY.set(e.clientY);
    };
    const backgroundGradient = useMotionTemplate`radial-gradient(800px circle at ${mouseX}px ${mouseY}px, rgba(30, 30, 40, 0.03), transparent 80%)`;

    // Use Case: Loading State
    if (loading) return (
        <div className="h-screen bg-white flex items-center justify-center">
            <Spinner className="h-8 w-8 text-black" />
        </div>
    );

    // Use Case: Error State
    if (error) return (
        <div className="h-screen bg-white text-black flex flex-col items-center justify-center gap-4">
            <h1 className="text-2xl font-serif text-red-600">{error}</h1>
            <Button onClick={() => navigate(`/exhibitions/${id}`)} variant="outline">
                Return to Detail
            </Button>
        </div>
    );

    return (
        <div className="h-screen w-screen bg-white overflow-hidden relative selection:bg-black selection:text-white font-sans" onMouseMove={handleMouseMove}>

            {/* Use Case: Atmospheric Background */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <motion.div
                    className="absolute inset-0 opacity-100"
                    style={{ background: backgroundGradient }}
                />
            </div>

            {/* Use Case: Fullscreen Lightbox */}
            <AnimatePresence>
                {fullscreenMedia && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setFullscreenMedia(null)}
                        className="fixed inset-0 z-[10000] bg-black/95 flex items-center justify-center p-4 md:p-12 cursor-pointer backdrop-blur-sm"
                    >
                        <div className="absolute top-6 right-6 z-50">
                            <button className="text-white/50 hover:text-white transition-colors p-2">
                                <X className="w-8 h-8" />
                            </button>
                        </div>

                        <div onClick={(e) => e.stopPropagation()} className="relative max-w-full max-h-full cursor-default">
                            {fullscreenMedia.type === 'video' ? (
                                <video
                                    src={fullscreenMedia.url}
                                    className="max-w-full max-h-[90vh] object-contain shadow-2xl"
                                    controls
                                    autoPlay
                                />
                            ) : fullscreenMedia.type === 'image' ? (
                                <img
                                    src={fullscreenMedia.url}
                                    alt="Fullscreen view"
                                    className="max-w-full max-h-[90vh] object-contain shadow-2xl"
                                />
                            ) : (
                                <img
                                    src={fullscreenMedia.url}
                                    alt="Fullscreen view"
                                    className="max-w-full max-h-[90vh] object-contain shadow-2xl"
                                />
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Use Case: Main Viewer Area */}
            <div className={`flex-1 relative h-full transition-all duration-500 ease-out overflow-y-auto ${showChat ? 'md:pr-96' : ''}`}>

                <div className="w-full min-h-screen flex flex-col p-8 md:p-16 bg-white">
                    <div className="max-w-6xl mx-auto w-full pt-12 text-center md:text-left flex-1 flex flex-col justify-center">

                        <h1 className="font-serif text-5xl md:text-7xl text-black leading-tight mb-8 tracking-tight">
                            {exhibition.title}
                        </h1>

                        <div className="w-full aspect-video bg-neutral-50 border border-neutral-200 shadow-xl relative overflow-hidden group mb-12 interactive-area flex items-center justify-center cursor-pointer rounded-sm"
                            onClick={() => {
                                const current = exhibition.media && exhibition.media.length > 0
                                    ? exhibition.media[currentIndex] || exhibition.media[0]
                                    : { type: 'image', url: exhibition.coverImage };

                                if (current.type !== 'audio') {
                                    setFullscreenMedia(current);
                                }
                            }}
                        >
                            {exhibition.media && exhibition.media.length > 0 ? (
                                (() => {
                                    const currentMedia = exhibition.media[currentIndex] || exhibition.media[0];
                                    const isVideo = currentMedia.type === 'video';
                                    const isAudio = currentMedia.type === 'audio';

                                    return (
                                        <>
                                            {isVideo ? (
                                                <video
                                                    src={currentMedia.url}
                                                    className="w-full h-full object-contain pointer-events-none"
                                                    muted
                                                />
                                            ) : isAudio ? (
                                                <div
                                                    className="flex flex-col items-center justify-center p-8 bg-neutral-50 w-full h-full cursor-default"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <div className="w-24 h-24 rounded-full bg-white border border-neutral-200 shadow-sm flex items-center justify-center mb-4 animate-pulse">
                                                        <FontAwesomeIcon icon={faWaveSquare} className="text-black text-3xl" />
                                                    </div>
                                                    <audio src={currentMedia.url} controls className="w-full max-w-md" />
                                                    <p className="mt-4 text-neutral-500 font-mono text-xs uppercase tracking-widest">{currentMedia.originalName || "Audio Track"}</p>
                                                </div>
                                            ) : (
                                                <img
                                                    src={currentMedia.url}
                                                    className="w-full h-full object-contain mix-blend-multiply"
                                                    alt={`Exhibit Media ${currentIndex + 1}`}
                                                />
                                            )}

                                            {/* Use Case: Media Navigation */}
                                            {exhibition.media.length > 1 && (
                                                <>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setCurrentIndex(prev => prev === 0 ? exhibition.media.length - 1 : prev - 1); }}
                                                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-black shadow-lg flex items-center justify-center border border-neutral-200 transition-colors z-20"
                                                    >
                                                        <FontAwesomeIcon icon={faChevronDown} className="rotate-90" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setCurrentIndex(prev => prev === exhibition.media.length - 1 ? 0 : prev + 1); }}
                                                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-black shadow-lg flex items-center justify-center border border-neutral-200 transition-colors z-20"
                                                    >
                                                        <FontAwesomeIcon icon={faChevronDown} className="-rotate-90" />
                                                    </button>
                                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                                                        {exhibition.media.map((_, idx) => (
                                                            <button
                                                                key={idx}
                                                                onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
                                                                className={`w-2 h-2 rounded-full transition-all shadow-sm ${idx === currentIndex ? "bg-black w-6" : "bg-white border border-neutral-300 hover:bg-neutral-100"}`}
                                                            />
                                                        ))}
                                                    </div>
                                                </>
                                            )}
                                        </>
                                    );
                                })()
                            ) : (
                                <img
                                    src={exhibition.coverImage}
                                    className="w-full h-full object-contain mix-blend-multiply"
                                    alt="Main Exhibit"
                                />
                            )}

                            <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur border border-neutral-200 text-[9px] font-mono text-neutral-500 uppercase tracking-widest z-10 pointer-events-none shadow-sm rounded-sm">
                                Click to Expand
                            </div>
                        </div>
                    </div>

                    {/* Use Case: Scroll Indicator */}
                    <div className="flex justify-center pb-8 animate-bounce opacity-30">
                        <FontAwesomeIcon icon={faChevronDown} className="text-black text-xl" />
                    </div>
                </div>

                {/* Use Case: Information Section */}
                <div ref={infoRef} className="w-full min-h-screen bg-neutral-50 p-8 md:p-16 border-t border-neutral-100 relative z-20">
                    <div className="max-w-4xl mx-auto pt-16">
                        <h2 className="text-3xl font-serif text-black mb-8 border-b border-neutral-200 pb-4">Curator's Note</h2>
                        <div className="prose prose-lg max-w-none font-sans font-light leading-relaxed text-neutral-600 tracking-wide">
                            {exhibition.description}
                        </div>
                    </div>
                </div>
            </div>

            {/* Use Case: Chat Sidebar */}
            <div className={`fixed right-0 top-0 bottom-0 w-full md:w-96 bg-white border-l border-neutral-200 flex flex-col transition-transform duration-500 z-40 transform ${showChat ? 'translate-x-0' : 'translate-x-full'} shadow-[0_0_40px_rgba(0,0,0,0.1)]`}>

                <div className="p-6 border-b border-neutral-100 flex justify-between items-center bg-white">
                    <h2 className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 flex items-center gap-2">
                        <Users className="w-3 h-3 text-black" /> Active Observers ({activeUsers.length})
                    </h2>
                    <Button onClick={() => setShowChat(false)} variant="ghost" size="icon" className="h-6 w-6 text-neutral-400 hover:text-black">
                        <X className="w-4 h-4" />
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-neutral-50/50">
                    {messages.length === 0 && (
                        <div className="text-center text-neutral-400 font-serif italic text-sm mt-10">
                            The room is silent.
                        </div>
                    )}
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-500 ${msg.sender === "System" ? "items-center" : "items-start"}`}>
                            {msg.sender === "System" ? (
                                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-1 rounded-full mb-1">
                                    {msg.text}
                                </span>
                            ) : (
                                <>
                                    <div className="flex items-baseline gap-2 mb-1 px-1">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-black">
                                            {msg.sender}
                                        </span>
                                        <span className="text-[9px] text-neutral-400 font-mono">
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <div className="bg-white border border-neutral-200 p-3 rounded-2xl rounded-tl-sm shadow-sm text-sm text-neutral-700 font-light leading-relaxed max-w-[90%]">
                                        {msg.text}
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                    <div ref={scrollRef} />
                </div>

                <form onSubmit={handleSendMessage} className="p-6 border-t border-neutral-100 bg-white">
                    <div className="relative group">
                        <input
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            placeholder="Whisper to the room..."
                            className="w-full bg-neutral-100 text-black text-sm rounded-full border-none px-6 py-4 focus:outline-none focus:ring-1 focus:ring-black placeholder-neutral-400 transition-all font-serif italic"
                        />
                        <button
                            type="submit"
                            disabled={!inputMessage.trim()}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black disabled:opacity-20 transition-colors p-2 bg-white rounded-full shadow-sm hover:shadow-md"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </form>
            </div>

            {/* Use Case: HUD Controls */}
            <HUD
                activeUsersCount={activeUsers.length}
                onToggleChat={() => setShowChat(!showChat)}
                onNavigateHome={handleNavigateHome}
                onScrollToInfo={handleScrollToInfo}
            />

        </div>
    );
};

export default ExhibitView;

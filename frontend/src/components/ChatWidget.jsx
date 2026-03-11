import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, User, Bot, Loader2 } from 'lucide-react';

const ChatWidget = ({ context }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: "I can help explain your retinal scan results. What's on your mind?", sender: 'bot' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = { id: Date.now(), text: input, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:8000/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: input,
                    context: context || null
                })
            });

            const data = await response.json();
            
            if (data.status === 'success') {
                setMessages(prev => [...prev, { id: Date.now() + 1, text: data.response, sender: 'bot' }]);
            } else {
                setMessages(prev => [...prev, { id: Date.now() + 1, text: "I'm having trouble connecting to the clinical engine. Please try again later.", sender: 'bot' }]);
            }
        } catch (error) {
            setMessages(prev => [...prev, { id: Date.now() + 1, text: "Network error. Please check if the OculoCardia backend is running.", sender: 'bot' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="chat-widget-container" style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 1000 }}>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9, transformOrigin: 'bottom right' }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        className="glass-panel chat-window"
                        style={{
                            width: '380px',
                            height: '520px',
                            marginBottom: '1.5rem',
                            display: 'flex',
                            flexDirection: 'column',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                            border: '1px solid var(--accent-primary)',
                            background: 'rgba(10, 12, 16, 0.95)'
                        }}
                    >
                        {/* Chat Header */}
                        <div style={{ 
                            padding: '1.25rem', 
                            borderBottom: '1px solid var(--glass-border)',
                            background: 'linear-gradient(90deg, rgba(0, 242, 254, 0.1) 0%, transparent 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div className="logo-badge" style={{ width: 32, height: 32 }}>
                                    <Bot size={18} color="white" />
                                </div>
                                <div>
                                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0 }}>Oculo | Your Guide</h4>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)' }}></div>
                                        Online
                                    </span>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
                                <X size={20} />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {messages.map((msg) => (
                                <div key={msg.id} style={{ 
                                    display: 'flex', 
                                    justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                    gap: '0.75rem'
                                }}>
                                    {msg.sender === 'bot' && <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(0,242,254,0.1)', display: 'flex', alignItems: 'center', justify: 'center', flexShrink: 0, marginTop: '4px' }}><Bot size={14} color="var(--accent-primary)" /></div>}
                                    <div style={{ 
                                        maxWidth: '80%', 
                                        padding: '0.85rem 1rem', 
                                        borderRadius: '16px',
                                        fontSize: '0.85rem',
                                        lineHeight: '1.5',
                                        background: msg.sender === 'user' ? 'var(--accent-primary)' : 'rgba(255,255,255,0.03)',
                                        color: msg.sender === 'user' ? 'black' : 'var(--text-vibrant)',
                                        border: msg.sender === 'user' ? 'none' : '1px solid var(--glass-border)',
                                        borderBottomLeftRadius: msg.sender === 'bot' ? '4px' : '16px',
                                        borderBottomRightRadius: msg.sender === 'user' ? '4px' : '16px'
                                    }}>
                                        {msg.text}
                                    </div>
                                    {msg.sender === 'user' && <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justify: 'center', flexShrink: 0, marginTop: '4px' }}><User size={14} color="white" /></div>}
                                </div>
                            ))}
                            {isLoading && (
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(0,242,254,0.1)', display: 'flex', alignItems: 'center', justify: 'center' }}><Bot size={14} color="var(--accent-primary)" /></div>
                                    <div style={{ padding: '0.85rem 1rem', borderRadius: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Loader2 size={14} className="animate-spin" />
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Oculo is typing...</span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div style={{ padding: '1.25rem', borderTop: '1px solid var(--glass-border)' }}>
                            <div style={{ 
                                display: 'flex', 
                                gap: '0.5rem', 
                                background: 'rgba(255,255,255,0.02)', 
                                border: '1px solid var(--glass-border)', 
                                borderRadius: '12px',
                                padding: '4px'
                            }}>
                                <input 
                                    type="text" 
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Ask about your results..."
                                    style={{ 
                                        flex: 1, 
                                        background: 'transparent', 
                                        border: 'none', 
                                        color: 'white', 
                                        padding: '0.75rem',
                                        fontSize: '0.85rem',
                                        outline: 'none'
                                    }}
                                />
                                <button 
                                    onClick={handleSend}
                                    disabled={!input.trim() || isLoading}
                                    style={{ 
                                        background: 'var(--accent-primary)', 
                                        border: 'none', 
                                        color: 'black', 
                                        width: '40px', 
                                        height: '40px', 
                                        borderRadius: '8px', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                            <p style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textAlign: 'center', marginTop: '0.75rem' }}>
                                I'm an AI helper. Always check with a doctor for medical advice.
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="logo-badge"
                style={{ 
                    width: '60px', 
                    height: '60px', 
                    borderRadius: '50%', 
                    boxShadow: '0 10px 30px rgba(0, 242, 254, 0.4)',
                    cursor: 'pointer',
                    position: 'relative',
                    border: 'none'
                }}
            >
                {isOpen ? <X size={24} color="white" /> : <MessageCircle size={24} color="white" />}
                {!isOpen && (
                    <span className="ping-dot" style={{ 
                        position: 'absolute', 
                        top: 0, 
                        right: 0, 
                        width: 14, 
                        height: 14, 
                        background: '#ff3d00', 
                        borderRadius: '50%', 
                        border: '2px solid var(--bg-dark)' 
                    }}></span>
                )}
            </motion.button>

            <style dangerouslySetInnerHTML={{
                __html: `
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .ping-dot { animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite; }
                @keyframes ping { 75%, 100% { transform: scale(1.5); opacity: 0; } }
                `
            }} />
        </div>
    );
};

export default ChatWidget;

// src/components/ChatAssistant.jsx
import React, { useState, useRef, useEffect } from 'react';

function ChatAssistant({ userContext, chatHistory, setChatHistory }) {
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const chatEndRef = useRef(null);

    // Auto-scrolls the chat window to the latest message for optimal usability
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory, loading]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage = { role: 'user', content: input };
        const updatedHistory = [...chatHistory, userMessage];

        setChatHistory(updatedHistory);
        setInput('');
        setLoading(true);

        try {
            // Slicing history to the last 10 messages to limit token usage and optimize efficiency
            const optimizedHistory = chatHistory.slice(-10);

            // Connects directly to our local Express server backend
            const response = await fetch('http://localhost:5000/api/advisor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userContext,
                    messageHistory: optimizedHistory,
                    newMessage: input
                })
            });

            const data = await response.json();

            if (response.ok && data.reply) {
                setChatHistory([...updatedHistory, { role: 'assistant', content: data.reply }]);
            } else {
                const errorMessage = data.error || 'No response received from the Eco-Engine.';
                setChatHistory([...updatedHistory, { role: 'assistant', content: `⚠️ Error: ${errorMessage}` }]);
            }
        } catch (err) {
            console.error(err);
            setChatHistory([...updatedHistory, { role: 'assistant', content: '❌ Connection failed. Ensure your server.js is running on port 5000.' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '450px' }} aria-label="Advisor Chat">
            {/* Conversation Thread Wrapper */}
            <div 
                style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '550px' }}
                role="log"
                aria-label="Chat history"
                aria-live="polite"
            >
                {chatHistory.length === 0 && (
                    <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', backgroundColor: 'var(--primary-light)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--primary)' }}>
                        <span style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }}>🤖</span>
                        <strong style={{ color: 'var(--primary-dark)', fontFamily: 'var(--font-display)', fontSize: '15px' }}>
                            Welcome to your Eco-Budget Advisor!
                        </strong>
                        <br />
                        <span style={{ fontSize: '13px', display: 'inline-block', marginTop: '6px' }}>
                            Adjust your variables in the left sidebar, then ask me anything like:
                        </span>
                        <em style={{ display: 'block', marginTop: '8px', color: 'var(--primary-hover)', fontWeight: '600', fontSize: '13px' }}>
                            "How can I drop my electricity load by 15% to save money?"
                        </em>
                    </div>
                )}

                {chatHistory.map((msg, idx) => (
                    <div
                        key={idx}
                        style={{
                            alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                            backgroundColor: msg.role === 'user' ? 'var(--primary-dark)' : '#f1f5f9',
                            color: msg.role === 'user' ? '#ffffff' : 'var(--text-main)',
                            padding: '12px 18px',
                            borderRadius: msg.role === 'user' ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                            maxWidth: '75%',
                            boxShadow: 'var(--shadow-sm)',
                            whiteSpace: 'pre-wrap',
                            fontSize: '14px',
                            lineHeight: '1.6',
                            border: msg.role === 'user' ? 'none' : '1px solid var(--border-color)'
                        }}
                    >
                        {msg.content}
                    </div>
                ))}

                {loading && (
                    <div 
                        style={{ alignSelf: 'flex-start', backgroundColor: '#e2e8f0', color: 'var(--text-muted)', padding: '12px 18px', borderRadius: '16px 16px 16px 2px', fontSize: '13px', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '8px' }}
                        role="status"
                        aria-live="polite"
                    >
                        Thinking up budget optimizations... 🔄
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            {/* Input Form Controls */}
            <form 
                onSubmit={handleSendMessage} 
                style={{ display: 'flex', padding: '16px', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)', gap: '10px' }}
                aria-label="Message composer"
            >
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask for custom saving roadmaps..."
                    disabled={loading}
                    aria-label="Question to Advisor"
                    style={{ 
                        flex: 1, 
                        padding: '12px 16px', 
                        borderRadius: 'var(--radius-md)', 
                        border: '1px solid var(--border-color)', 
                        outline: 'none', 
                        fontSize: '14px',
                        backgroundColor: '#ffffff',
                        transition: 'border-color 0.2s, box-shadow 0.2s'
                    }}
                />
                <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    aria-label="Send message"
                    style={{
                        backgroundColor: loading || !input.trim() ? 'var(--text-light)' : 'var(--primary-dark)',
                        color: '#ffffff',
                        border: 'none',
                        padding: '0 24px',
                        borderRadius: 'var(--radius-md)',
                        cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                        fontWeight: '600',
                        fontSize: '14px',
                        transition: 'background-color 0.2s, transform 0.1s'
                    }}
                >
                    Send
                </button>
            </form>
        </div>
    );
}

export default ChatAssistant;
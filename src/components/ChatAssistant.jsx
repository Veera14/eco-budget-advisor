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
            // Connects directly to our local Express server backend
            const response = await fetch('http://localhost:5000/api/advisor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userContext,
                    messageHistory: chatHistory,
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
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '400px' }}>
            {/* Conversation Thread Wrapper */}
            <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '550px' }}>
                {chatHistory.length === 0 && (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#757575', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px dashed #bdbdbd' }}>
                        🤖 <strong>Welcome to your Eco-Budget Terminal!</strong><br />
                        Adjust your context parameters on the left sidebar, then ask me something like:
                        <em style={{ display: 'block', marginTop: '6px', color: '#2e7d32' }}>"How can I drop my electricity load by 15% to save money?"</em>
                    </div>
                )}

                {chatHistory.map((msg, idx) => (
                    <div
                        key={idx}
                        style={{
                            alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                            backgroundColor: msg.role === 'user' ? '#2e7d32' : '#f5f5f5',
                            color: msg.role === 'user' ? '#ffffff' : '#212121',
                            padding: '12px 16px',
                            borderRadius: '12px',
                            maxWidth: '75%',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                            whiteSpace: 'pre-wrap',
                            fontSize: '14px',
                            lineHeight: '1.5'
                        }}
                    >
                        {msg.content}
                    </div>
                ))}

                {loading && (
                    <div style={{ alignSelf: 'flex-start', backgroundColor: '#e0e0e0', color: '#616161', padding: '10px 14px', borderRadius: '12px', fontSize: '13px', fontStyle: 'italic' }}>
                        Thinking up budget optimizations...🔄
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            {/* Input Form Controls */}
            <form onSubmit={handleSendMessage} style={{ display: 'flex', padding: '12px', borderTop: '1px solid #e0e0e0', backgroundColor: '#fafafa', gap: '8px' }}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask for custom saving roadmaps..."
                    disabled={loading}
                    style={{ flex: 1, padding: '12px', borderRadius: '6px', border: '1px solid #ccc', outline: 'none', fontSize: '14px' }}
                />
                <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    style={{
                        backgroundColor: loading || !input.trim() ? '#9e9e9e' : '#2e7d32',
                        color: '#fff',
                        border: 'none',
                        padding: '0 20px',
                        borderRadius: '6px',
                        cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                        fontWeight: 'bold',
                        transition: 'background 0.2s'
                    }}
                >
                    Send
                </button>
            </form>
        </div>
    );
}

export default ChatAssistant;
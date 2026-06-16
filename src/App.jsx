// src/App.jsx
import React, { useState, useEffect } from 'react';
import ContextForm from './components/ContextForm';
import BudgetMetrics from './components/BudgetMetrics';
import ChatAssistant from './components/ChatAssistant';
import { evaluateEcoBudget } from './utils/carbonCalculators';

function App() {
    const [userContext, setUserContext] = useState({
        location: '',
        monthlyKwh: '',
        commuteDistance: '',
        vehicleType: 'petrol'
    });

    const [metrics, setMetrics] = useState({
        currentCarbonKg: '0.0',
        currentCostDollars: '0.00',
        potentialCarbonSaved: '0.0',
        potentialCashSaved: '0.00'
    });

    const [chatHistory, setChatHistory] = useState([]);

    // Dynamically update calculations whenever user context updates
    useEffect(() => {
        const updatedMetrics = evaluateEcoBudget(userContext);
        setMetrics(updatedMetrics);
    }, [userContext]);

    return (
        <div className="app-container">
            {/* Left Column: Context Configuration (Aside panel) */}
            <aside className="sidebar" role="complementary" aria-label="Eco Context Configuration">
                <div>
                    <h1 style={{ color: 'var(--primary-dark)', fontSize: '22px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        🌱 Eco-Budget
                    </h1>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Calculate & optimize your footprint</p>
                </div>
                <hr style={{ border: 'none', height: '1px', backgroundColor: 'var(--border-color)', margin: '8px 0' }} />
                <ContextForm userContext={userContext} setUserContext={setUserContext} />
            </aside>

            {/* Right Column: Key Results Display & Assistant Chat Workspace */}
            <main className="main-content" role="main" aria-label="Advisor Console">
                <header>
                    <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', fontFamily: 'var(--font-display)' }}>
                        Dashboard & Live Advice
                    </h2>
                </header>
                
                <BudgetMetrics metrics={metrics} />
                
                <section 
                    aria-label="Eco Advisor Chat Workspace"
                    style={{ flex: 1, backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}
                >
                    <ChatAssistant userContext={userContext} chatHistory={chatHistory} setChatHistory={setChatHistory} />
                </section>
            </main>
        </div>
    );
}

export default App;
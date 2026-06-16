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
        <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif', backgroundColor: '#f4f6f8', margin: 0 }}>
            {/* Left Column: Context Configuration */}
            <aside style={{ width: '320px', backgroundColor: '#ffffff', padding: '20px', borderRight: '1px solid #e0e0e0' }}>
                <h2 style={{ color: '#2e7d32', marginTop: 0 }}>🌱 Eco-Budget Advisor</h2>
                <hr style={{ border: 'none', height: '1px', backgroundColor: '#e0e0e0', margin: '15px 0' }} />
                <ContextForm userContext={userContext} setUserContext={setUserContext} />
            </aside>

            {/* Right Column: Key Results Display & Assistant Chat Workspace */}
            <main style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '20px' }}>
                <BudgetMetrics metrics={metrics} />
                <div style={{ flex: 1, marginTop: '20px', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <ChatAssistant userContext={userContext} chatHistory={chatHistory} setChatHistory={setChatHistory} />
                </div>
            </main>
        </div>
    );
}

export default App;
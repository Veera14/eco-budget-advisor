// src/components/BudgetMetrics.jsx
import React from 'react';

function BudgetMetrics({ metrics }) {
    const carbonLoad = parseFloat(metrics.currentCarbonKg) || 0;
    // Set a baseline target, e.g., 300 kg CO2 / month as a sustainable household target
    const sustainableTarget = 300;
    const percentageOfTarget = Math.min(Math.round((carbonLoad / sustainableTarget) * 100), 200);

    const getProgressBarColor = () => {
        if (percentageOfTarget <= 75) return 'var(--success)';
        if (percentageOfTarget <= 100) return '#eab308'; // Amber 500
        return 'var(--danger)';
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Grid of Metric Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                {/* Current Footprint Card */}
                <div style={{ backgroundColor: 'var(--bg-card)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', borderLeft: '5px solid var(--danger)', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Carbon Load</div>
                    <div style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text-main)', marginTop: '6px', fontFamily: 'var(--font-display)' }}>
                        {metrics.currentCarbonKg} <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-muted)' }}>kg CO₂/mo</span>
                    </div>
                </div>

                {/* Estimated Resource Cost Card */}
                <div style={{ backgroundColor: 'var(--bg-card)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', borderLeft: '5px solid var(--warning)', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Estimated Resource Cost</div>
                    <div style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text-main)', marginTop: '6px', fontFamily: 'var(--font-display)' }}>
                        ${metrics.currentCostDollars} <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-muted)' }}>/mo</span>
                    </div>
                </div>

                {/* Potential Carbon Saved Card */}
                <div style={{ backgroundColor: 'var(--primary-light)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', borderLeft: '5px solid var(--success)', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--primary-dark)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Potential Carbon Saved</div>
                    <div style={{ fontSize: '26px', fontWeight: '800', color: 'var(--success)', marginTop: '6px', fontFamily: 'var(--font-display)' }}>
                        -{metrics.potentialCarbonSaved} <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--primary-dark)' }}>kg</span>
                    </div>
                </div>

                {/* Potential Cash Saved Card */}
                <div style={{ backgroundColor: 'var(--primary-light)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', borderLeft: '5px solid var(--primary)', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--primary-dark)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Potential Cash Saved</div>
                    <div style={{ fontSize: '26px', fontWeight: '800', color: 'var(--primary-dark)', marginTop: '6px', fontFamily: 'var(--font-display)' }}>
                        +${metrics.potentialCashSaved} <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--primary-dark)' }}>/mo</span>
                    </div>
                </div>
            </div>

            {/* Target Alignment Progress Bar */}
            <div style={{ backgroundColor: 'var(--bg-card)', padding: '16px 20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)' }}>
                        Footprint vs. Target Limit ({sustainableTarget} kg CO₂/mo)
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: getProgressBarColor() }}>
                        {percentageOfTarget}%
                    </span>
                </div>
                <div 
                    style={{ width: '100%', height: '8px', backgroundColor: 'var(--border-color)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}
                    role="progressbar" 
                    aria-valuenow={carbonLoad} 
                    aria-valuemin="0" 
                    aria-valuemax={sustainableTarget}
                    aria-label="Carbon load relative to target limit"
                >
                    <div 
                        style={{ 
                            width: `${percentageOfTarget}%`, 
                            height: '100%', 
                            backgroundColor: getProgressBarColor(), 
                            borderRadius: 'var(--radius-full)',
                            transition: 'width 0.3s ease, background-color 0.3s ease' 
                        }} 
                    />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-light)', marginTop: '6px' }}>
                    <span>0 kg (Zero Carbon)</span>
                    <span>Sustainable Threshold ({sustainableTarget} kg)</span>
                </div>
            </div>
        </div>
    );
}

export default BudgetMetrics;
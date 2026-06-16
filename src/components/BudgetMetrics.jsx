// src/components/BudgetMetrics.jsx
import React from 'react';

function BudgetMetrics({ metrics }) {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>

            {/* Current Footprint Balances */}
            <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #e0e0e0', borderLeft: '5px solid #d32f2f' }}>
                <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#757575', textTransform: 'uppercase' }}>Current Carbon Load</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#212121', marginTop: '4px' }}>{metrics.currentCarbonKg} <span style={{ fontSize: '14px' }}>kg CO₂/mo</span></div>
            </div>

            <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #e0e0e0', borderLeft: '5px solid #f57c00' }}>
                <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#757575', textTransform: 'uppercase' }}>Estimated Resource Cost</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#212121', marginTop: '4px' }}>${metrics.currentCostDollars}</div>
            </div>

            {/* Target Savings Budgets */}
            <div style={{ backgroundColor: '#efebe9', padding: '16px', borderRadius: '8px', border: '1px solid #e0e0e0', borderLeft: '5px solid #388e3c' }}>
                <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#388e3c', textTransform: 'uppercase' }}>Potential Carbon Saved</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2e7d32', marginTop: '4px' }}>-{metrics.potentialCarbonSaved} <span style={{ fontSize: '14px' }}>kg</span></div>
            </div>

            <div style={{ backgroundColor: '#e8f5e9', padding: '16px', borderRadius: '8px', border: '1px solid #e0e0e0', borderLeft: '5px solid #2e7d32' }}>
                <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#2e7d32', textTransform: 'uppercase' }}>Potential Cash Saved</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1b5e20', marginTop: '4px' }}>+${metrics.potentialCashSaved} <span style={{ fontSize: '14px' }}>/mo</span></div>
            </div>

        </div>
    );
}

export default BudgetMetrics;
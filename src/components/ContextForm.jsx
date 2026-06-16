// src/components/ContextForm.jsx
import React from 'react';

const ContextForm = React.memo(({ userContext, setUserContext }) => {
    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserContext((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const inputStyle = {
        width: '100%',
        padding: '10px 12px',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--border-color)',
        fontSize: '14px',
        fontFamily: 'var(--font-body)',
        color: 'var(--text-main)',
        backgroundColor: '#ffffff',
        transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
        boxSizing: 'border-box',
    };

    return (
        <form 
            style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}
            onSubmit={(e) => e.preventDefault()}
            aria-label="Carbon context profile parameters"
        >
            <div>
                <label 
                    htmlFor="location" 
                    style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: 'var(--text-muted)' }}
                >
                    📍 Location / Region
                </label>
                <input
                    type="text"
                    id="location"
                    name="location"
                    value={userContext.location}
                    onChange={handleChange}
                    placeholder="e.g., California, Berlin, Tokyo"
                    style={inputStyle}
                    aria-describedby="location-help"
                />
                <span id="location-help" style={{ display: 'block', fontSize: '11px', color: 'var(--text-light)', marginTop: '4px' }}>
                    Used to estimate localized grid emission intensity.
                </span>
            </div>

            <div>
                <label 
                    htmlFor="monthlyKwh" 
                    style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: 'var(--text-muted)' }}
                >
                    ⚡ Monthly Energy Bill (kWh)
                </label>
                <input
                    type="number"
                    id="monthlyKwh"
                    name="monthlyKwh"
                    value={userContext.monthlyKwh}
                    onChange={handleChange}
                    placeholder="e.g., 350"
                    min="0"
                    style={inputStyle}
                    aria-describedby="monthlyKwh-help"
                />
                <span id="monthlyKwh-help" style={{ display: 'block', fontSize: '11px', color: 'var(--text-light)', marginTop: '4px' }}>
                    Total grid electricity consumed per month.
                </span>
            </div>

            <div>
                <label 
                    htmlFor="commuteDistance" 
                    style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: 'var(--text-muted)' }}
                >
                    🚗 Daily Commute (km - One Way)
                </label>
                <input
                    type="number"
                    id="commuteDistance"
                    name="commuteDistance"
                    value={userContext.commuteDistance}
                    onChange={handleChange}
                    placeholder="e.g., 25"
                    min="0"
                    style={inputStyle}
                    aria-describedby="commuteDistance-help"
                />
                <span id="commuteDistance-help" style={{ display: 'block', fontSize: '11px', color: 'var(--text-light)', marginTop: '4px' }}>
                    Typical commute distance for work or school.
                </span>
            </div>

            <div>
                <label 
                    htmlFor="vehicleType" 
                    style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: 'var(--text-muted)' }}
                >
                    🚙 Primary Mode of Transport
                </label>
                <select
                    id="vehicleType"
                    name="vehicleType"
                    value={userContext.vehicleType}
                    onChange={handleChange}
                    style={{ ...inputStyle, cursor: 'pointer' }}
                    aria-describedby="vehicleType-help"
                >
                    <option value="petrol">Petrol Passenger Car</option>
                    <option value="diesel">Diesel Passenger Car</option>
                    <option value="ev">Electric Vehicle (EV)</option>
                    <option value="publicTransit">Bus / Train Transit</option>
                </select>
                <span id="vehicleType-help" style={{ display: 'block', fontSize: '11px', color: 'var(--text-light)', marginTop: '4px' }}>
                    Determines your specific transport carbon emission factor.
                </span>
            </div>
        </form>
    );
});

ContextForm.displayName = 'ContextForm';

export default ContextForm;
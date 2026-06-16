// src/components/ContextForm.jsx
import React from 'react';

function ContextForm({ userContext, setUserContext }) {
    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserContext((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
                <label htmlFor="location" style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', fontSize: '14px', color: '#424242' }}>
                    📍 Your Location / Region
                </label>
                <input
                    type="text"
                    id="location"
                    name="location"
                    value={userContext.location}
                    onChange={handleChange}
                    placeholder="e.g., California, Berlin, Tokyo"
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                />
            </div>

            <div>
                <label htmlFor="monthlyKwh" style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', fontSize: '14px', color: '#424242' }}>
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
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                />
            </div>

            <div>
                <label htmlFor="commuteDistance" style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', fontSize: '14px', color: '#424242' }}>
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
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                />
            </div>

            <div>
                <label htmlFor="vehicleType" style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', fontSize: '14px', color: '#424242' }}>
                    🚙 Primary Mode of Transport
                </label>
                <select
                    id="vehicleType"
                    name="vehicleType"
                    value={userContext.vehicleType}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', backgroundColor: '#fff', boxSizing: 'border-box' }}
                >
                    <option value="petrol">Petrol Passenger Car</option>
                    <option value="diesel">Diesel Passenger Car</option>
                    <option value="ev">Electric Vehicle (EV)</option>
                    <option value="publicTransit">Bus / Train Transit</option>
                </select>
            </div>
        </div>
    );
}

export default ContextForm;
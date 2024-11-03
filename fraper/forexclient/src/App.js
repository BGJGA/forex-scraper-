
import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
    const [currencyPair, setCurrencyPair] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [averageRate, setAverageRate] = useState(null);
    const [closingRate, setClosingRate] = useState(null);
    const [error, setError] = useState('');

    const getAverageRate = async () => {
        // Basic input validation
        if (!currencyPair || !startDate || !endDate) {
            setError('Please provide currency pair, start date, and end date.');
            return;
        }

        try {
            const response = await axios.get('http://localhost:5000/api/rate/average', {
                params: {
                    pair: currencyPair,
                    startDate: startDate,
                    endDate: endDate,
                },
            });
            setAverageRate(response.data);
            setError(''); // Clear any previous errors
        } catch (err) {
            setError('Error fetching average rate: ' + (err.response?.data || err.message));
        }
    };

    const getClosingRate = async () => {
        // Basic input validation
        if (!currencyPair || !endDate) {
            setError('Please provide currency pair and end date.');
            return;
        }

        try {
            const response = await axios.get('http://localhost:5000/api/rate/closing', {
                params: {
                    pair: currencyPair,
                    date: endDate,
                },
            });
            setClosingRate(response.data);
            setError(''); // Clear any previous errors
        } catch (err) {
            setError('Error fetching closing rate: ' + (err.response?.data || err.message));
        }
    };

    return (
        <div className='vb'>
            <h1>Forex Rate Tracker</h1><label for cur>Currency Pair</label>
            <input type='text' id='cur'
                placeholder="Enter the Currency Pair like USD/INR"
                onChange={(e) => setCurrencyPair(e.target.value)}
            />
            <label for st>Start Date</label>
            <input
                type="date" id='st'
                onChange={(e) => setStartDate(e.target.value)}
            />
            <label for en>End Date</label>
            <input
                type="date" id='en'
                onChange={(e) => setEndDate(e.target.value)}
            />
            <button onClick={getAverageRate}>Get Average Rate</button>
            <button onClick={getClosingRate}>Get Closing Rate</button>
            <div>
                {error && <h3 style={{ color: 'red' }}>{error}</h3>}
                <h2>Average Rate: {averageRate && JSON.stringify(averageRate)}</h2>
                <h2>Closing Rate: {closingRate && JSON.stringify(closingRate)}</h2>
            </div>
        </div>
    );
};

export default App

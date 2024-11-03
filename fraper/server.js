// Import necessary modules
const express = require('express');
const axios = require('axios');
const { Sequelize, DataTypes } = require('sequelize');
const schedule = require('node-schedule');
const cors = require('cors');

// Initialize Express
const app = express();
app.use(cors());
app.use(express.json());

// Set up PostgreSQL connection
const sequelize = new Sequelize('forex_rates', 'postgres', '2001', {
    host: 'localhost',
    dialect: 'postgres',
});

// Define a CurrencyRate model
const CurrencyRate = sequelize.define('CurrencyRate', {
    pair: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    rate: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
});

// Sync the model with the database
sequelize.sync();

// Scraping function with new API
const scrapeRates = async () => {
    try {
        const apiKey = 'cur_live_e2MTldRRAoZDe60xJq9tDKVZ69VTxoTCIKyjly9u';
        const url = 'https://api.currencyapi.com/v3/latest?apikey=${apiKey}';
        const response = await axios.get(url);
        
        // Assuming the response format provides rates in response.data.data
        const rates = response.data.data;
        const date = new Date();

        for (const currency in rates) {
            const pair = `USD/${currency}`;
            const rate = rates[currency].value;
            await CurrencyRate.create({ pair, rate, date });
            console.log('Stored rate for ${pair} - Rate: ${rate}');
        }

        console.log("Data scraped and inserted.");
    } catch (error) {
        console.error('Error scraping rates:', error);
    }
};

// Endpoint to manually trigger scraping
app.get('/api/rate/scrape', async (req, res) => {
    await scrapeRates();
    res.json({ message: "Data scraped and inserted." });
});

// Schedule scraping every day at 6 AM
schedule.scheduleJob('0 6 * * *', scrapeRates);

// API endpoints
app.get('/api/rate/average', async (req, res) => {
    const { pair, startDate, endDate } = req.query;

    try {
        const averageRate = await CurrencyRate.findAll({
            where: {
                pair,
                date: {
                    [Sequelize.Op.between]: [new Date(startDate), new Date(endDate)],
                },
            },
            attributes: [[Sequelize.fn('AVG', Sequelize.col('rate')), 'average']],
        });

        res.json(averageRate);
    } catch (error) {
        console.error('Error fetching average rate:', error);
        res.status(500).json({ error: 'Error fetching average rate' });
    }
});

app.get('/api/rate/closing', async (req, res) => {
    const { pair, date } = req.query;

    try {
        const closingRate = await CurrencyRate.findOne({
            where: {
                pair,
                date: {
                    [Sequelize.Op.eq]: new Date(date),
                },
            },
        });

        if (closingRate) {
            res.json(closingRate);
        } else {
            res.json({ message: 'No data available for the given date.' });
        }
    } catch (error) {
        console.error('Error fetching closing rate:', error);
        res.status(500).json({ error: 'Error fetching closing rate' });
    }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log('Server running on port ${PORT}');
});

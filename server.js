const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

const routes = require('./routes');

app.use('/api', routes); 

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
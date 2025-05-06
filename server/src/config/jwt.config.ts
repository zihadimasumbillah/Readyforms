import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get JWT settings from environment variables with fallback values
const JWT_SECRET = process.env.JWT_SECRET || '19e0260abefbad542c10cee4e836e1c609ae1c497913b1f962c3231cebc12636da92e757874a9f2fc896e70eff2600865188a1df338ae40e5062e614e0a924bc';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export { JWT_SECRET, JWT_EXPIRES_IN };
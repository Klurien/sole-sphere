import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Only log and load .env if not on Vercel
if (!process.env.VERCEL) {
    dotenv.config({ path: path.join(__dirname, '../.env') });
    console.log('Environment variables loaded from', path.join(__dirname, '../.env'));
    console.log('JWT_SECRET available:', !!process.env.JWT_SECRET);
}

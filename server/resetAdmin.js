import './loadEnv.js';
import bcrypt from 'bcryptjs';
import db, { initDB } from './db/db.js';

const reset = async () => {
    try {
        await initDB();

        const username = 'admin';
        const password = 'password';
        const role = 'admin';

        const hashedPassword = await bcrypt.hash(password, 10);
        const [existing] = await db.query('SELECT * FROM users WHERE username = ?', [username]);

        if (existing.length > 0) {
            await db.execute('UPDATE users SET password = ?, role = ? WHERE username = ?', [hashedPassword, role, username]);
            console.log('✅ Admin user password reset successfully.');
        } else {
            await db.execute('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, hashedPassword, role]);
            console.log('✅ Admin user created successfully!');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error resetting admin:', error);
        process.exit(1);
    }
};

reset();

import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import fs from 'fs';

dotenv.config();

// ─── Determine which database backend to use ─────────────────────────────────
// If TIDB_HOST is configured, use TiDB (mysql2). Otherwise, fall back to local SQLite.
const USE_TIDB = !!process.env.TIDB_HOST;

let dbWrapper = null;
let dbInitPromise = null;

async function setupDbWrapper() {
  if (dbWrapper) return dbWrapper;

  if (USE_TIDB) {
    // ═══════════════════════════════════════════════════════════════════════════
    //  TiDB / MySQL Backend (Production / Vercel)
    // ═══════════════════════════════════════════════════════════════════════════
    const mysql = await import('mysql2/promise');

    let sslConfig = {
      minVersion: 'TLSv1.2',
      rejectUnauthorized: true
    };

    if (process.env.TIDB_SSL_CA) {
      try {
        const caPath = process.env.TIDB_SSL_CA;
        if (caPath.startsWith('-----BEGIN CERTIFICATE-----')) {
          sslConfig.ca = caPath;
        } else {
          // On Vercel, the CA cert may be at a different path
          let finalPath = caPath;
          if (process.env.VERCEL && !fs.existsSync(caPath)) {
            finalPath = '/etc/ssl/certs/ca-certificates.crt';
          }
          sslConfig.ca = fs.readFileSync(finalPath);
        }
      } catch (err) {
        console.error('⚠️ Could not load TIDB_SSL_CA certificate:', err.message);
        // Continue without CA — some environments don't need it
      }
    }

    const mysqlModule = mysql.default || mysql;
    const targetDb = (process.env.TIDB_DATABASE && process.env.TIDB_DATABASE !== 'sys')
      ? process.env.TIDB_DATABASE
      : 'test';

    const poolConfig = {
      host: process.env.TIDB_HOST || 'gateway01.ap-northeast-1.prod.aws.tidbcloud.com',
      port: process.env.TIDB_PORT || 4000,
      user: process.env.TIDB_USER || '4Wz4gq5r3oZkJkB.root',
      password: process.env.TIDB_PASSWORD || 'zCEvQHWA93xMpKYk',
      ssl: sslConfig,
      database: targetDb,
      waitForConnections: true,
      connectionLimit: 10,
      maxIdle: 10,
      idleTimeout: 60000,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0
    };

    const pool = mysqlModule.createPool(poolConfig);
    console.log(`🚀 TiDB Connection Pool Created for database: ${targetDb}`);

    dbWrapper = {
      _pool: pool,
      async query(sql, params = []) {
        return await pool.query(sql, params);
      },
      async execute(sql, params = []) {
        return await pool.execute(sql, params);
      },
      async getConnection() {
        return await pool.getConnection();
      }
    };
  } else {
    // ═══════════════════════════════════════════════════════════════════════════
    //  SQLite Backend (Local Development)
    // ═══════════════════════════════════════════════════════════════════════════
    const Database = (await import('better-sqlite3')).default;
    const pathMod = await import('path');
    const { fileURLToPath } = await import('url');

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = pathMod.dirname(__filename);
    const dbPath = pathMod.join(__dirname, 'ecommerce.db');

    const sqlite = new Database(dbPath);
    sqlite.pragma('journal_mode = WAL');
    sqlite.pragma('foreign_keys = ON');
    console.log(`🗄️  SQLite Database opened at ${dbPath}`);

    dbWrapper = {
      _sqlite: sqlite,
      async query(sql, params = []) {
        const translatedSql = translateSql(sql);
        const command = translatedSql.trim().split(/\s/)[0].toUpperCase();
        if (command === 'SELECT' || command === 'SHOW') {
          const rows = sqlite.prepare(translatedSql).all(...params);
          return [rows, []];
        }
        const result = sqlite.prepare(translatedSql).run(...params);
        return [{ affectedRows: result.changes, insertId: Number(result.lastInsertRowid) }, []];
      },
      async execute(sql, params = []) {
        return this.query(sql, params);
      },
      async getConnection() {
        return {
          query: async (sql, params = []) => this.query(sql, params),
          execute: async (sql, params = []) => this.execute(sql, params),
          release: () => { }
        };
      }
    };
  }
  return dbWrapper;
}

// ─── SQL Translation (MySQL → SQLite) ────────────────────────────────────────
function translateSql(sql) {
  let s = sql;
  s = s.replace(/INT\s+AUTO_INCREMENT\s+PRIMARY\s+KEY/gi, 'INTEGER PRIMARY KEY AUTOINCREMENT');
  s = s.replace(/VARCHAR\s*\(\d+\)/gi, 'TEXT');
  s = s.replace(/DECIMAL\s*\(\d+\s*,\s*\d+\)/gi, 'REAL');
  s = s.replace(/TINYINT\s*\(\d+\)/gi, 'INTEGER');
  s = s.replace(/TIMESTAMP\s+DEFAULT\s+CURRENT_TIMESTAMP/gi, 'TEXT DEFAULT CURRENT_TIMESTAMP');
  s = s.replace(/GREATEST\s*\(/gi, 'MAX(');
  return s;
}

// ─── Table Initialization ────────────────────────────────────────────────────
export const initDB = async () => {
  await setupDbWrapper();
  console.log('Initializing Database Tables...');

  if (!dbWrapper) {
    throw new Error('Database wrapper failed to initialize');
  }

  const tables = [
    `CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            role VARCHAR(50) DEFAULT 'user',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
    `CREATE TABLE IF NOT EXISTS merchants (
            id INT AUTO_INCREMENT PRIMARY KEY,
            owner_email VARCHAR(255) NOT NULL,
            store_name VARCHAR(100) NOT NULL,
            tenant_id VARCHAR(100) UNIQUE NOT NULL,
            vercel_url VARCHAR(512),
            status VARCHAR(50) DEFAULT 'pending',
            setup_fee_paid BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
    `CREATE TABLE IF NOT EXISTS transactions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            merchant_id INT NOT NULL,
            amount DECIMAL(12,2) NOT NULL,
            currency VARCHAR(10) DEFAULT 'KES',
            transaction_type VARCHAR(50) NOT NULL,
            status VARCHAR(50) DEFAULT 'pending',
            external_ref VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (merchant_id) REFERENCES merchants(id)
        )`,
    `CREATE TABLE IF NOT EXISTS payouts (
            id INT AUTO_INCREMENT PRIMARY KEY,
            merchant_id INT NOT NULL,
            amount DECIMAL(12,2) NOT NULL,
            payout_method VARCHAR(50) DEFAULT 'M-PESA',
            recipient_phone VARCHAR(20) NOT NULL,
            payout_status VARCHAR(50) DEFAULT 'requested',
            processed_at TIMESTAMP,
            FOREIGN KEY (merchant_id) REFERENCES merchants(id)
        )`,
    `CREATE TABLE IF NOT EXISTS categories (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
    `CREATE TABLE IF NOT EXISTS products (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            price DECIMAL(12,2) NOT NULL,
            category VARCHAR(100),
            brand VARCHAR(100),
            size VARCHAR(50),
            color VARCHAR(50),
            material VARCHAR(100),
            condition VARCHAR(50),
            stock INT DEFAULT 0,
            image_url VARCHAR(512),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
    `CREATE TABLE IF NOT EXISTS product_images (
            id INT AUTO_INCREMENT PRIMARY KEY,
            product_id INT NOT NULL,
            url VARCHAR(512) NOT NULL,
            sort_order INT DEFAULT 0,
            FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
        )`,
    `CREATE TABLE IF NOT EXISTS promotions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255),
            subtitle VARCHAR(255),
            image_url VARCHAR(512),
            link VARCHAR(512),
            active TINYINT(1) DEFAULT 1,
            sort_order INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
    `CREATE TABLE IF NOT EXISTS orders (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT,
            total_amount DECIMAL(10,2) NOT NULL,
            status VARCHAR(50) DEFAULT 'Processing',
            shipping_address TEXT,
            payment_intent_id VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
        )`,
    `CREATE TABLE IF NOT EXISTS order_items (
            id INT AUTO_INCREMENT PRIMARY KEY,
            order_id INT NOT NULL,
            product_id INT NOT NULL,
            quantity INT NOT NULL DEFAULT 1,
            price_at_purchase DECIMAL(10,2) NOT NULL,
            FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
            FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
        )`,
    `CREATE TABLE IF NOT EXISTS site_stats (
            id INT AUTO_INCREMENT PRIMARY KEY,
            stat_name VARCHAR(100) UNIQUE NOT NULL,
            stat_value INT DEFAULT 0,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
    `CREATE TABLE IF NOT EXISTS site_config (
            id INT AUTO_INCREMENT PRIMARY KEY,
            config_name VARCHAR(100) UNIQUE NOT NULL,
            config_value TEXT,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
  ];

  if (USE_TIDB) {
    const conn = await dbWrapper.getConnection();
    try {
      for (let sql of tables) {
        await conn.query(sql);
      }

      // Ensure nova admin user exists
      try {
        const [existing] = await conn.query('SELECT * FROM users WHERE username = ?', ['nova']);
        if (existing.length === 0) {
          const hashedPassword = await bcrypt.hash('nova', 10);
          await conn.execute('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', ['nova', hashedPassword, 'admin']);
        }

        // Ensure visitors counter exists
        const [statExists] = await conn.query('SELECT * FROM site_stats WHERE stat_name = ?', ['visitors']);
        if (statExists.length === 0) {
          await conn.execute('INSERT INTO site_stats (stat_name, stat_value) VALUES (?, ?)', ['visitors', 0]);
        }

        // Ensure default categories exist
        const [catsExist] = await conn.query('SELECT COUNT(*) as c FROM categories');
        if (catsExist[0].c === 0) {
          const defaults = ['Lifestyle', 'Basketball', 'Running', 'Streetwear', 'Limited Edition'];
          for (let name of defaults) {
            await conn.execute('INSERT INTO categories (name) VALUES (?)', [name]);
          }
        }

        // Ensure whatsapp_number exists in config
        const [configExists] = await conn.query('SELECT * FROM site_config WHERE config_name = ?', ['whatsapp_number']);
        if (configExists.length === 0) {
          await conn.execute('INSERT INTO site_config (config_name, config_value) VALUES (?, ?)', ['whatsapp_number', '254700000000']);
        }

        console.log('✅ nova admin and site stats initialized.');
      } catch (adminErr) {
        console.error('Error during initDB additions:', adminErr.message);
      }

      console.log('✅ TiDB Tables Initialized.');
    } finally {
      conn.release();
    }
  } else {
    // SQLite path — use the wrapper directly
    for (let sql of tables) {
      await dbWrapper.query(sql);
    }

    // Ensure nova admin user exists
    try {
      const [existing] = await dbWrapper.query('SELECT * FROM users WHERE username = ?', ['nova']);
      if (existing.length === 0) {
        const hashedPassword = await bcrypt.hash('nova', 10);
        await dbWrapper.execute('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', ['nova', hashedPassword, 'admin']);
      }
      // Ensure default categories exist
      const [catsExist] = await dbWrapper.query('SELECT COUNT(*) as c FROM categories');
      if (catsExist[0].c === 0) {
        const defaults = ['Lifestyle', 'Basketball', 'Running', 'Streetwear', 'Limited Edition'];
        for (let name of defaults) {
          await dbWrapper.execute('INSERT INTO categories (name) VALUES (?)', [name]);
        }
      }

      console.log('✅ nova admin user ensured.');
    } catch (adminErr) {
      console.error('Error ensuring nova admin:', adminErr.message);
    }

    console.log('✅ SQLite Tables Initialized.');
  }
};

// Initialize once - store result so failed init doesn't permanently break routes
let initError = null;
dbInitPromise = initDB().catch(err => {
  console.error('DATABASE INIT ERROR:', err.message);
  initError = err;
  // Do NOT re-throw — allow routes to still attempt queries (the pool may still work)
});

export default {
  query: async (...args) => {
    await dbInitPromise;
    if (!dbWrapper) throw new Error('Database not initialized: ' + (initError?.message || 'unknown'));
    return dbWrapper.query(...args);
  },
  execute: async (...args) => {
    await dbInitPromise;
    if (!dbWrapper) throw new Error('Database not initialized: ' + (initError?.message || 'unknown'));
    return dbWrapper.execute(...args);
  },
  getConnection: async () => {
    await dbInitPromise;
    if (!dbWrapper) throw new Error('Database not initialized: ' + (initError?.message || 'unknown'));
    return dbWrapper.getConnection();
  }
};

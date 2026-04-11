import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TENANTS_FILE = path.join(__dirname, 'tenants.json');
const USERS_FILE = path.join(__dirname, 'users.json');

const app = express();
app.use(cors());
app.use(express.json());

/**
 * GHOST IDENTITY SYSTEM
 */
app.post('/api/auth/identify', async (req, res) => {
  const { email } = req.body;
  const users = await fs.readJson(USERS_FILE).catch(() => ({}));
  if (!users[email]) {
    users[email] = { stores: [] };
    await fs.writeJson(USERS_FILE, users);
  }
  res.json({ success: true, stores: users[email].stores });
});

/**
 * THE FACTORY ENDPOINT
 */
app.post('/api/deploy', async (req, res) => {
  const { storeName, template, theme, primaryColor, accentColor, ownerEmail } = req.body;

  const tenantId = storeName.toLowerCase().replace(/\s+/g, '-');

  // 1. SAVE TO LOCAL DATABASE (The "Institutional" Source of Truth)
  const tenants = await fs.readJson(TENANTS_FILE).catch(() => []);
  const newTenant = {
    id: tenantId,
    storeName,
    template,
    theme,
    primaryColor,
    accentColor,
    deployedAt: new Date().toISOString()
  };
  
  // Update or Add
  const existingIdx = tenants.findIndex(t => t.id === tenantId);
  if (existingIdx > -1) tenants[existingIdx] = newTenant;
  else tenants.push(newTenant);
  
  await fs.writeJson(TENANTS_FILE, tenants, { spaces: 2 });

  // 1b. Associate with User
  if (ownerEmail) {
    const users = await fs.readJson(USERS_FILE).catch(() => ({}));
    if (!users[ownerEmail]) users[ownerEmail] = { stores: [] };
    if (!users[ownerEmail].stores.includes(tenantId)) {
      users[ownerEmail].stores.push(tenantId);
    }
    await fs.writeJson(USERS_FILE, users);
  }

  // 2. VERCEL INTEGRATION (Optional)
  try {
    const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
    if (VERCEL_TOKEN && VERCEL_TOKEN !== 'your_vercel_token_here') {
      // (Vercel logic remains here)
    }
  } catch (e) {
    console.warn('Vercel deployment failed, falling back to local simulation.');
  }


  // 3. RETURN LOCAL PREVIEW URL
  res.json({ 
    success: true, 
    url: `http://localhost:3002/?tenantId=${tenantId}` 
  });
});



/**
 * THE EDITING ENDPOINT
 * Allows AI-driven modification of existing stores.
 */
app.post('/api/edit', async (req, res) => {
  const { tenantId, updates } = req.body;
  console.log(`GHOST: Editing tenant ${tenantId}`, updates);

  try {
    const tenants = await fs.readJson(TENANTS_FILE).catch(() => []);
    const idx = tenants.findIndex(t => t.id === tenantId);
    
    if (idx === -1) return res.status(404).json({ error: 'Store not found' });

    // Merge updates
    tenants[idx] = { ...tenants[idx], ...updates, updatedAt: new Date().toISOString() };
    await fs.writeJson(TENANTS_FILE, tenants, { spaces: 2 });

    res.json({ success: true, message: 'Store optimized by AI' });
  } catch (error) {
    res.status(500).json({ error: 'Edit failed' });
  }
});

/**
 * WHATSAPP SIMULATOR (Automation Engine)
 * Mock endpoint for the "No-Dash" management.
 */
app.post('/api/automation/whatsapp', async (req, res) => {
  const { message, sender } = req.body;
  console.log(`WHATSAPP: Received message from ${sender}: "${message}"`);

  // Simulate AI parsing of WhatsApp command
  if (message.toLowerCase().includes('add product')) {
    return res.json({ 
      success: true, 
      action: 'PRODUCT_ADDED',
      details: 'Nike Air Max added with AI-generated description.' 
    });
  }
  return res.json({ success: true, action: 'LOGGED' });
});

/**
 * MULTI-TENANT PRODUCT MANAGEMENT
 */
app.get('/api/tenants/:id/products', async (req, res) => {
  const { id } = req.params;
  try {
    const tenants = await fs.readJson(TENANTS_FILE).catch(() => []);
    const tenant = tenants.find(t => t.id === id);
    if (!tenant) return res.status(404).json({ error: 'Store not found' });
    
    // Return tenant's products or empty list
    res.json({ products: tenant.products || [], total: (tenant.products || []).length });
  } catch (error) {
    res.status(500).json({ error: 'Fetch failed' });
  }
});

app.post('/api/tenants/:id/products', async (req, res) => {
  const { id } = req.params;
  const product = req.body;
  
  try {
    const tenants = await fs.readJson(TENANTS_FILE).catch(() => []);
    const idx = tenants.findIndex(t => t.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Store not found' });

    // Add unique ID and timestamps
    const newProduct = {
      ...product,
      id: `p-${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    tenants[idx].products = [...(tenants[idx].products || []), newProduct];
    await fs.writeJson(TENANTS_FILE, tenants, { spaces: 2 });

    res.json({ success: true, product: newProduct });
  } catch (error) {
    res.status(500).json({ error: 'Product addition failed' });
  }
});

// Bridge for storefronts to fetch products simply
app.get('/api/products', async (req, res) => {
  const tenantId = req.query.tenantId || req.headers['x-tenant-id'];
  if (!tenantId) return res.status(400).json({ error: 'Missing Tenant ID' });
  
  try {
    const tenants = await fs.readJson(TENANTS_FILE).catch(() => []);
    const tenant = tenants.find(t => t.id === tenantId);
    if (!tenant) return res.json({ products: [], total: 0 }); // Fallback
    
    res.json({ products: tenant.products || [], total: (tenant.products || []).length });
  } catch (error) {
    res.status(500).json({ error: 'Fetch failed' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  const tenantId = req.query.tenantId || req.headers['x-tenant-id'];
  
  if (!tenantId) return res.status(400).json({ error: 'Missing Tenant ID' });

  try {
    const tenants = await fs.readJson(TENANTS_FILE).catch(() => []);
    const tenant = tenants.find(t => t.id === tenantId);
    if (!tenant) return res.status(404).json({ error: 'Store not found' });
    
    const product = (tenant.products || []).find(p => p.id === id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Fetch failed' });
  }
});

const PORT = 3001;

app.listen(PORT, () => console.log(`Vuka Factory running on port ${PORT}`));

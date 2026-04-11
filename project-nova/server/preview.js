import express from 'express';
import cors from 'cors';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TENANTS_FILE = path.join(__dirname, 'tenants.json');

const app = express();
app.use(cors());

// THE MAGIC SKINNING
app.get('/', async (req, res) => {
  const { tenantId } = req.query;
  const tenants = await fs.readJson(TENANTS_FILE).catch(() => []);
  const tenant = tenants.find(t => t.id === tenantId);

  if (!tenant) {
    return res.status(404).send('Store not found. Please generate one first.');
  }

  // Serve the Sneaker Template but with INJECTED CONFIG
  // Note: For now, we'll serve a cinematic 'Materializing' page and then redirect to the actual template.
  // In a full implementation, we'd proxy the template and inject a script.
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${tenant.storeName} | Vuka Magic</title>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;800&display=swap" rel="stylesheet">
        <style>
          body { background: #000; color: #fff; font-family: 'Outfit', sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
          .container { text-align: center; }
          h1 { font-size: 3rem; margin-bottom: 20px; }
          .badge { background: ${tenant.accentColor}; color: #000; padding: 8px 16px; border-radius: 100px; font-weight: 800; }
          .btn { display: inline-block; margin-top: 40px; padding: 20px 40px; background: #fff; color: #000; text-decoration: none; border-radius: 100px; font-weight: 800; font-size: 1.2rem; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="badge">${tenant.template.toUpperCase()} STORE</div>
          <h1>${tenant.storeName}</h1>
          <p>This store is fully materialized on the Vuka Edge.</p>
          <a href="http://localhost:5173/?vuka_store=${tenantId}&storeName=${encodeURIComponent(tenant.storeName)}&accentColor=${encodeURIComponent(tenant.accentColor)}" class="btn">Enter Showroom</a>
        </div>
        <script>

          // In the real multi-tenant version, this config would be read by the 
          // Sneakers template to change the name, colors, and products.
          localStorage.setItem('VUKA_CONFIG', JSON.stringify(${JSON.stringify(tenant)}));
        </script>
      </body>
    </html>
  `);
});

const PORT = 3002;
app.listen(PORT, () => console.log(`Vuka Preview Runner active on port ${PORT}`));

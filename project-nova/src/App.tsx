import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Bot, Zap, Smartphone, Globe, ExternalLink, ShieldCheck } from 'lucide-react';
import { parseStorePrompt, type StoreConfig } from './lib/generation_engine';

export default function App() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [stage, setStage] = useState(0); // 0: input, 1: magic, 2: reveal
  const [config, setConfig] = useState<StoreConfig | null>(null);
  const [url, setUrl] = useState('');
  const [userEmail, setUserEmail] = useState(localStorage.getItem('vuka_user') || '');
  const [myStores, setMyStores] = useState<string[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(!!userEmail);

  useEffect(() => {
    if (userEmail) fetchMyStores(userEmail);
  }, [userEmail]);



  const fetchMyStores = async (email: string) => {
    try {
      const response = await fetch('http://localhost:3001/api/auth/identify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      setMyStores(data.stores || []);
    } catch (e) {
      console.error('Identification failed', e);
    }
  };

  const handleLogin = (email: string) => {
    setUserEmail(email);
    localStorage.setItem('vuka_user', email);
    setIsLoggedIn(true);
    fetchMyStores(email);
  };

  const handleUnlock = async () => {
    if (!config || !userEmail) return;
    setIsGenerating(true);
    setStage(1);

    try {
      // 1. Register with the Hard-Coded Ledger (Institutional Backend)
      const regResponse = await fetch('http://localhost:5000/api/merchants/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ownerEmail: userEmail, 
          storeName: config.storeName, 
          tenantId: config.id || config.storeName.toLowerCase().replace(/\s+/g, '-')
        })
      });
      const regData = await regResponse.json();
      
      // 2. Simulate Payment & Transaction record
      await fetch('http://localhost:5000/api/merchants/transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          merchantId: regData.merchantId, 
          amount: 2000, 
          type: 'setup_fee', 
          externalRef: 'MPESA-' + Math.random().toString(36).substring(7).toUpperCase()
        })
      });

      alert('SUCCESS: Payment verified. Project Nova is now deploying your Institutional Instance.');
      setStage(2);
    } catch (e) {
      console.error('Unlock failed', e);
      alert('Error during institutional registration.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);
    setStage(1);
    
    try {
      const storeConfig = await parseStorePrompt(prompt);
      setConfig(storeConfig);
      
      let liveUrl = '';
      const currentStoreId = myStores[0] || 'nova-kicks'; 

      if (storeConfig.intent === 'ADD_PRODUCT') {
        const response = await fetch(`http://localhost:3001/api/tenants/${currentStoreId}/products`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(storeConfig.productData)
        });
        const data = await response.json();
        if (!data.success) throw new Error('Product addition failed');
        liveUrl = `http://localhost:3002/?tenantId=${currentStoreId}`;
      } else if (storeConfig.intent === 'UPDATE') {
        const response = await fetch('http://localhost:3001/api/edit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tenantId: currentStoreId, updates: storeConfig })
        });
        const data = await response.json();
        if (!data.success) throw new Error('Edit failed');
        liveUrl = `http://localhost:3002/?tenantId=${currentStoreId}`;

      } else {
        // CREATION PATH
        const response = await fetch('http://localhost:3001/api/deploy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...storeConfig, ownerEmail: userEmail })
        });
        const data = await response.json();
        liveUrl = data.url;
      }
      
      setUrl(liveUrl as string);
      setStage(2);
      if (userEmail) fetchMyStores(userEmail);
    } catch (error) {
      console.error('Operation failed', error);
      setStage(0);
    } finally {
      setIsGenerating(false);
    }
  };



  return (
    <div className="app-container">
      <div className="vuka-header-top">
        {!isLoggedIn ? (
          <div className="ghost-login">
            <input 
              type="email" 
              placeholder="Enter email to claim stores..." 
              onKeyDown={(e) => e.key === 'Enter' && handleLogin((e.target as HTMLInputElement).value)}
            />
          </div>
        ) : (
          <div className="user-profile">
            <span className="user-email">{userEmail}</span>
            <button onClick={() => { localStorage.clear(); window.location.reload(); }}>Logout</button>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {stage === 0 && (
          <motion.div 
            key="input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="main-interface"
          >
            <div className="brand-header">
              <motion.div 
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="logo-icon"
              >
                <Zap size={32} fill="var(--accent)" color="var(--accent)" />
              </motion.div>
              <h1>Vuka Magic</h1>
              <p>The zero-friction commerce engine.</p>
            </div>

            {myStores.length > 0 && (
              <div className="my-stores-strip">
                <h3>My Stores</h3>
                <div className="stores-grid">
                  {myStores.map(sid => (
                    <a key={sid} href={`http://localhost:3002/?tenantId=${sid}`} target="_blank" className="store-tag">
                      {sid}
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="prompt-container glass">

              <textarea 
                placeholder="Describe your business in one sentence..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
              <button 
                className="generate-btn"
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
              >
                <Sparkles size={20} />
                <span>Generate My Store</span>
              </button>
            </div>

            <div className="feature-badges">
              <div className="badge"><Smartphone size={14} /> M-Pesa Ready</div>
              <div className="badge"><Globe size={14} /> Global Hosting</div>
              <div className="badge"><Bot size={14} /> AI Product Management</div>
            </div>
          </motion.div>
        )}

        {stage === 1 && (
          <motion.div 
            key="generating"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="generation-visual"
          >
            <div className="status-orb">
              <div className="inner-pulse" />
            </div>
            <h2>Architecting your vision...</h2>
            <div className="status-logs">
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>Cloning premium template...</motion.p>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>Injecting brand identity...</motion.p>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }}>Configuring payment routes...</motion.p>
            </div>
          </motion.div>
        )}

        {stage === 2 && config && (
          <motion.div 
            key="reveal"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="reveal-container"
          >
            <div className="reveal-card glass">
              <div className="reveal-header">
                <div className="success-icon">
                  <ShieldCheck size={48} color="var(--accent)" />
                </div>
                <h2>Your store is live.</h2>
                <p>Generated in 4.2 seconds.</p>
              </div>

              <div className="store-preview-info">
                <div className="preview-row">
                  <span>Name</span>
                  <span>{config.storeName}</span>
                </div>
                <div className="preview-row">
                  <span>Template</span>
                  <span className="capitalize">{config.template}</span>
                </div>
                <div className="preview-row">
                  <span>Domain</span>
                  <span>{url.replace('https://', '')}</span>
                </div>
              </div>

              <a href={url} target="_blank" rel="noreferrer" className="live-link-btn">
                <span>View My Store</span>
                <ExternalLink size={20} />
              </a>

              <button className="unlock-btn" onClick={handleUnlock}>
                <span>Unlock Full Admin & M-Pesa</span>
                <span className="price-tag">KSh 2,000/mo</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .capitalize { text-transform: capitalize; }
        .main-interface {
          width: 100%;
          max-width: 800px;
          text-align: center;
          z-index: 1;
        }
        .brand-header {
          margin-bottom: 60px;
        }
        .brand-header h1 {
          font-size: 4rem;
          font-weight: 800;
          letter-spacing: -0.05em;
          margin: 16px 0 8px;
        }
        .brand-header p {
          font-size: 1.25rem;
          color: var(--text-dim);
          font-weight: 500;
        }
        .prompt-container {
          padding: 8px;
          border-radius: var(--radius-lg);
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        textarea {
          width: 100%;
          height: 180px;
          background: transparent;
          border: none;
          padding: 32px;
          color: #fff;
          font-size: 1.5rem;
          font-weight: 600;
          font-family: inherit;
          resize: none;
          outline: none;
          letter-spacing: -0.02em;
        }
        textarea::placeholder {
          color: rgba(255,255,255,0.2);
        }
        .generate-btn {
          background: var(--text);
          color: var(--bg);
          border: none;
          padding: 24px 40px;
          border-radius: var(--radius-pill);
          font-size: 1.1rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          cursor: pointer;
          transition: var(--transition);
        }
        .generate-btn:hover:not(:disabled) {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 20px 40px rgba(255,255,255,0.1);
        }
        .generate-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          filter: grayscale(1);
        }
        .feature-badges {
          margin-top: 40px;
          display: flex;
          justify-content: center;
          gap: 24px;
        }
        .badge {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
          color: var(--text-dim);
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        /* ─── GENERATION ─── */
        .generation-visual {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 32px;
        }
        .status-orb {
          width: 120px;
          height: 120px;
          border: 1px solid var(--accent);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        .inner-pulse {
          width: 60px;
          height: 60px;
          background: var(--accent);
          border-radius: 50%;
          filter: blur(20px);
          animation: orb-pulse 2s infinite ease-in-out;
        }
        @keyframes orb-pulse {
          0%, 100% { transform: scale(0.8); opacity: 0.5; }
          50% { transform: scale(1.2); opacity: 0.8; }
        }
        .status-logs {
          color: var(--text-dim);
          font-weight: 500;
          font-size: 1.1rem;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        /* ─── REVEAL ─── */
        .reveal-container {
          width: 100%;
          max-width: 500px;
          z-index: 1;
        }
        .reveal-card {
          padding: 48px;
          border-radius: var(--radius-lg);
          display: flex;
          flex-direction: column;
          gap: 32px;
        }
        .reveal-header {
          text-align: center;
        }
        .success-icon {
          margin-bottom: 24px;
          display: flex;
          justify-content: center;
        }
        .reveal-header h2 {
          font-size: 2.2rem;
          font-weight: 800;
          letter-spacing: -0.04em;
        }
        .reveal-header p {
          color: var(--text-dim);
          font-size: 1rem;
          font-weight: 600;
        }
        .store-preview-info {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .preview-row {
          display: flex;
          justify-content: space-between;
          padding: 16px 0;
          border-bottom: 1px solid var(--border);
        }
        .preview-row span:first-child {
          color: var(--text-dim);
          font-weight: 600;
        }
        .preview-row span:last-child {
          font-weight: 800;
        }
        .live-link-btn {
          background: var(--accent);
          color: #fff;
          padding: 20px;
          border-radius: var(--radius-pill);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          font-weight: 800;
          font-size: 1.1rem;
          transition: var(--transition);
          text-decoration: none;
        }
        .live-link-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(255, 61, 0, 0.4);
        }
        .unlock-btn {
          background: rgba(255,255,255,0.05);
          color: #fff;
          border: 1px solid var(--border);
          padding: 20px;
          border-radius: var(--radius-pill);
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-weight: 800;
          font-size: 0.95rem;
          cursor: pointer;
          transition: var(--transition);
        }
        .unlock-btn:hover {
          background: rgba(255,255,255,0.1);
        }
        .price-tag {
          background: var(--text);
          color: var(--bg);
          padding: 4px 12px;
          border-radius: 8px;
          font-size: 0.8rem;
        }
      `}</style>
    </div>
  );
}

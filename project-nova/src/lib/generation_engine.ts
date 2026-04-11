export type StoreConfig = {
  id?: string;
  storeName: string;
  template: 'sneaker' | 'vehicle' | 'kitchen' | 'gym';
  theme: 'dark' | 'light';
  primaryColor: string;
  accentColor: string;
  intent: 'CREATE' | 'UPDATE' | 'ADD_PRODUCT';
  productData?: any;
};

/**
 * THE BRAIN: Detects if the user wants to build, edit, or add products.
 */
export function detectIntent(prompt: string): StoreConfig['intent'] {
  const lowercase = prompt.toLowerCase();
  if (lowercase.includes('add') || lowercase.includes('product') || lowercase.includes('item')) return 'ADD_PRODUCT';
  const updateKeywords = ['change', 'update', 'rename', 'fix', 'switch', 'make it'];
  if (updateKeywords.some(keyword => lowercase.includes(keyword))) return 'UPDATE';
  return 'CREATE';
}

/**
 * THE BRAIN: Parses intent and extracts metadata from natural language.
 */
export async function parseStorePrompt(prompt: string): Promise<StoreConfig> {
  const lowercasePrompt = prompt.toLowerCase();
  const intent = detectIntent(prompt);
  
  // ADD_PRODUCT specific parsing
  if (intent === 'ADD_PRODUCT') {
    const priceMatch = prompt.match(/(?:for|price|at)\s+([0-9,]+)/i);
    const price = priceMatch ? priceMatch[1] : '15,000';
    
    return {
      storeName: '', // Usually not needed for product addition
      template: 'sneaker', 
      theme: 'dark',
      primaryColor: '#000000',
      accentColor: '#FF0000',
      intent,
      productData: {
        name: prompt.match(/(?:add|item|product)\s+([A-Z][a-zA-Z0-9\s]+)(?:for|price|at|$)/i)?.[1].trim() || 'New Arrival',
        price,
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff', // Mock high-end sneaker image
        brand: 'Vuka Premium',
        category: 'Streetwear',
        description: 'AI-generated premium product description.'
      }
    };
  }
  
  // 1. Template Extraction
  let template: StoreConfig['template'] = 'sneaker'; // Default
  if (lowercasePrompt.includes('car') || lowercasePrompt.includes('vehicle') || lowercasePrompt.includes('motors')) {
    template = 'vehicle';
  } else if (lowercasePrompt.includes('gym') || lowercasePrompt.includes('fitness') || lowercasePrompt.includes('workout')) {
    template = 'gym';
  } else if (lowercasePrompt.includes('kitchen') || lowercasePrompt.includes('food') || lowercasePrompt.includes('restaurant')) {
    template = 'kitchen';
  }

  // 2. Name Extraction
  let storeName = 'My Vuka Store';
  const nameMatch = prompt.match(/(?:called|named|name is|is called)\s+([A-Z][a-zA-Z0-9\s]+)(?:[.,]|$)/i);
  if (nameMatch && nameMatch[1]) {
    storeName = nameMatch[1].trim();
  }

  // 3. Theme & Color
  const theme: StoreConfig['theme'] = lowercasePrompt.includes('light') ? 'light' : 'dark';
  
  // 4. Color Heuristic
  let primaryColor = theme === 'dark' ? '#000000' : '#ffffff';
  let accentColor = '#FF0000'; // Default Vuka Red
  
  if (lowercasePrompt.includes('green')) accentColor = '#00FF00';
  if (lowercasePrompt.includes('blue')) accentColor = '#007AFF';
  if (lowercasePrompt.includes('gold')) accentColor = '#D4AF37';

  return {
    storeName,
    template,
    theme,
    primaryColor,
    accentColor,
    intent
  };
}



/**
 * THE FACTORY: Triggers the REAL Vercel Deployment via our Backend.
 */
export async function triggerDeployment(config: StoreConfig): Promise<string> {
  console.log('FACTORY: Initializing real deployment for', config.storeName);
  
  try {
    const response = await fetch('http://localhost:3001/api/deploy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Deployment failed');
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error('Factory Error:', error);
    throw error;
  }
}


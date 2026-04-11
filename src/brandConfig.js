import { ShoppingBag } from 'lucide-react';

// Vuka Magic: Dynamic Branding & API Bridge

const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
const vukaStoreId = searchParams ? searchParams.get('vuka_store') : null;
const urlStoreName = searchParams ? searchParams.get('storeName') : null;
const urlAccentColor = searchParams ? searchParams.get('accentColor') : null;

const vukaConfigRaw = typeof window !== 'undefined' ? localStorage.getItem('VUKA_CONFIG') : null;
const vukaConfig = vukaConfigRaw ? JSON.parse(vukaConfigRaw) : null;

// Determine final dynamic config
const dynamicStoreName = urlStoreName || vukaConfig?.storeName;
const dynamicAccentColor = urlAccentColor || vukaConfig?.accentColor;

if (vukaStoreId) {
    window.VUKA_TENANT_ID = vukaStoreId;
    window.VUKA_API_BASE = 'http://localhost:3001';
}

export const BRAND = {

    name: dynamicStoreName || 'SOLE SPHERE',
    nameRaw: dynamicStoreName || 'Sole Sphere',

    logo: ShoppingBag,
    tagline: vukaConfig ? 'The Peak of Style' : 'Step into excellence',
    description: 'Premier destination for authentic sneakers and exclusive streetwear. From timeless classics to the latest drops, we define your stride.',
    email: 'hello@solesphere.com',
    phone: '+254 700 000 000',
    whatsapp: '254700000000',
    address: 'Nairobi, Kenya | Worldwide Shipping',
    social: {
        instagram: 'https://www.instagram.com/solesphere/',
        twitter: 'https://twitter.com/solesphere',
        facebook: 'https://www.facebook.com/solesphere',
        youtube: 'https://youtube.com/@solesphere',
        tiktok: 'https://www.tiktok.com/@solesphere'
    },
    hero: {
        badge: dynamicStoreName ? `${dynamicStoreName} Official` : 'Exclusive Sneaker Hub',
        titleMain: 'Elevate Your',
        titleAccent: 'Stride with',
        titleSuffix: dynamicStoreName || 'Sole Sphere',
        subtitle: 'Experience the peak of sneaker culture with our curated collection of authentic, high-performance footwear and limited-edition streetwear.'
    }
};

// Vuka Magic: Inject dynamic accents if present
if (typeof window !== 'undefined' && dynamicAccentColor) {
    document.documentElement.style.setProperty('--accent', dynamicAccentColor);
}

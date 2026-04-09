import './loadEnv.js';
import { initDB } from './db/db.js';
import db from './db/db.js';

const products = [
    {
        name: 'Air Jordan 1 High OG "Lost & Found"',
        brand: 'Jordan',
        size: 'US 7-13',
        color: 'Varsity Red/Black-Sail',
        material: 'Premium Leather',
        condition: 'New',
        description: 'The Air Jordan 1 Retro High OG "Lost & Found" brings back the original Chicago colorway with an aged aesthetic. Featuring a cracked leather collar and a vintage-style box, it captures the essence of a found treasure from the 80s.',
        price: 45000,
        category: 'Limited Edition',
        stock: 5,
        images: [
            'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&q=80&w=1200',
            'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=1200'
        ]
    },
    {
        name: 'Adidas Yeezy Boost 350 V2 "Zebra"',
        brand: 'Adidas',
        size: 'US 5-14',
        color: 'White/Core Black/Red',
        material: 'Primeknit',
        condition: 'New',
        description: 'The Yeezy Boost 350 V2 "Zebra" remains one of the most iconic colorways in the Yeezy line. Featuring a marbled black and white Primeknit upper and the signature mirror-image "SPLY-350" text in red.',
        price: 38000,
        category: 'Streetwear',
        stock: 8,
        images: [
            'https://images.unsplash.com/photo-1586525198428-225f6f12cff5?auto=format&fit=crop&q=80&w=1200',
            'https://images.unsplash.com/photo-1589182337358-2cb63acfa9f5?auto=format&fit=crop&q=80&w=1200'
        ]
    },
    {
        name: 'Nike Air Force 1 \'07 "Triple White"',
        brand: 'Nike',
        size: 'US 4-15',
        color: 'White/White',
        material: 'Leather',
        condition: 'New',
        description: 'The radiance lives on in the Nike Air Force 1 \'07, the b-ball icon that puts a fresh spin on what you know best: crisp leather, bold colors and the perfect amount of flash to make you shine.',
        price: 15000,
        category: 'Lifestyle',
        stock: 25,
        images: [
            'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=1200',
            'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=1200'
        ]
    },
    {
        name: 'New Balance 550 "White Grey"',
        brand: 'New Balance',
        size: 'US 6-13',
        color: 'White/Grey',
        material: 'Leather/Suede',
        condition: 'New',
        description: 'Originally released in 1989, the 550 left its mark on basketball courts from coast to coast. After being archived, it was reintroduced in limited editions in late 2020 and returned to the full-time lineup in 2021.',
        price: 18000,
        category: 'Lifestyle',
        stock: 12,
        images: [
            'https://images.unsplash.com/photo-1628253747716-0c4f5c90fdda?auto=format&fit=crop&q=80&w=1200',
            'https://images.unsplash.com/photo-1628253747614-236b2803ec1c?auto=format&fit=crop&q=80&w=1200'
        ]
    },
    {
        name: 'Nike Dunk Low "Panda"',
        brand: 'Nike',
        size: 'US 5-14',
        color: 'White/Black',
        material: 'Leather',
        condition: 'New',
        description: 'The Nike Dunk Low "Panda" has become a modern classic. This simple but effective two-tone colorway works with any outfit, making it one of the most sought-after lifestyle sneakers today.',
        price: 19500,
        category: 'Lifestyle',
        stock: 15,
        images: [
            'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?auto=format&fit=crop&q=80&w=1200',
            'https://images.unsplash.com/photo-1605348532760-6753d2c43329?auto=format&fit=crop&q=80&w=1200'
        ]
    },
    {
        name: 'Adidas Ultraboost Light',
        brand: 'Adidas',
        size: 'US 6-13',
        color: 'Cloud White / Core Black',
        material: 'Primeknit+',
        condition: 'New',
        description: 'Experience epic energy with the new Ultraboost Light, our lightest Ultraboost ever. The magic lies in the Light BOOST midsole, a new generation of Adidas BOOST that\'s 30% lighter.',
        price: 22000,
        category: 'Running',
        stock: 10,
        images: [
            'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?auto=format&fit=crop&q=80&w=1200',
            'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=1200'
        ]
    }
];

const promotions = [
    {
        title: 'Exclusive Drops 👟',
        subtitle: 'The hottest releases from Jordan, Nike, and Adidas. Limited quantities available.',
        image_url: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&q=80&w=2000',
        link: '/products',
        active: 1,
        sort_order: 0
    },
    {
        title: 'Streetwear Essentials',
        subtitle: 'Complete your look with our curated selection of classic silhouettes and modern icons.',
        image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=2000',
        link: '/products',
        active: 1,
        sort_order: 1
    }
];

async function seed() {
    console.log('🌱 Seeding Sole Sphere with premium sneakers...\n');
    await initDB();

    // Clear existing data
    await db.execute('DELETE FROM product_images');
    await db.execute('DELETE FROM products');
    await db.execute('DELETE FROM promotions');
    await db.execute('DELETE FROM categories');

    // Seed categories
    const categories = ['Lifestyle', 'Basketball', 'Running', 'Streetwear', 'Limited Edition'];
    for (const name of categories) {
        await db.execute('INSERT INTO categories (name) VALUES (?)', [name]);
    }
    console.log(`📂 Seeded ${categories.length} categories`);

    // Seed products
    for (const p of products) {
        const mainImage = p.images[0];
        const [result] = await db.execute(
            'INSERT INTO products (name, brand, size, color, material, `condition`, description, price, category, stock, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [p.name, p.brand, p.size, p.color, p.material, p.condition, p.description, p.price, p.category, p.stock, mainImage]
        );
        const productId = result.insertId;

        for (let i = 0; i < p.images.length; i++) {
            await db.execute(
                'INSERT INTO product_images (product_id, url, sort_order) VALUES (?, ?, ?)',
                [productId, p.images[i], i]
            );
        }
        console.log(`  👟 ${p.name} (${p.brand}) — KES ${p.price.toLocaleString()}`);
    }

    // Seed promotions
    for (const promo of promotions) {
        await db.execute(
            'INSERT INTO promotions (title, subtitle, image_url, link, active, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
            [promo.title, promo.subtitle, promo.image_url, promo.link, promo.active, promo.sort_order]
        );
    }

    console.log(`\n✅ Seeded ${products.length} sneakers and ${promotions.length} promotions`);
    console.log('🏁 Done! Sole Sphere is stocked and ready.\n');
    process.exit(0);
}

seed().catch(err => {
    console.error('Seed failed:', err);
    process.exit(1);
});

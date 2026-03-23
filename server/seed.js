const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const User = require('./models/User');
const Product = require('./models/Product');

const products = [
  // Electronics (4 products)
  {
    name: 'Sony WH-1000XM5 Wireless Headphones',
    description: 'Industry-leading noise canceling with the next-generation processor. Up to 30-hour battery life, touch sensor controls, and speak-to-chat technology. Crystal clear hands-free calling.',
    price: 349.99,
    originalPrice: 399.99,
    category: 'Electronics',
    brand: 'Sony',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600'
    ],
    stock: 45,
    rating: 4.8,
    numReviews: 234,
    featured: true,
    tags: ['headphones', 'wireless', 'noise-canceling', 'audio']
  },
  {
    name: 'Apple iPad Air 10.9-inch',
    description: 'Powerful. Colorful. Wonderful. The new iPad Air features the Apple M1 chip for a massive leap in performance. Work, learn, and create in all-new ways with a beautiful 10.9-inch Liquid Retina display.',
    price: 749.00,
    originalPrice: 799.00,
    category: 'Electronics',
    brand: 'Apple',
    images: [
      'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600',
      'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=600'
    ],
    stock: 30,
    rating: 4.9,
    numReviews: 178,
    featured: true,
    tags: ['tablet', 'apple', 'ipad', 'productivity']
  },
  {
    name: 'Samsung 4K Smart TV 55-inch',
    description: 'Quantum HDR technology brings out detail in both bright and dark scenes. Crystal Processor 4K upgrades content to 4K in real time. Alexa built-in for hands-free control.',
    price: 699.99,
    originalPrice: 899.99,
    category: 'Electronics',
    brand: 'Samsung',
    images: [
      'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600',
      'https://images.unsplash.com/photo-1571415060716-baff5f717c37?w=600'
    ],
    stock: 18,
    rating: 4.6,
    numReviews: 312,
    featured: false,
    tags: ['tv', '4k', 'smart tv', 'samsung']
  },
  {
    name: 'Logitech MX Master 3 Wireless Mouse',
    description: 'Advanced wireless mouse for power users. Ultra-fast MagSpeed scroll wheel, ergonomic design, and 70-day battery life. Works on any surface including glass.',
    price: 99.99,
    originalPrice: 119.99,
    category: 'Electronics',
    brand: 'Logitech',
    images: [
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600',
      'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?w=600'
    ],
    stock: 75,
    rating: 4.7,
    numReviews: 89,
    featured: false,
    tags: ['mouse', 'wireless', 'logitech', 'productivity']
  },

  // Clothing (4 products)
  {
    name: 'Classic Fit Oxford Dress Shirt',
    description: 'Crafted from premium 100% cotton, this timeless Oxford dress shirt features a button-down collar and a comfortable classic fit. Perfect for business or smart-casual occasions.',
    price: 59.99,
    originalPrice: 79.99,
    category: 'Clothing',
    brand: 'Vega Essentials',
    images: [
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600',
      'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600'
    ],
    stock: 120,
    rating: 4.4,
    numReviews: 67,
    featured: false,
    tags: ['shirt', 'dress shirt', 'formal', 'cotton']
  },
  {
    name: 'Slim Fit Chino Pants',
    description: 'Modern slim-fit chinos made from stretch cotton blend for all-day comfort. Features a flat front with a clean, tailored look. Available in multiple colors.',
    price: 49.99,
    originalPrice: 69.99,
    category: 'Clothing',
    brand: 'Vega Essentials',
    images: [
      'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600',
      'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600'
    ],
    stock: 85,
    rating: 4.3,
    numReviews: 54,
    featured: false,
    tags: ['pants', 'chino', 'slim fit', 'casual']
  },
  {
    name: 'Premium Merino Wool Sweater',
    description: 'Luxuriously soft merino wool sweater with a classic crew neck design. Temperature-regulating properties keep you comfortable year-round. Machine washable.',
    price: 89.99,
    originalPrice: 120.00,
    category: 'Clothing',
    brand: 'Nordic Wool Co.',
    images: [
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600',
      'https://images.unsplash.com/photo-1511085357693-b22a20f7e052?w=600'
    ],
    stock: 60,
    rating: 4.6,
    numReviews: 43,
    featured: true,
    tags: ['sweater', 'wool', 'merino', 'winter']
  },
  {
    name: 'Athletic Performance Jacket',
    description: 'Lightweight and breathable performance jacket designed for active lifestyles. Water-resistant outer shell with moisture-wicking inner lining. Packable design fits in its own pocket.',
    price: 79.99,
    originalPrice: 99.99,
    category: 'Clothing',
    brand: 'ActiveWear Pro',
    images: [
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600'
    ],
    stock: 40,
    rating: 4.5,
    numReviews: 38,
    featured: false,
    tags: ['jacket', 'athletic', 'performance', 'outdoor']
  },

  // Books (4 products)
  {
    name: 'Atomic Habits by James Clear',
    description: 'A proven framework for improving every day. James Clear reveals practical strategies that will teach you exactly how to form good habits, break bad ones, and master the tiny behaviors that lead to remarkable results.',
    price: 16.99,
    originalPrice: 27.00,
    category: 'Books',
    brand: 'Avery Publishing',
    images: [
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600',
      'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600'
    ],
    stock: 200,
    rating: 4.9,
    numReviews: 1520,
    featured: true,
    tags: ['self-help', 'habits', 'productivity', 'bestseller']
  },
  {
    name: 'The Psychology of Money',
    description: 'Timeless lessons on wealth, greed, and happiness. Morgan Housel shares 19 short stories exploring the strange ways people think about money and teaches you how to make better sense of one of life\'s most important topics.',
    price: 14.99,
    originalPrice: 22.00,
    category: 'Books',
    brand: 'Harriman House',
    images: [
      'https://images.unsplash.com/photo-1592496431122-2349e0fbc666?w=600',
      'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600'
    ],
    stock: 150,
    rating: 4.8,
    numReviews: 876,
    featured: false,
    tags: ['finance', 'money', 'psychology', 'investing']
  },
  {
    name: 'Deep Work by Cal Newport',
    description: 'Rules for focused success in a distracted world. Cal Newport argues that the ability to perform deep work is increasingly rare at exactly the same time it is becoming increasingly valuable in our economy.',
    price: 15.99,
    originalPrice: 28.00,
    category: 'Books',
    brand: 'Grand Central Publishing',
    images: [
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600',
      'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=600'
    ],
    stock: 180,
    rating: 4.7,
    numReviews: 654,
    featured: false,
    tags: ['productivity', 'focus', 'work', 'career']
  },
  {
    name: 'Sapiens: A Brief History of Humankind',
    description: 'From a renowned historian comes a groundbreaking narrative of humanity\'s creation and evolution. How did our species succeed in the battle for dominance? How did we create cities, nations, and empires?',
    price: 17.99,
    originalPrice: 25.00,
    category: 'Books',
    brand: 'Harper Perennial',
    images: [
      'https://images.unsplash.com/photo-1550399105-c4db5fb85c18?w=600',
      'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600'
    ],
    stock: 220,
    rating: 4.8,
    numReviews: 2103,
    featured: true,
    tags: ['history', 'science', 'humanity', 'bestseller']
  },

  // Home & Garden (4 products)
  {
    name: 'Instant Pot Duo 7-in-1 Electric Pressure Cooker',
    description: 'Replaces 7 kitchen appliances: pressure cooker, slow cooker, rice cooker, steamer, sauté pan, yogurt maker, and food warmer. 6-quart capacity perfect for families of 4-6.',
    price: 89.99,
    originalPrice: 119.99,
    category: 'Home & Garden',
    brand: 'Instant Pot',
    images: [
      'https://images.unsplash.com/photo-1585515656973-f54bed715ca5?w=600',
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600'
    ],
    stock: 55,
    rating: 4.7,
    numReviews: 432,
    featured: true,
    tags: ['kitchen', 'cooking', 'instant pot', 'appliance']
  },
  {
    name: 'Luxe 600-Thread Count Egyptian Cotton Sheet Set',
    description: 'Sleep in supreme comfort with our 600-thread count Egyptian cotton sheets. Sateen weave gives a silky-smooth feel while remaining breathable. Includes flat sheet, fitted sheet, and 2 pillowcases.',
    price: 79.99,
    originalPrice: 129.99,
    category: 'Home & Garden',
    brand: 'Luxe Sleep',
    images: [
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600'
    ],
    stock: 90,
    rating: 4.5,
    numReviews: 187,
    featured: false,
    tags: ['bedding', 'sheets', 'egyptian cotton', 'sleep']
  },
  {
    name: 'Dyson V15 Detect Cordless Vacuum',
    description: 'Laser reveals the dust you cannot see. Intelligent suction auto-adapts to reveal and remove hidden dust from all floor types. Up to 60 minutes of powerful fade-free suction.',
    price: 649.99,
    originalPrice: 749.99,
    category: 'Home & Garden',
    brand: 'Dyson',
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600',
      'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=600'
    ],
    stock: 22,
    rating: 4.8,
    numReviews: 267,
    featured: true,
    tags: ['vacuum', 'dyson', 'cordless', 'cleaning']
  },
  {
    name: 'Cast Iron Dutch Oven 5.5 Quart',
    description: 'Professional-grade enameled cast iron Dutch oven with superior heat distribution and retention. Perfect for soups, stews, braising, and baking. Oven safe up to 500°F.',
    price: 129.99,
    originalPrice: 179.99,
    category: 'Home & Garden',
    brand: 'Le Creuset',
    images: [
      'https://images.unsplash.com/photo-1556909114-44e3e70034e2?w=600',
      'https://images.unsplash.com/photo-1584990347449-a8a3ad5ed2ee?w=600'
    ],
    stock: 35,
    rating: 4.9,
    numReviews: 521,
    featured: false,
    tags: ['cookware', 'cast iron', 'dutch oven', 'kitchen']
  },

  // Sports (4 products)
  {
    name: 'Nike Air Zoom Pegasus 40 Running Shoes',
    description: 'The trusted workhorse for everyday runners. React foam cushioning provides a smooth, responsive ride. Breathable mesh upper keeps your feet cool on long runs.',
    price: 129.99,
    originalPrice: 149.99,
    category: 'Sports',
    brand: 'Nike',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600',
      'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600'
    ],
    stock: 68,
    rating: 4.6,
    numReviews: 389,
    featured: true,
    tags: ['running', 'shoes', 'nike', 'athletic']
  },
  {
    name: 'Bowflex SelectTech 552 Adjustable Dumbbells',
    description: 'Adjusts from 5 to 52.5 lbs in 2.5-lb increments. Each dumbbell replaces 15 sets of weights. Innovative dial system for fast adjustment between exercises.',
    price: 399.99,
    originalPrice: 549.00,
    category: 'Sports',
    brand: 'Bowflex',
    images: [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600',
      'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600'
    ],
    stock: 14,
    rating: 4.8,
    numReviews: 712,
    featured: true,
    tags: ['dumbbells', 'weights', 'fitness', 'home gym']
  },
  {
    name: 'Manduka PRO Yoga Mat 6mm',
    description: 'The ultimate yoga mat for serious practitioners. Dense 6mm cushioning for joint protection, closed-cell surface prevents moisture absorption, and superior grip keeps you stable in every pose.',
    price: 120.00,
    originalPrice: 148.00,
    category: 'Sports',
    brand: 'Manduka',
    images: [
      'https://images.unsplash.com/photo-1601925228548-f9fc2dbd6d77?w=600',
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600'
    ],
    stock: 50,
    rating: 4.7,
    numReviews: 245,
    featured: false,
    tags: ['yoga', 'mat', 'fitness', 'meditation']
  },
  {
    name: 'Garmin Forerunner 255 GPS Running Watch',
    description: 'Advanced GPS running watch with Training Readiness score that considers sleep, recovery, training load and more. Multi-band GPS for accurate positioning. Up to 14 days battery life.',
    price: 349.99,
    originalPrice: 399.99,
    category: 'Sports',
    brand: 'Garmin',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600',
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600'
    ],
    stock: 28,
    rating: 4.7,
    numReviews: 193,
    featured: false,
    tags: ['watch', 'gps', 'running', 'garmin', 'fitness']
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    console.log('Existing data cleared.');

    // Create admin user (bypassing pre-save hook by creating directly with hash)
    const adminSalt = await bcrypt.genSalt(10);
    const adminHash = await bcrypt.hash('admin123', adminSalt);

    const userSalt = await bcrypt.genSalt(10);
    const userHash = await bcrypt.hash('user123', userSalt);

    await User.collection.insertMany([
      {
        name: 'Admin User',
        email: 'admin@vega.com',
        password: adminHash,
        role: 'admin',
        avatar: '',
        address: {},
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'John Doe',
        email: 'user@vega.com',
        password: userHash,
        role: 'user',
        avatar: '',
        address: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zip: '10001',
          country: 'USA'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    console.log('Users seeded: admin@vega.com (admin123), user@vega.com (user123)');

    // Insert products
    await Product.insertMany(products);
    console.log(`${products.length} products seeded across 5 categories.`);

    const categories = [...new Set(products.map(p => p.category))];
    console.log('Categories:', categories.join(', '));

    const featuredCount = products.filter(p => p.featured).length;
    console.log(`Featured products: ${featuredCount}`);

    console.log('\nSeed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error.message);
    process.exit(1);
  }
};

seedDB();

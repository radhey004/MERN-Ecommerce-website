const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

const products = [
  {
    name: "Classic Cotton Crew Neck T-Shirt",
    description: "Soft and comfortable cotton t-shirt ideal for everyday wear. Made from 100% premium cotton with double-stitched seams for long-lasting durability.",
    price: 399,
    originalPrice: 599,
    category: "men",
    subcategory: "clothing",
    brand: "H&M",
    images: [
      "https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg",
      "https://images.pexels.com/photos/9558599/pexels-photo-9558599.jpeg",
      "https://images.pexels.com/photos/8346230/pexels-photo-8346230.jpeg",
      "https://images.pexels.com/photos/9558909/pexels-photo-9558909.jpeg",
      "https://images.pexels.com/photos/9558577/pexels-photo-9558577.jpeg"
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    rating: 4.3,
    numReviews: 89,
    stock: 50,
    featured: true,
    tags: ["casual", "cotton", "basic", "essential"],
    specifications: {
      material: "100% Cotton",
      care: "Machine wash cold, tumble dry low",
      fit: "Regular Fit",
      origin: "India"
    },
    shipping: {
      freeShipping: true,
      deliveryTime: "3-5 business days",
      returnPolicy: 30
    }
  },
  {
    name: "Wireless Noise Cancelling Headphones",
    description: "Premium wireless headphones with hybrid active noise cancellation, 30-hour battery life, and immersive sound experience with rich bass.",
    price: 2999,
    originalPrice: 4999,
    category: "electronics",
    subcategory: "audio",
    brand: "boAt",
    images: [
      "https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg",
      "https://images.pexels.com/photos/3394666/pexels-photo-3394666.jpeg",
      "https://images.pexels.com/photos/3394665/pexels-photo-3394665.jpeg",
      "https://images.pexels.com/photos/3394652/pexels-photo-3394652.jpeg"
    ],
    sizes: ["One Size"],
    rating: 4.6,
    numReviews: 124,
    stock: 25,
    featured: true,
    tags: ["wireless", "noise-cancelling", "bluetooth", "audio"],
    specifications: {
      battery: "30 hours playback",
      connectivity: "Bluetooth 5.3",
      features: "Hybrid Active Noise Cancellation, Fast Charging",
      weight: "265g"
    },
    shipping: {
      freeShipping: true,
      deliveryTime: "2-4 business days",
      returnPolicy: 14
    }
  },
  {
    name: "Floral Print A-Line Midi Dress",
    description: "Beautiful floral print midi dress with flowy silhouette. Crafted from lightweight fabric with elastic waistband for perfect comfort and fit.",
    price: 1299,
    originalPrice: 1999,
    category: "women",
    subcategory: "clothing",
    brand: "ZARA",
    images: [
      "https://images.pexels.com/photos/19895961/pexels-photo-19895961.jpeg",
      "https://images.pexels.com/photos/19895983/pexels-photo-19895983.jpeg",
      "https://images.pexels.com/photos/19034219/pexels-photo-19034219.jpeg",
      "https://images.pexels.com/photos/19895950/pexels-photo-19895950.jpeg",
      "https://images.pexels.com/photos/19895949/pexels-photo-19895949.jpeg"
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    rating: 4.2,
    numReviews: 67,
    stock: 30,
    featured: false,
    tags: ["summer", "floral", "dress", "casual"],
    specifications: {
      material: "Viscose Blend",
      care: "Machine washable",
      fit: "A-line",
      length: "Midi-length"
    },
    shipping: {
      freeShipping: true,
      deliveryTime: "3-6 business days",
      returnPolicy: 30
    }
  },
  {
    name: "RGB Mechanical Gaming Keyboard",
    description: "Full-sized mechanical gaming keyboard with RGB backlighting, blue switches, and anti-ghosting technology for competitive gaming.",
    price: 3499,
    originalPrice: 4999,
    category: "electronics",
    subcategory: "gaming",
    brand: "Cosmic Byte",
    images: [
      "https://images.pexels.com/photos/17895080/pexels-photo-17895080.jpeg",
      "https://images.pexels.com/photos/5380602/pexels-photo-5380602.jpeg",
      "https://images.pexels.com/photos/5380584/pexels-photo-5380584.jpeg",
      "https://images.pexels.com/photos/12877814/pexels-photo-12877814.jpeg"
    ],
    sizes: ["Full Size"],
    rating: 4.5,
    numReviews: 203,
    stock: 15,
    featured: true,
    tags: ["gaming", "mechanical", "rgb", "keyboard"],
    specifications: {
      switches: "Blue Mechanical Switches",
      backlight: "RGB customizable lighting",
      connectivity: "USB",
      features: "N-key rollover, dedicated media controls"
    },
    shipping: {
      freeShipping: false,
      deliveryTime: "4-7 business days",
      returnPolicy: 14
    }
  },
  {
    name: "Genuine Leather Bi-Fold Wallet",
    description: "Handcrafted genuine leather wallet featuring multiple card slots, transparent ID window, and secure cash compartment with premium finish.",
    price: 899,
    originalPrice: 1499,
    category: "men",
    subcategory: "accessories",
    brand: "Urban Forest",
    images: [
      "https://images.pexels.com/photos/4430242/pexels-photo-4430242.jpeg",
      "https://images.pexels.com/photos/4386178/pexels-photo-4386178.jpeg",
      "https://images.pexels.com/photos/4430240/pexels-photo-4430240.jpeg",
      "https://images.pexels.com/photos/4430243/pexels-photo-4430243.jpeg"
    ],
    sizes: ["Standard"],
    rating: 4.1,
    numReviews: 156,
    stock: 40,
    featured: false,
    tags: ["leather", "wallet", "accessory", "minimalist"],
    specifications: {
      material: "Genuine Leather",
      compartments: "6 card slots, 1 ID window, 2 bill compartments",
      closure: "Magnetic snap",
      dimensions: "4.3 x 3.4 inches"
    },
    shipping: {
      freeShipping: true,
      deliveryTime: "2-5 business days",
      returnPolicy: 30
    }
  },
  {
    name: "Premium Extra Thick Yoga Mat",
    description: "High-density TPE yoga mat with superior grip and cushioning. Eco-friendly material perfect for yoga, pilates, and floor exercises.",
    price: 1499,
    originalPrice: 2199,
    category: "sports",
    subcategory: "fitness",
    brand: "Decathlon",
    images: [
      "https://images.pexels.com/photos/4498609/pexels-photo-4498609.jpeg",
      "https://images.pexels.com/photos/5412251/pexels-photo-5412251.jpeg",
      "https://images.pexels.com/photos/6303425/pexels-photo-6303425.jpeg",
      "https://images.pexels.com/photos/4498173/pexels-photo-4498173.jpeg",
      "https://images.pexels.com/photos/6303732/pexels-photo-6303732.jpeg"
    ],
    sizes: ["Standard: 72x24 inches"],
    rating: 4.5,
    numReviews: 189,
    stock: 35,
    featured: true,
    tags: ["yoga", "fitness", "eco-friendly", "non-slip"],
    specifications: {
      material: "TPE (Thermoplastic Elastomer)",
      thickness: "8mm",
      weight: "2.8kg",
      features: "Non-slip surface, sweat resistant"
    },
    shipping: {
      freeShipping: true,
      deliveryTime: "3-5 business days",
      returnPolicy: 30
    }
  },
  {
    name: "1000W Stand Mixer with Bowl",
    description: "Powerful 1000W stand mixer with 10-speed settings, stainless steel mixing bowl, and multiple attachments for professional baking results.",
    price: 8999,
    originalPrice: 12999,
    category: "home",
    subcategory: "kitchen",
    brand: "Bajaj",
    images: [
      "https://images.pexels.com/photos/1450903/pexels-photo-1450903.jpeg",
      "https://images.pexels.com/photos/1450907/pexels-photo-1450907.jpeg",
      "https://images.pexels.com/photos/6996330/pexels-photo-6996330.jpeg"
    ],
    sizes: ["Standard"],
    rating: 4.7,
    numReviews: 92,
    stock: 12,
    featured: true,
    tags: ["kitchen", "baking", "mixer", "appliance"],
    specifications: {
      power: "1000W",
      capacity: "4L stainless steel bowl",
      attachments: "Dough hook, beater, whisk",
      warranty: "2 years"
    },
    shipping: {
      freeShipping: false,
      deliveryTime: "5-8 business days",
      returnPolicy: 30
    }
  },
  {
    name: "Smart Band with Heart Rate Monitor",
    description: "Advanced fitness tracker with continuous heart rate monitoring, SpO2 tracking, sleep analysis, and 10-day battery life. Water resistant design.",
    price: 2499,
    originalPrice: 3999,
    category: "electronics",
    subcategory: "wearables",
    brand: "Noise",
    images: [
      "https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg",
      "https://images.pexels.com/photos/1682821/pexels-photo-1682821.jpeg",
      "https://images.pexels.com/photos/18662969/pexels-photo-18662969.jpeg",
      "https://images.pexels.com/photos/18259148/pexels-photo-18259148.jpeg"
    ],
    sizes: ["Regular", "Large"],
    rating: 4.3,
    numReviews: 312,
    stock: 45,
    featured: true,
    tags: ["fitness", "smartband", "health", "tracking"],
    specifications: {
      display: "1.1 inch AMOLED",
      battery: "10 days typical use",
      connectivity: "Bluetooth 5.0",
      features: "Heart rate monitor, SpO2, sleep tracking, water resistant"
    },
    shipping: {
      freeShipping: true,
      deliveryTime: "2-4 business days",
      returnPolicy: 14
    }
  },
  {
    name: "Organic Face Care Essential Kit",
    description: "Complete organic skincare routine including gentle face wash, refreshing toner, brightening serum, and hydrating moisturizer for radiant skin.",
    price: 2799,
    originalPrice: 3999,
    category: "beauty",
    subcategory: "skincare",
    brand: "Mamaearth",
    images: [
      "https://images.pexels.com/photos/3762879/pexels-photo-3762879.jpeg",
      "https://images.pexels.com/photos/3685530/pexels-photo-3685530.jpeg",
      "https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg"
    ],
    sizes: ["Full Set"],
    rating: 4.4,
    numReviews: 267,
    stock: 28,
    featured: true,
    tags: ["skincare", "organic", "routine", "beauty"],
    specifications: {
      skinType: "All skin types",
      ingredients: "Natural, toxin-free, cruelty-free",
      volume: "Face Wash 100ml, Toner 150ml, Serum 20ml, Moisturizer 50ml"
    },
    shipping: {
      freeShipping: true,
      deliveryTime: "3-5 business days",
      returnPolicy: 30
    }
  },
  {
    name: "Educational Building Blocks Toy Set",
    description: "250-piece educational building blocks set for children aged 4-10 years. Enhances creativity, motor skills, and cognitive development through play.",
    price: 1499,
    originalPrice: 1999,
    category: "kids",
    subcategory: "toys",
    brand: "LEGO",
    images: [
      "https://images.pexels.com/photos/4491711/pexels-photo-4491711.jpeg",
      "https://images.pexels.com/photos/3068579/pexels-photo-3068579.jpeg",
      "https://images.pexels.com/photos/105855/pexels-photo-105855.jpeg"
    ],
    sizes: ["250 pieces"],
    rating: 4.7,
    numReviews: 189,
    stock: 45,
    featured: false,
    tags: ["educational", "blocks", "kids", "creative"],
    specifications: {
      material: "ABS plastic",
      ageRange: "4-10 years",
      pieces: "250 pieces with storage container",
      safety: "Non-toxic, child-safe materials"
    },
    shipping: {
      freeShipping: true,
      deliveryTime: "4-7 business days",
      returnPolicy: 30
    }
  },
  {
    name: "Smart Speaker with Voice Assistant",
    description: "Voice-controlled smart speaker with built-in AI assistant, 360° surround sound, and seamless smart home device integration.",
    price: 4999,
    originalPrice: 6999,
    category: "electronics",
    subcategory: "smart-home",
    brand: "Amazon",
    images: [
      "https://images.pexels.com/photos/14309811/pexels-photo-14309811.jpeg",
      "https://images.pexels.com/photos/14309815/pexels-photo-14309815.jpeg",
      "https://images.pexels.com/photos/14309816/pexels-photo-14309816.jpeg",
      "https://images.pexels.com/photos/14309809/pexels-photo-14309809.jpeg"
    ],
    sizes: ["Standard"],
    rating: 4.5,
    numReviews: 134,
    stock: 18,
    featured: true,
    tags: ["smart-home", "speaker", "ai", "voice-control"],
    specifications: {
      speakers: "Dual 2.5-inch woofers, two 1-inch tweeters",
      connectivity: "Wi-Fi, Bluetooth 5.0",
      voiceAssistant: "Built-in Alexa with far-field voice recognition",
      compatible: "Works with smart home devices"
    },
    shipping: {
      freeShipping: true,
      deliveryTime: "2-4 business days",
      returnPolicy: 14
    }
  },
  {
    name: "Decorative Wall Mirror with Frame",
    description: "Elegant decorative wall mirror featuring ornate silver-finish frame, perfect for enhancing living room, bedroom, or hallway decor.",
    price: 2199,
    originalPrice: 2999,
    category: "home",
    subcategory: "decor",
    brand: "IKEA",
    images: [
      "https://images.pexels.com/photos/12715512/pexels-photo-12715512.jpeg",
      "https://images.pexels.com/photos/6873890/pexels-photo-6873890.jpeg",
      "https://images.pexels.com/photos/1528975/pexels-photo-1528975.jpeg",
      "https://images.pexels.com/photos/5984747/pexels-photo-5984747.jpeg"
    ],
    sizes: ["24x36 inches", "30x40 inches"],
    rating: 4.2,
    numReviews: 78,
    stock: 22,
    featured: false,
    tags: ["decor", "mirror", "wall", "home"],
    specifications: {
      material: "Glass with metal frame",
      finish: "Silver electroplated",
      installation: "Wall mounted with included hardware",
      weight: "4.8kg"
    },
    shipping: {
      freeShipping: false,
      deliveryTime: "5-10 business days",
      returnPolicy: 30
    }
  },
  {
    name: "Men's Running Shoes with Cushioning",
    description: "Lightweight running shoes featuring advanced cushioning technology, breathable mesh upper, and durable rubber outsole for optimal performance.",
    price: 2999,
    originalPrice: 4299,
    category: "sports",
    subcategory: "footwear",
    brand: "Nike",
    images: [
      "https://images.pexels.com/photos/1456706/pexels-photo-1456706.jpeg",
      "https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg",
      "https://images.pexels.com/photos/1599005/pexels-photo-1599005.jpeg"
    ],
    sizes: ["US 7", "US 8", "US 9", "US 10", "US 11", "US 12"],
    rating: 4.6,
    numReviews: 203,
    stock: 32,
    featured: true,
    tags: ["running", "shoes", "sports", "athletic"],
    specifications: {
      material: "Breathable mesh upper, rubber outsole",
      cushioning: "Advanced foam technology",
      weight: "295g (per shoe)",
      features: "Reflective details, arch support"
    },
    shipping: {
      freeShipping: true,
      deliveryTime: "3-6 business days",
      returnPolicy: 30
    }
  },
  {
    name: "3-Axis Smartphone Gimbal Stabilizer",
    description: "Professional 3-axis smartphone gimbal with object tracking, motion time-lapse, and wireless charging capability for smooth video recording.",
    price: 6499,
    originalPrice: 8999,
    category: "electronics",
    subcategory: "photography",
    brand: "DJI",
    images: [
      "https://images.pexels.com/photos/8371397/pexels-photo-8371397.jpeg",
      "https://images.pexels.com/photos/8371400/pexels-photo-8371400.jpeg",
      "https://images.pexels.com/photos/8357234/pexels-photo-8357234.jpeg"
    ],
    sizes: ["Compact"],
    rating: 4.4,
    numReviews: 112,
    stock: 18,
    featured: true,
    tags: ["gimbal", "photography", "video", "stabilization"],
    specifications: {
      compatibility: "iOS and Android smartphones",
      battery: "15 hours continuous use",
      connectivity: "Bluetooth, USB-C",
      features: "Object tracking, motion control, wireless charging"
    },
    shipping: {
      freeShipping: true,
      deliveryTime: "3-5 business days",
      returnPolicy: 14
    }
  },
  {
    name: "Non-Stick Cookware Set 8 Pieces",
    description: "8-piece ceramic non-stick cookware set compatible with induction cooktops. Features even heat distribution and eco-friendly non-stick coating.",
    price: 4599,
    originalPrice: 6999,
    category: "home",
    subcategory: "kitchen",
    brand: "Prestige",
    images: [
      "https://images.pexels.com/photos/30981356/pexels-photo-30981356.jpeg",
      "https://images.pexels.com/photos/31110049/pexels-photo-31110049.jpeg",
      "https://images.pexels.com/photos/31110009/pexels-photo-31110009.jpeg"
    ],
    sizes: ["8-piece set"],
    rating: 4.5,
    numReviews: 189,
    stock: 25,
    featured: false,
    tags: ["cookware", "kitchen", "non-stick", "ceramic"],
    specifications: {
      pieces: "2 pots, 2 pans, 4 lids",
      material: "Aluminum body with ceramic coating",
      compatibility: "All stovetops including induction",
      warranty: "5 years"
    },
    shipping: {
      freeShipping: false,
      deliveryTime: "5-8 business days",
      returnPolicy: 30
    }
  },
  {
    name: "Men's Waterproof Winter Jacket",
    description: "Insulated waterproof winter jacket with thermal lining, adjustable hood, and multiple secure pockets designed for extreme cold weather protection.",
    price: 3599,
    originalPrice: 4999,
    category: "men",
    subcategory: "outerwear",
    brand: "Wildcraft",
    images: [
      "https://images.pexels.com/photos/16341730/pexels-photo-16341730.jpeg",
      "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg",
      "https://images.pexels.com/photos/7026778/pexels-photo-7026778.jpeg",
      "https://images.pexels.com/photos/6044973/pexels-photo-6044973.jpeg"
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    rating: 4.3,
    numReviews: 178,
    stock: 38,
    featured: true,
    tags: ["winter", "jacket", "waterproof", "outdoor"],
    specifications: {
      material: "Polyester outer with synthetic insulation",
      features: "Waterproof, windproof, thermal lining",
      pockets: "3 exterior, 2 interior",
      hood: "Adjustable with detachable fur trim"
    },
    shipping: {
      freeShipping: true,
      deliveryTime: "4-7 business days",
      returnPolicy: 30
    }
  }
];

async function seedProducts() {
  try {
    await mongoose.connect('mongodb+srv://radheyk0017:1234567888@cluster0.zbev47z.mongodb.net/?retryWrites=true&w=majority');
    await Product.deleteMany({});
    await Product.insertMany(products);
    console.log(`${products.length} products seeded successfully!`);
    process.exit();
  } catch (error) {
    console.error('Error seeding products:', error);
    process.exit(1);
  }
}

seedProducts();
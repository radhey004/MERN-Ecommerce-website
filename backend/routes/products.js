// const express = require('express');
// const Product = require('../models/Product');

// const router = express.Router();

// // Get search suggestions - MUST COME BEFORE /:id
// router.get('/suggest', async (req, res) => {
//   try {
//     const { query } = req.query;
    
//     if (!query || query.trim().length === 0) {
//       return res.json([]);
//     }

//     const products = await Product.find({
//       $or: [
//         { name: { $regex: query, $options: 'i' } },
//         { description: { $regex: query, $options: 'i' } },
//         { category: { $regex: query, $options: 'i' } }
//       ]
//     })
//     .select('name price category images')
//     .limit(8)
//     .lean();

//     // Ensure images array exists for each product
//     const safeProducts = products.map(product => ({
//       ...product,
//       images: product.images && product.images.length > 0 ? product.images : ['/placeholder-image.jpg']
//     }));

//     res.json(safeProducts);
//   } catch (error) {
//     console.error('Error fetching search suggestions:', error);
//     res.status(500).json({ message: 'Server error fetching suggestions', error: error.message });
//   }
// });

// // Get featured products
// router.get('/featured/list', async (req, res) => {
//   try {
//     const products = await Product.find({ featured: true }).limit(8);
//     res.json(products);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// // Get categories
// router.get('/categories/list', async (req, res) => {
//   try {
//     const categories = await Product.distinct('category');
//     res.json(categories);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// // Get all products with filtering and searching
// router.get('/', async (req, res) => {
//   try {
//     const { category, search, limit = 20, page = 1 } = req.query;
    
//     let query = {};
    
//     if (category && category !== 'all') {
//       query.category = category;
//     }
    
//     if (search) {
//       query.$or = [
//         { name: { $regex: search, $options: 'i' } },
//         { description: { $regex: search, $options: 'i' } }
//       ];
//     }

//     const products = await Product.find(query)
//       .limit(limit * 1)
//       .skip((page - 1) * limit)
//       .sort({ createdAt: -1 });

//     const totalProducts = await Product.countDocuments(query);
    
//     res.json({
//       products,
//       totalPages: Math.ceil(totalProducts / limit),
//       currentPage: page,
//       totalProducts
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// // Get single product - THIS SHOULD BE LAST
// router.get('/:id', async (req, res) => {
//   try {
//     const product = await Product.findById(req.params.id);
//     if (!product) {
//       return res.status(404).json({ message: 'Product not found' });
//     }
//     res.json(product);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// module.exports = router;



const express = require('express');
const Product = require('../models/Product');

const router = express.Router();

// Get search suggestions - MUST COME BEFORE /:id
router.get('/suggest', async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim().length === 0) {
      return res.json([]);
    }

    const products = await Product.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } }
      ]
    })
      .select('name price category images')
      .limit(8)
      .lean();

    // Ensure images array exists for each product
    const safeProducts = products.map(product => ({
      ...product,
      images: product.images && product.images.length > 0 ? product.images : ['/placeholder-image.jpg']
    }));

    res.json(safeProducts);
  } catch (error) {
    console.error('Error fetching search suggestions:', error);
    res.status(500).json({ message: 'Server error fetching suggestions', error: error.message });
  }
});

// ✅ Get featured products - fixed route for frontend
router.get('/featured', async (req, res) => {
  try {
    const products = await Product.find({ featured: true }).limit(8);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all products with filtering and searching
router.get('/', async (req, res) => {
  try {
    const { category, search, limit = 20, page = 1 } = req.query;

    let query = {};

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const products = await Product.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const totalProducts = await Product.countDocuments(query);

    res.json({
      products,
      totalPages: Math.ceil(totalProducts / limit),
      currentPage: page,
      totalProducts
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single product - THIS SHOULD BE LAST
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

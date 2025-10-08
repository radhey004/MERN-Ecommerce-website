import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Star, 
  Heart, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Truck,
  Shield,
  ArrowLeft,
  Check,
  Zap,
  Package,
  Clock,
  ArrowRight
} from 'lucide-react'
import api from '../utils/api'
import { formatPrice } from '../utils/currency'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { toast } from 'react-toastify'
import LazyImage from '../components/LazyImage'

const ProductDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedColor, setSelectedColor] = useState('')
  const [selectedSize, setSelectedSize] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [isWishlist, setIsWishlist] = useState(false)
  const [addingToCart, setAddingToCart] = useState(false)
  const [activeTab, setActiveTab] = useState('description')

  const { isAuthenticated } = useAuth()
  const { addToCart } = useCart()

  useEffect(() => {
    fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/products/${id}`)
      const productData = response.data
      setProduct(productData)
      
      // Set default selections
      if (productData.colors && productData.colors.length > 0) {
        setSelectedColor(productData.colors[0])
      }
      if (productData.sizes && productData.sizes.length > 0) {
        setSelectedSize(productData.sizes[0])
      }
    } catch (error) {
      console.error('Error fetching product:', error)
      toast.error('Product not found')
      navigate('/products')
    } finally {
      setLoading(false)
    }
  }

  // ✅ Check if product is already in wishlist
  useEffect(() => {
    if (isAuthenticated && product) {
      checkWishlistStatus()
    }
  }, [isAuthenticated, product])

  const checkWishlistStatus = async () => {
    try {
      const res = await api.get('/users/wishlist')
      const wishlistIds = res.data.data.map(item => item._id)
      setIsWishlist(wishlistIds.includes(product._id))
    } catch (error) {
      console.error('Error checking wishlist:', error)
    }
  }

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart')
      return
    }

    if (product.stock <= 0) {
      toast.error('Product is out of stock')
      return
    }

    try {
      setAddingToCart(true)
      await addToCart(product._id, quantity)
    } catch (error) {
      console.error('Error adding to cart:', error)
    } finally {
      setAddingToCart(false)
    }
  }

  // ✅ Add/remove from wishlist in backend
  const handleWishlist = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to manage wishlist')
      return
    }

    try {
      if (isWishlist) {
        await api.delete(`/users/wishlist/remove/${product._id}`)
        setIsWishlist(false)
        toast.success('Removed from wishlist')
      } else {
        await api.post(`/users/wishlist/add/${product._id}`)
        setIsWishlist(true)
        toast.success('Added to wishlist')
      }
    } catch (error) {
      console.error('Wishlist error:', error)
      toast.error('Failed to update wishlist')
    }
  }

  const increaseQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1)
    }
  }

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  // Calculate discount percentage
  const discountPercentage = product?.originalPrice && product.originalPrice > product.price 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Image skeleton */}
            <div>
              <div className="skeleton h-96 w-full rounded-lg mb-4"></div>
              <div className="flex space-x-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="skeleton h-20 w-20 rounded-lg"></div>
                ))}
              </div>
            </div>
            
            {/* Content skeleton */}
            <div>
              <div className="skeleton h-8 w-3/4 mb-4"></div>
              <div className="skeleton h-4 w-1/2 mb-6"></div>
              <div className="skeleton h-6 w-1/3 mb-8"></div>
              <div className="space-y-3 mb-8">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="skeleton h-3 w-full"></div>
                ))}
              </div>
              <div className="skeleton h-12 w-full mb-4"></div>
              <div className="skeleton h-12 w-full"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h2>
          <button
            onClick={() => navigate('/products')}
            className="btn-primary"
          >
            Back to Products
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-4 relative">
              {/* Discount Badge */}
              {discountPercentage > 0 && (
                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold z-10">
                  {discountPercentage}% OFF
                </div>
              )}
              
              {/* Featured Badge */}
              {product.featured && (
                <div className="absolute top-4 right-4 bg-primary-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 z-10">
                  <Zap className="h-4 w-4" />
                  Featured
                </div>
              )}
              
              <LazyImage
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-96 object-cover rounded-lg shadow-lg"
              />
            </div>
            
            {/* Thumbnail Images */}
            <div className="flex space-x-4 overflow-x-auto pb-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === index 
                      ? 'border-primary-500 ring-2 ring-primary-200' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <LazyImage
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Brand and Category */}
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="bg-gray-100 px-3 py-1 rounded-full">{product.brand}</span>
              <span className="capitalize">{product.category}</span>
              {product.subcategory && (
                <span className="capitalize">• {product.subcategory}</span>
              )}
            </div>

            <h1 className="text-3xl font-bold text-gray-900">
              {product.name}
            </h1>
            
            {/* Rating and Reviews */}
            <div className="flex items-center gap-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(product.rating) 
                        ? 'text-yellow-400 fill-current' 
                        : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="ml-2 text-sm font-medium text-gray-900">
                  {product.rating.toFixed(1)}
                </span>
              </div>
              <span className="text-sm text-gray-500">
                ({product.numReviews} reviews)
              </span>
              {product.stock > 0 && (
                <span className="text-sm text-green-600 font-medium">
                  ✓ In Stock
                </span>
              )}
            </div>

            {/* Price */}
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-primary-600">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <>
                  <span className="text-xl text-gray-500 line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                  <span className="text-sm font-medium text-red-600 bg-red-50 px-2 py-1 rounded">
                    Save {formatPrice(product.originalPrice - product.price)}
                  </span>
                </>
              )}
            </div>


            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Size</h4>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 rounded-lg border-2 transition-all ${
                        selectedSize === size
                          ? 'border-primary-500 bg-primary-50 text-primary-700 font-semibold'
                          : 'border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={decreaseQuantity}
                    disabled={quantity <= 1}
                    className="p-3 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-6 py-3 border-x border-gray-300 font-semibold min-w-12 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={increaseQuantity}
                    disabled={quantity >= product.stock}
                    className="p-3 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="text-lg font-semibold text-gray-900">
                  Total: {formatPrice(product.price * quantity)}
                </div>
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddToCart}
                  disabled={addingToCart || product.stock === 0}
                  className={`flex-1 flex items-center justify-center gap-2 px-8 py-4 rounded-lg font-semibold transition-colors ${
                    product.stock === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : addingToCart
                      ? 'bg-primary-400 text-white cursor-not-allowed'
                      : 'bg-primary-600 hover:bg-primary-700 text-white'
                  }`}
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span>
                    {addingToCart ? 'Adding...' : product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleWishlist}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    isWishlist
                      ? 'bg-red-50 border-red-500 text-red-500'
                      : 'border-gray-300 text-gray-600 hover:border-red-500 hover:text-red-500'
                  }`}
                >
                  <Heart className={`h-5 w-5 ${isWishlist ? 'fill-current' : ''}`} />
                </motion.button>
              </div>
            </div>

            {/* Shipping Info */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              {product.shipping?.freeShipping && (
                <div className="flex items-center gap-3 text-green-600">
                  <Truck className="h-5 w-5" />
                  <span className="font-medium">Free Shipping</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-gray-600">
                <Package className="h-5 w-5" />
                <span>
                  Delivery: {product.shipping?.deliveryTime || '3-5 business days'}
                </span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Clock className="h-5 w-5" />
                <span>
                  Returns: {product.shipping?.returnPolicy || 30} days return policy
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Additional Details Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16"
        >
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {['description', 'specifications', 'shipping'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                    activeTab === tab
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          <div className="py-8">
            {activeTab === 'description' && (
              <div className="prose max-w-none">
                <p className="text-gray-600 leading-relaxed text-lg">
                  {product.description}
                </p>
              </div>
            )}

            {activeTab === 'specifications' && product.specifications && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-3 border-b border-gray-100">
                    <span className="font-medium text-gray-900 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}:
                    </span>
                    <span className="text-gray-600">{value}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                  <Truck className="h-6 w-6 text-blue-600" />
                  <div>
                    <h4 className="font-semibold text-blue-900">Shipping Information</h4>
                    <p className="text-blue-700">
                      {product.shipping?.freeShipping 
                        ? 'Free shipping on this product' 
                        : 'Standard shipping rates apply'}
                    </p>
                    <p className="text-sm text-blue-600">
                      Estimated delivery: {product.shipping?.deliveryTime || '3-5 business days'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg">
                  <Shield className="h-6 w-6 text-green-600" />
                  <div>
                    <h4 className="font-semibold text-green-900">Return Policy</h4>
                    <p className="text-green-700">
                      {product.shipping?.returnPolicy || 30} days return policy
                    </p>
                    <p className="text-sm text-green-600">
                      Easy returns and full refund within the return period
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default ProductDetail
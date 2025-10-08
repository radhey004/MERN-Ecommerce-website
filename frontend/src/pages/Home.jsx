import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Star, Truck, Shield, Headphones, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react'
import api from '../utils/api'
import ProductCard from '../components/ProductCard'
import LazyImage from '../components/LazyImage'

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [categories] = useState([
    { name: 'Men', slug: 'men', image: 'https://images.pexels.com/photos/9558577/pexels-photo-9558577.jpeg' },
    { name: 'Women', slug: 'women', image: 'https://images.pexels.com/photos/1126993/pexels-photo-1126993.jpeg' },
    { name: 'Electronics', slug: 'electronics', image: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg' },
    { name: 'Home', slug: 'home', image: 'https://images.pexels.com/photos/1090638/pexels-photo-1090638.jpeg' }
  ])

  const heroSlides = [
    {
      image: '/banner-4.png', // Your local image from public folder
      title: 'Discover Your',
      highlight: 'Perfect Style',
      description: 'Shop from thousands of premium products with fast delivery across India. Quality guaranteed, satisfaction assured.'
    },
    {
      image: '/banner-2.jpg', // Your local image from public folder
      title: 'Discover Your',
      highlight: 'Perfect Style', 
      description: 'Shop from thousands of premium products with fast delivery across India. Quality guaranteed, satisfaction assured.'
    },
    {
      image: '/banner-3.jpg', // Your local image from public folder
      title: 'Discover Your',
      highlight: 'Perfect Style',
      description: 'Shop from thousands of premium products with fast delivery across India. Quality guaranteed, satisfaction assured.'
    },
    {
      image: '/banner-5.png', // Your local image from public folder
      title: 'Discover Your',
      highlight: 'Perfect Style',
      description: 'Shop from thousands of premium products with fast delivery across India. Quality guaranteed, satisfaction assured.'
    },
    {
      image: '/banner-1.jpg', // Your local image from public folder
      title: 'Discover Your',
      highlight: 'Perfect Style',
      description: 'Shop from thousands of premium products with fast delivery across India. Quality guaranteed, satisfaction assured.'
    }
  ]

  useEffect(() => {
    fetchFeaturedProducts()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide()
    }, 4000)

    return () => clearInterval(interval)
  }, [currentSlide])

  const fetchFeaturedProducts = async () => {
    try {
      const response = await api.get('/products/featured')
      setFeaturedProducts(response.data)
    } catch (error) {
      console.error('Error fetching featured products:', error)
    } finally {
      setLoading(false)
    }
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)
  }

  const goToSlide = (index) => {
    setCurrentSlide(index)
  }

  const features = [
    {
      icon: Truck,
      title: 'Free Shipping',
      description: 'Free shipping on orders above ₹999'
    },
    {
      icon: Shield,
      title: 'Secure Payment',
      description: '100% secure payment processing'
    },
    {
      icon: RefreshCw,
      title: 'Easy Returns',
      description: '30-day return policy'
    },
    {
      icon: Headphones,
      title: '24/7 Support',
      description: 'Round-the-clock customer support'
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[70vh] text-white overflow-hidden"> 
        {/* Background Images */}
        <div className="absolute inset-0">
          {heroSlides.map((slide, index) => (
            <motion.div
              key={index}
              className={`absolute inset-0 ${index === currentSlide ? 'z-10' : 'z-0'}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: index === currentSlide ? 1 : 0 }}
              transition={{ duration: 0.8 }}
            >
              <LazyImage
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black opacity-40"></div>
            </motion.div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 transition-all duration-200 group"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 transition-all duration-200 group"
          aria-label="Next slide"
        >
          <ChevronRight className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex space-x-3">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'bg-white scale-125' 
                  : 'bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center lg:text-left"
              >
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                  {heroSlides[currentSlide].title}
                  <span className="block text-yellow-300">
                    {heroSlides[currentSlide].highlight}
                  </span>
                </h1>
                <p className="text-xl mb-8 text-gray-200 max-w-2xl">
                  {heroSlides[currentSlide].description}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link
                    to="/products"
                    className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-gray-50 transition-colors"
                  >
                    Shop Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </div>
              </motion.div>
              
              
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 text-primary-600 rounded-full mb-4">
                  <feature.icon className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Shop by Category
            </h2>
            <p className="text-xl text-gray-600">
              Explore our curated collections
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={category.slug}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link
                  to={`/products?category=${category.slug}`}
                  className="block group"
                >
                  <div className="relative overflow-hidden rounded-lg shadow-lg">
                    <LazyImage
                      src={category.image}
                      alt={category.name}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-30 transition-opacity"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <h3 className="text-white text-xl font-bold">
                        {category.name}
                      </h3>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Featured Products
            </h2>
            <p className="text-xl text-gray-600">
              Handpicked items just for you
            </p>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="skeleton h-48 w-full"></div>
                  <div className="p-4">
                    <div className="skeleton h-4 w-3/4 mb-2"></div>
                    <div className="skeleton h-3 w-full mb-3"></div>
                    <div className="skeleton h-3 w-2/3 mb-4"></div>
                    <div className="flex justify-between items-center">
                      <div className="skeleton h-4 w-16"></div>
                      <div className="skeleton h-8 w-24"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.slice(0, 8).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/products"
              className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors"
            >
              View All Products
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              Stay Updated
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Get the latest deals and product updates delivered to your inbox
            </p>
            <form className="max-w-md mx-auto flex gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700 transition-colors"
              >
                Subscribe
              </button>
            </form>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default Home

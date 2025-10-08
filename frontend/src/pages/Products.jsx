import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Filter, Grid2x2 as Grid, List, X, Search } from 'lucide-react'
import api from '../utils/api'
import ProductCard from '../components/ProductCard'

const Products = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState([])
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState('grid')
  const [searchInput, setSearchInput] = useState('')
  
  const [searchParams, setSearchParams] = useSearchParams()
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || 'all',
    search: searchParams.get('search') || '',
    sortBy: searchParams.get('sort') || 'newest',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    featured: searchParams.get('featured') || false,
    inStock: searchParams.get('inStock') || false
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [filters])

  useEffect(() => {
    const params = new URLSearchParams(searchParams)
    setFilters(prev => ({
      ...prev,
      category: params.get('category') || 'all',
      search: params.get('search') || '',
      sortBy: params.get('sort') || 'newest',
      minPrice: params.get('minPrice') || '',
      maxPrice: params.get('maxPrice') || '',
      featured: params.get('featured') === 'true',
      inStock: params.get('inStock') === 'true'
    }))
    setSearchInput(params.get('search') || '')
  }, [searchParams])

  const fetchCategories = async () => {
    try {
      const response = await api.get('/products/categories/list')
      setCategories(['all', ...response.data])
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      if (filters.category && filters.category !== 'all') {
        params.append('category', filters.category)
      }
      if (filters.search) {
        params.append('search', filters.search)
      }
      if (filters.featured) {
        params.append('featured', 'true')
      }
      
      const response = await api.get(`/products?${params.toString()}`)
      let fetchedProducts = response.data.products

      // Apply sorting
      switch (filters.sortBy) {
        case 'price-low':
          fetchedProducts.sort((a, b) => a.price - b.price)
          break
        case 'price-high':
          fetchedProducts.sort((a, b) => b.price - a.price)
          break
        case 'rating':
          fetchedProducts.sort((a, b) => b.rating - a.rating)
          break
        case 'name':
          fetchedProducts.sort((a, b) => a.name.localeCompare(b.name))
          break
        case 'newest':
        default:
          fetchedProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          break
      }

      // Apply price filtering
      if (filters.minPrice || filters.maxPrice) {
        fetchedProducts = fetchedProducts.filter(product => {
          const price = product.price
          const min = filters.minPrice ? parseInt(filters.minPrice) : 0
          const max = filters.maxPrice ? parseInt(filters.maxPrice) : Infinity
          return price >= min && price <= max
        })
      }

      // Apply stock filtering
      if (filters.inStock) {
        fetchedProducts = fetchedProducts.filter(product => product.stock > 0)
      }

      setProducts(fetchedProducts)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    updateURLParams(newFilters)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    handleFilterChange('search', searchInput)
  }

  const updateURLParams = (newFilters) => {
    const params = new URLSearchParams()
    
    if (newFilters.category && newFilters.category !== 'all') {
      params.set('category', newFilters.category)
    }
    if (newFilters.search) {
      params.set('search', newFilters.search)
    }
    if (newFilters.sortBy && newFilters.sortBy !== 'newest') {
      params.set('sort', newFilters.sortBy)
    }
    if (newFilters.minPrice) {
      params.set('minPrice', newFilters.minPrice)
    }
    if (newFilters.maxPrice) {
      params.set('maxPrice', newFilters.maxPrice)
    }
    if (newFilters.featured) {
      params.set('featured', 'true')
    }
    if (newFilters.inStock) {
      params.set('inStock', 'true')
    }
    
    setSearchParams(params)
  }

  const clearFilters = () => {
    const newFilters = {
      category: 'all',
      search: '',
      sortBy: 'newest',
      minPrice: '',
      maxPrice: '',
      featured: false,
      inStock: false
    }
    setFilters(newFilters)
    setSearchInput('')
    setSearchParams({})
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (filters.category !== 'all') count++
    if (filters.search) count++
    if (filters.minPrice || filters.maxPrice) count++
    if (filters.featured) count++
    if (filters.inStock) count++
    return count
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {filters.category !== 'all' ? `${filters.category.charAt(0).toUpperCase() + filters.category.slice(1)} Products` : 'All Products'}
            </h1>
            <p className="text-gray-600">
              {loading ? 'Loading...' : `${products.length} product${products.length !== 1 ? 's' : ''} found`}
            </p>
          </div>

          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            

            {/* Sort Dropdown */}
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="newest">Newest First</option>
              <option value="name">Name A-Z</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 relative"
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
              {getActiveFilterCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getActiveFilterCount()}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Active Filters */}
        {getActiveFilterCount() > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {filters.category !== 'all' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                Category: {filters.category}
                <button
                  onClick={() => handleFilterChange('category', 'all')}
                  className="ml-2 hover:text-primary-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {filters.featured && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Featured
                <button
                  onClick={() => handleFilterChange('featured', false)}
                  className="ml-2 hover:text-green-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {filters.inStock && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                In Stock Only
                <button
                  onClick={() => handleFilterChange('inStock', false)}
                  className="ml-2 hover:text-green-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {(filters.minPrice || filters.maxPrice) && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Price: {filters.minPrice || '0'} - {filters.maxPrice || '∞'}
                <button
                  onClick={() => {
                    handleFilterChange('minPrice', '')
                    handleFilterChange('maxPrice', '')
                  }}
                  className="ml-2 hover:text-yellow-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <motion.div
            initial={false}
            animate={{ 
              width: showFilters ? 'auto' : 0,
              opacity: showFilters ? 1 : 0
            }}
            className={`lg:w-80 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}
          >
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">{getActiveFilterCount()} active</span>
                  <button
                    onClick={clearFilters}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Category</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {categories.map((category) => (
                    <label key={category} className="flex items-center">
                      <input
                        type="radio"
                        name="category"
                        value={category}
                        checked={filters.category === category}
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700 capitalize">
                        {category === 'all' ? 'All Categories' : category}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Price Range (₹)</h4>
                <div className="space-y-2">
                  <input
                    type="number"
                    placeholder="Min Price"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <input
                    type="number"
                    placeholder="Max Price"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              {/* Additional Filters */}
              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.featured}
                    onChange={(e) => handleFilterChange('featured', e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Featured Products</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.inStock}
                    onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">In Stock Only</span>
                </label>
              </div>
            </div>
          </motion.div>

          {/* Products Grid */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {[...Array(12)].map((_, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                    <div className="bg-gray-300 h-48 w-full"></div>
                    <div className="p-4">
                      <div className="bg-gray-300 h-4 w-3/4 mb-2 rounded"></div>
                      <div className="bg-gray-300 h-3 w-full mb-3 rounded"></div>
                      <div className="bg-gray-300 h-3 w-2/3 mb-4 rounded"></div>
                      <div className="flex justify-between items-center">
                        <div className="bg-gray-300 h-4 w-16 rounded"></div>
                        <div className="bg-gray-300 h-8 w-24 rounded"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {products.map((product) => (
                  <ProductCard 
                    key={product._id} 
                    product={product}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No products found
                </h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your filters or search terms
                </p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Products
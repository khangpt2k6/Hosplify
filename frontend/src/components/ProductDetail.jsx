import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      try {
        // In a real implementation, this would be your API endpoint
        // Here we're simulating an API call with a timeout
        const response = await new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              data: {
                id,
                name: `Health Product ${id}`,
                price: (Math.random() * 50 + 5).toFixed(2),
                brand: 'HealthBrand',
                category: 'Health Products',
                description: 'This premium health product is designed to support overall wellness. Made with high-quality ingredients and manufactured under strict quality control standards. Suitable for daily use as part of your health regimen.',
                rating: (Math.random() * 3 + 2).toFixed(1),
                reviews: Math.floor(Math.random() * 500) + 1,
                inStock: Math.random() > 0.2,
                image: `/api/placeholder/400/400`,
                discount: Math.random() > 0.7 ? Math.floor(Math.random() * 30) + 5 : 0,
                details: {
                  ingredients: 'Vitamin C, Zinc, Echinacea Extract, Elderberry Extract, Honey, Natural Flavors.',
                  directions: 'Take one tablet daily with food. Do not exceed recommended dosage.',
                  warnings: 'Keep out of reach of children. Do not use if seal is broken. Consult with a physician before use if you are pregnant, nursing, or have a medical condition.',
                  manufacturer: 'HealthBrand Pharmaceuticals, 123 Wellness Way, Health City, HC 12345'
                }
              }
            });
          }, 800);
        });
        
        setProduct(response.data);
      } catch (err) {
        setError('Failed to fetch product details. Please try again later.');
        console.error('Error fetching product details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    setQuantity(value >= 1 ? value : 1);
  };

  const decreaseQuantity = () => {
    setQuantity(prev => (prev > 1 ? prev - 1 : 1));
  };

  const increaseQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">
          <p>{error}</p>
          <Link to="/" className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Return to Pharmacy
          </Link>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded">
          <p>Product not found.</p>
          <Link to="/" className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Return to Pharmacy
          </Link>
        </div>
      </div>
    );
  }

  // Calculate discounted price
  const discountedPrice = product.discount > 0 
    ? (product.price - (product.price * product.discount / 100)).toFixed(2)
    : null;

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-200 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Breadcrumb */}
          <nav className="flex mb-6 text-sm text-gray-600">
            <Link to="/" className="hover:text-blue-600">Home</Link>
            <span className="mx-2">/</span>
            <Link to="/" className="hover:text-blue-600">Pharmacy</Link>
            <span className="mx-2">/</span>
            <Link to={`/category/${product.category}`} className="hover:text-blue-600">
              {product.category}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900 font-medium">{product.name}</span>
          </nav>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Product Image */}
            <div className="w-full md:w-2/5">
              <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-center">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="max-h-96 object-contain"
                />
              </div>
              {product.discount > 0 && (
                <div className="mt-4 bg-red-100 text-red-700 text-center py-2 px-4 rounded">
                  <span className="font-bold">Save {product.discount}%</span> on this product!
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="w-full md:w-3/5">
              <div className="mb-2">
                <span className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded">
                  {product.category}
                </span>
                <h4 className="text-gray-500 mt-2">{product.brand}</h4>
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-4">{product.name}</h1>

              {/* Rating */}
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400 mr-2">
                  {[...Array(5)].map((_, i) => (
                    <svg 
                      key={i} 
                      className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}`} 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-gray-600">{product.rating} ({product.reviews} reviews)</span>
              </div>

              {/* Price */}
              <div className="mb-6">
                {discountedPrice ? (
                  <div className="flex items-center">
                    <span className="text-3xl font-bold text-blue-700 mr-3">${discountedPrice}</span>
                    <span className="text-lg text-gray-500 line-through">${product.price}</span>
                  </div>
                ) : (
                  <span className="text-3xl font-bold text-blue-700">${product.price}</span>
                )}
              </div>

              {/* Availability */}
              <div className="mb-6">
                {product.inStock ? (
                  <div className="text-green-600 flex items-center">
                    <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>In Stock</span>
                  </div>
                ) : (
                  <div className="text-red-600 flex items-center">
                    <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span>Out of Stock</span>
                  </div>
                )}
              </div>

              {/* Quantity */}
              {product.inStock && (
                <div className="mb-6">
                  <label className="block text-gray-700 font-medium mb-2">Quantity</label>
                  <div className="flex">
                    <button 
                      onClick={decreaseQuantity}
                      className="bg-gray-200 px-4 py-2 rounded-l"
                    >
                      -
                    </button>
                    <input 
                      type="number" 
                      value={quantity} 
                      onChange={handleQuantityChange}
                      min="1"
                      className="w-16 text-center border-t border-b border-gray-300"
                    />
                    <button 
                      onClick={increaseQuantity}
                      className="bg-gray-200 px-4 py-2 rounded-r"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* Add to Cart Button */}
              <div className="mb-6">
                <button 
                  className={`w-full py-3 px-6 rounded-lg font-bold text-white ${
                    product.inStock 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                  disabled={!product.inStock}
                >
                  {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                </button>
              </div>

              {/* Quick Actions */}
              <div className="flex space-x-4 text-gray-600">
                <button className="flex items-center hover:text-blue-600">
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  Add to Wishlist
                </button>
                <button className="flex items-center hover:text-blue-600">
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  Share
                </button>
              </div>
            </div>
          </div>

          {/* Product Details Tabs */}
          <div className="mt-12">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8">
                <button
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'description'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab('description')}
                >
                  Description
                </button>
                <button
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'details'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab('details')}
                >
                  Details
                </button>
                <button
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'reviews'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab('reviews')}
                >
                  Reviews
                </button>
              </nav>
            </div>

            <div className="py-6">
              {activeTab === 'description' && (
                <div>
                  <p className="text-gray-700 leading-relaxed">{product.description}</p>
                </div>
              )}

              {activeTab === 'details' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Ingredients</h3>
                    <p className="text-gray-700">{product.details.ingredients}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Directions</h3>
                    <p className="text-gray-700">{product.details.directions}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Warnings</h3>
                    <p className="text-gray-700">{product.details.warnings}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Manufacturer</h3>
                    <p className="text-gray-700">{product.details.manufacturer}</p>
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div>
                  <div className="flex items-center mb-6">
                    <div className="flex items-center">
                      <span className="text-3xl font-bold text-gray-900 mr-2">{product.rating}</span>
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <svg 
                            key={i} 
                            className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}`} 
                            fill="currentColor" 
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <span className="ml-2 text-gray-600">Based on {product.reviews} reviews</span>
                  </div>
                  
                  <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded">
                    Write a Review
                  </button>
                  
                  {/* Sample reviews - in a real app, these would be loaded from an API */}
                  <div className="mt-8 space-y-8">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="border-b border-gray-200 pb-6">
                        <div className="flex items-center mb-2">
                          <div className="flex text-yellow-400 mr-2">
                            {[...Array(5)].map((_, j) => (
                              <svg 
                                key={j} 
                                className={`w-4 h-4 ${j < 4 + (i % 2) ? 'text-yellow-400' : 'text-gray-300'}`} 
                                fill="currentColor" 
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <h4 className="font-bold">User{i + 1}</h4>
                        </div>
                        <h3 className="font-medium mb-2">
                          {["Great product!", "Works as described", "Highly recommend"][i]}
                        </h3>
                        <p className="text-gray-600 mb-2">
                          {["I've been using this for a month and have seen great results. Will purchase again.", 
                            "This product worked exactly as described. Very satisfied with my purchase.", 
                            "The quality exceeded my expectations. Shipping was fast and the price was reasonable."][i]}
                        </p>
                        <span className="text-sm text-gray-500">Posted {i + 1} month{i === 0 ? '' : 's'} ago</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Related Products */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-200">
                  <img 
                    src="/api/placeholder/200/150" 
                    alt={`Related Product ${i + 1}`} 
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 mb-1">Related Product {i + 1}</h3>
                    <div className="text-lg font-bold text-blue-700">${(Math.random() * 30 + 5).toFixed(2)}</div>
                    <button className="mt-2 w-full bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium py-1 px-3 rounded transition duration-200">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
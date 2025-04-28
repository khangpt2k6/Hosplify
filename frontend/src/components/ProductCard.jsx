const ProductCard = ({ product }) => {
    const {
      name,
      price,
      brand,
      rating,
      reviews,
      category,
      image,
      discount,
      inStock
    } = product;
  
    // Calculate discounted price
    const discountedPrice = discount > 0 
      ? (price - (price * discount / 100)).toFixed(2)
      : null;
  
    return (
      <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-200">
        <div className="relative">
          <img 
            src={image} 
            alt={name} 
            className="w-full h-48 object-cover"
          />
          {discount > 0 && (
            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              {discount}% OFF
            </div>
          )}
          <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded">
            {category}
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="text-sm text-gray-500 mb-1">{brand}</h3>
          <h2 className="font-semibold text-lg text-gray-800 mb-2 line-clamp-2 h-14">{name}</h2>
          
          <div className="flex items-center mb-2">
            <div className="flex text-yellow-400 mr-1">
              {[...Array(5)].map((_, i) => (
                <svg 
                  key={i} 
                  className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`} 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-gray-600 text-sm">{rating} ({reviews})</span>
          </div>
          
          <div className="mt-4 flex items-baseline gap-2">
            {discountedPrice ? (
              <>
                <span className="text-lg font-bold text-blue-700">${discountedPrice}</span>
                <span className="text-sm text-gray-500 line-through">${price}</span>
              </>
            ) : (
              <span className="text-lg font-bold text-blue-700">${price}</span>
            )}
          </div>
          
          <div className="mt-4">
            {inStock ? (
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition duration-200">
                Add to Cart
              </button>
            ) : (
              <button disabled className="w-full bg-gray-300 text-gray-500 font-medium py-2 px-4 rounded cursor-not-allowed">
                Out of Stock
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  export default ProductCard;
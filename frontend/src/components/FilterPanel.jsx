const FilterPanel = ({ categories, selectedCategory, onCategoryChange, onSort }) => {
    return (
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
        <h3 className="font-bold text-blue-800 text-lg mb-4">Filters</h3>
        
        {/* Categories */}
        <div className="mb-6">
          <h4 className="font-semibold text-blue-700 mb-2">Categories</h4>
          <div className="space-y-2">
            <div 
              className={`cursor-pointer py-1 px-2 rounded ${selectedCategory === 'all' ? 'bg-blue-600 text-white' : 'hover:bg-blue-100'}`}
              onClick={() => onCategoryChange('all')}
            >
              All Products
            </div>
            
            {categories.map(category => (
              <div 
                key={category}
                className={`cursor-pointer py-1 px-2 rounded ${selectedCategory === category ? 'bg-blue-600 text-white' : 'hover:bg-blue-100'}`}
                onClick={() => onCategoryChange(category)}
              >
                {category}
              </div>
            ))}
          </div>
        </div>
        
        {/* Sort */}
        <div className="mb-6">
          <h4 className="font-semibold text-blue-700 mb-2">Sort By</h4>
          <select 
            className="w-full p-2 border border-blue-200 rounded bg-white"
            onChange={(e) => onSort(e.target.value)}
            defaultValue=""
          >
            <option value="" disabled>Select option</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Top Rated</option>
            <option value="name">Name: A-Z</option>
          </select>
        </div>
        
        {/* Price Range Filter */}
        <div className="mb-6">
          <h4 className="font-semibold text-blue-700 mb-2">Price Range</h4>
          <div className="flex items-center space-x-2">
            <input 
              type="number" 
              placeholder="Min" 
              className="w-1/2 p-2 border border-blue-200 rounded"
              min="0"
            />
            <span className="text-gray-500">-</span>
            <input 
              type="number" 
              placeholder="Max" 
              className="w-1/2 p-2 border border-blue-200 rounded"
              min="0"
            />
          </div>
          <button className="mt-2 w-full py-1 px-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200">
            Apply
          </button>
        </div>
        
        {/* Rating Filter */}
        <div className="mb-6">
          <h4 className="font-semibold text-blue-700 mb-2">Rating</h4>
          <div className="space-y-2">
            {[4, 3, 2, 1].map(star => (
              <div key={star} className="flex items-center">
                <input type="checkbox" id={`rating-${star}`} className="mr-2" />
                <label htmlFor={`rating-${star}`} className="flex items-center cursor-pointer">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg 
                        key={i} 
                        className={`w-4 h-4 ${i < star ? 'text-yellow-400' : 'text-gray-300'}`} 
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="ml-1">& Up</span>
                </label>
              </div>
            ))}
          </div>
        </div>
        
        {/* Availability */}
        <div className="mb-6">
          <h4 className="font-semibold text-blue-700 mb-2">Availability</h4>
          <div className="space-y-2">
            <div className="flex items-center">
              <input type="checkbox" id="in-stock" className="mr-2" />
              <label htmlFor="in-stock" className="cursor-pointer">In Stock</label>
            </div>
            <div className="flex items-center">
              <input type="checkbox" id="discount" className="mr-2" />
              <label htmlFor="discount" className="cursor-pointer">Discount Offers</label>
            </div>
          </div>
        </div>
        
        <button className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded transition duration-200">
          Clear All Filters
        </button>
      </div>
    );
  };
  
  export default FilterPanel;
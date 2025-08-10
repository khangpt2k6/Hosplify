import { useState, useEffect } from 'react';
import SearchBar from "../components/SearchBar";
import ProductGrid from '../components/ProductGrid';
import FilterPanel from '../components/FilterPanel';
import Pagination from '../components/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';

const Pharmacy = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);

  // Fetch products from API
  const fetchProducts = async (query = '') => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real implementation, this would be your API endpoint for web scraping
      // Here we're simulating an API call with a timeout
      const response = await new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            data: generateMockProducts(query)
          });
        }, 800);
      });
      
      const productData = response.data;
      setProducts(productData);
      setFilteredProducts(productData);
      
      // Extract categories from products
      const uniqueCategories = [...new Set(productData.map(item => item.category))];
      setCategories(uniqueCategories);
      
    } catch (err) {
      setError('Failed to fetch products. Please try again later.');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  // Generate mock product data (in a real app, this would come from web scraping)
  const generateMockProducts = (query) => {
    const categories = ['Vitamins', 'Pain Relief', 'First Aid', 'Cold & Flu', 'Digestive Health'];
    const brands = ['HealthPlus', 'NatureCare', 'MediRelief', 'VitaEssentials', 'PharmBest'];
    
    // Filter mock data based on query if provided
    const searchTermLower = query.toLowerCase();
    
    return Array(40).fill().map((_, idx) => {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const brand = brands[Math.floor(Math.random() * brands.length)];
      const rating = (Math.random() * 3 + 2).toFixed(1); // 2.0-5.0 rating
      const id = `prod-${idx + 1}`;
      const price = (Math.random() * 50 + 5).toFixed(2);
      
      // Create product names based on categories
      let name = '';
      switch(category) {
        case 'Vitamins':
          name = `${brand} ${['Vitamin D', 'Vitamin C', 'Multivitamin', 'B Complex', 'Omega-3'][idx % 5]} Supplement`;
          break;
        case 'Pain Relief':
          name = `${brand} ${['Extra Strength', 'Fast Acting', 'Maximum Relief', 'Rapid', 'Advanced'][idx % 5]} Pain Reliever`;
          break;
        case 'First Aid':
          name = `${brand} ${['Bandages', 'Antiseptic Spray', 'Wound Gel', 'Medical Tape', 'First Aid Kit'][idx % 5]}`;
          break;
        case 'Cold & Flu':
          name = `${brand} ${['Cold & Flu Relief', 'Cough Syrup', 'Sinus Relief', 'Throat Lozenges', 'Nighttime Cold Medicine'][idx % 5]}`;
          break;
        case 'Digestive Health':
          name = `${brand} ${['Probiotic', 'Acid Reducer', 'Digestive Enzyme', 'Fiber Supplement', 'Antacid Tablets'][idx % 5]}`;
          break;
        default:
          name = `${brand} Health Product`;
      }
      
      const description = `Premium quality ${category.toLowerCase()} product by ${brand}. Designed to provide effective relief and support your health needs.`;
      
      // Apply search filtering if needed
      if (searchTermLower && 
          !(name.toLowerCase().includes(searchTermLower) || 
            category.toLowerCase().includes(searchTermLower) ||
            brand.toLowerCase().includes(searchTermLower) ||
            description.toLowerCase().includes(searchTermLower))) {
        return null;
      }
      
      return {
        id,
        name,
        price,
        brand,
        category,
        description,
        rating: parseFloat(rating),
        reviews: Math.floor(Math.random() * 500) + 1,
        inStock: Math.random() > 0.2,
        image: `/api/placeholder/200/200`, // Using placeholder images
        discount: Math.random() > 0.7 ? Math.floor(Math.random() * 30) + 5 : 0 // Random discount
      };
    }).filter(item => item !== null);
  };

  // Handle search submission
  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
    fetchProducts(term);
  };

  // Handle category filter
  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    
    if (category === 'all') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product => product.category === category);
      setFilteredProducts(filtered);
    }
  };

  // Sort products
  const handleSort = (sortBy) => {
    let sorted = [...filteredProducts];
    
    switch(sortBy) {
      case 'price-low':
        sorted.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case 'price-high':
        sorted.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;
      case 'rating':
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        // No sorting
    }
    
    setFilteredProducts(sorted);
  };

  // Get current products for pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Load products on initial render
  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-blue-700 mb-6">Online Pharmacy</h1>
          
          <SearchBar onSearch={handleSearch} />
          
          <div className="flex flex-col md:flex-row gap-6 mt-8">
            <div className="w-full md:w-1/4">
              <FilterPanel 
                categories={categories} 
                selectedCategory={selectedCategory}
                onCategoryChange={handleCategoryFilter}
                onSort={handleSort}
              />
            </div>
            
            <div className="w-full md:w-3/4">
              {loading ? (
                <LoadingSpinner />
              ) : error ? (
                <div className="text-red-500 text-center p-4">{error}</div>
              ) : (
                <>
                  <div className="mb-4 text-gray-600">
                    Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredProducts.length)} of {filteredProducts.length} products
                  </div>
                  
                  <ProductGrid products={currentProducts} />
                  
                  <Pagination 
                    itemsPerPage={itemsPerPage}
                    totalItems={filteredProducts.length}
                    paginate={paginate}
                    currentPage={currentPage}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pharmacy;
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, MapPin, Phone, Clock, Globe, Star, Navigation, X, List, Filter, Compass, ChevronUp, Heart, MessageCircle } from 'lucide-react';

// Main App Component
function HospitalFinderApp() {
  // Google Maps API key from environment variables
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  
  // States
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [travelMode, setTravelMode] = useState('DRIVING');
  const [searchQuery, setSearchQuery] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  
  const mapRef = useRef(null);
  const placesServiceRef = useRef(null);
  const autocompleteRef = useRef(null);
  const searchInputRef = useRef(null);
  const directionsServiceRef = useRef(null);
  const directionsRendererRef = useRef(null);
  const resultsListRef = useRef(null);
  
  // Load Google Maps API script
  useEffect(() => {
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      document.head.appendChild(script);
      
      return () => {
        document.head.removeChild(script);
      };
    } else {
      initMap();
    }
  }, [googleMapsApiKey]);
  
  // Initialize map and services
  const initMap = useCallback(() => {
    if (!mapRef.current) return;
    
    // Create map instance with no initial center - will be set by user location
    const mapInstance = new window.google.maps.Map(mapRef.current, {
      zoom: 13,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      styles: [
        {
          featureType: "poi.medical",
          elementType: "geometry",
          stylers: [{ color: "#e6f2f5" }]
        },
        {
          featureType: "poi.medical",
          elementType: "labels.icon",
          stylers: [{ color: "#4db6e5" }]
        }
      ]
    });
    
    setMap(mapInstance);
    
    // Initialize services
    placesServiceRef.current = new window.google.maps.places.PlacesService(mapInstance);
    directionsServiceRef.current = new window.google.maps.DirectionsService();
    directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
      map: mapInstance,
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: "#4db6e5",
        strokeWeight: 5,
        strokeOpacity: 0.7
      }
    });
    
    // Set up autocomplete
    if (searchInputRef.current) {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(searchInputRef.current);
      autocompleteRef.current.addListener('place_changed', handlePlaceSelect);
    }
    
    // Try to get user's location immediately
    getCurrentLocation(mapInstance);
    
  }, []);
  
  // Function to get current location
  const getCurrentLocation = (mapInstance) => {
    setIsLoading(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(userPos);
          
          // Center map on user location
          if (mapInstance) {
            mapInstance.setCenter(userPos);
            
            // Add user location marker with a pulsing effect
            const userMarker = new window.google.maps.Marker({
              position: userPos,
              map: mapInstance,
              icon: {
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: "#4db6e5",
                fillOpacity: 0.9,
                strokeColor: "#ffffff",
                strokeWeight: 2
              },
              title: "Your Location"
            });
            
            // Add pulsing effect animation
            let opacity = 1;
            let expanding = false;
            setInterval(() => {
              if (opacity >= 1) expanding = true;
              if (opacity <= 0.5) expanding = false;
              opacity = expanding ? opacity - 0.1 : opacity + 0.1;
              userMarker.setIcon({
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: "#4db6e5",
                fillOpacity: opacity,
                strokeColor: "#ffffff",
                strokeWeight: 2
              });
            }, 200);
            
            // Search for nearby medical facilities
            searchNearbyMedicalPlaces(userPos);
          }
        },
        (error) => {
          console.error("Error getting user location:", error);
          setIsLoading(false);
          
          // Fall back to default location if user location is not available
          const defaultCenter = { lat: 40.7128, lng: -74.0060 }; // New York City
          if (mapInstance) {
            mapInstance.setCenter(defaultCenter);
          }
        }
      );
    } else {
      setIsLoading(false);
      console.error("Geolocation is not supported by this browser");
    }
  };
  
  // Handle place selection from autocomplete
  const handlePlaceSelect = () => {
    const place = autocompleteRef.current.getPlace();
    if (place.geometry) {
      map.setCenter(place.geometry.location);
      searchNearbyMedicalPlaces(place.geometry.location);
    }
  };
  
  // Search for nearby medical places
  const searchNearbyMedicalPlaces = (location) => {
    setIsLoading(true);
    
    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));
    setMarkers([]);
    
    const categoryMap = {
      'all': ['hospital', 'health', 'doctor', 'clinic', 'medical_center', 'emergency_room'],
      'hospital': ['hospital'],
      'clinic': ['clinic', 'doctor'],
      'medical center': ['medical_center', 'health'],
      'emergency care': ['emergency_room']
    };
    
    const searchTypes = categoryMap[categoryFilter] || categoryMap.all;
    
    // Search for each type and combine results
    const allPromises = searchTypes.map(type => {
      return new Promise((resolve) => {
        const request = {
          location: location,
          radius: 5000, // 5km radius
          type: type,
          keyword: searchQuery || 'medical'
        };
        
        placesServiceRef.current.nearbySearch(request, (results, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK) {
            resolve(results);
          } else {
            resolve([]);
          }
        });
      });
    });
    
    Promise.all(allPromises)
      .then(resultsArray => {
        // Flatten and deduplicate results
        const allResults = [];
        const seenPlaceIds = new Set();
        
        resultsArray.flat().forEach(place => {
          if (!seenPlaceIds.has(place.place_id)) {
            seenPlaceIds.add(place.place_id);
            allResults.push(place);
          }
        });
        
        setSearchResults(allResults);
        
        // Add markers to map with custom icons
        const newMarkers = allResults.map((place, index) => {
          const marker = new window.google.maps.Marker({
            position: place.geometry.location,
            map: map,
            title: place.name,
            animation: window.google.maps.Animation.DROP,
            icon: {
              url: `data:image/svg+xml;utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="%234db6e5" stroke="white" stroke-width="2"/><text x="20" y="25" font-size="16" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-weight="bold">${index + 1}</text></svg>`,
              scaledSize: new window.google.maps.Size(40, 40),
              anchor: new window.google.maps.Point(20, 20)
            }
          });
          
          marker.addListener('click', () => {
            getPlaceDetails(place.place_id);
          });
          
          return marker;
        });
        
        setMarkers(newMarkers);
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Error searching for places:", error);
        setIsLoading(false);
      });
  };
  
  // Get detailed information about a place
  const getPlaceDetails = (placeId) => {
    placesServiceRef.current.getDetails(
      { placeId: placeId, fields: ['name', 'formatted_address', 'formatted_phone_number', 'opening_hours', 'website', 'rating', 'reviews', 'geometry'] },
      (place, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          setSelectedPlace(place);
          map.panTo(place.geometry.location);
        }
      }
    );
  };
  
  // Get directions to selected place
  const getDirections = (destination) => {
    if (!userLocation) return;
    
    const request = {
      origin: userLocation,
      destination: destination.geometry.location,
      travelMode: window.google.maps.TravelMode[travelMode]
    };
    
    directionsServiceRef.current.route(request, (result, status) => {
      if (status === window.google.maps.DirectionsStatus.OK) {
        directionsRendererRef.current.setDirections(result);
      }
    });
  };
  
  // Clear directions
  const clearDirections = () => {
    directionsRendererRef.current.setDirections({ routes: [] });
  };
  
  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (userLocation) {
      searchNearbyMedicalPlaces(userLocation);
    }
  };
  
  // Handle travel mode change
  const handleTravelModeChange = (mode) => {
    setTravelMode(mode);
    if (selectedPlace) {
      getDirections(selectedPlace);
    }
  };
  
  // Search based on category filter
  const handleCategoryChange = (category) => {
    setCategoryFilter(category);
    if (userLocation) {
      searchNearbyMedicalPlaces(userLocation);
    }
  };
  
  // Handle scroll event in results list
  useEffect(() => {
    const handleScroll = () => {
      if (resultsListRef.current) {
        setShowScrollTop(resultsListRef.current.scrollTop > 200);
      }
    };
    
    const resultsList = resultsListRef.current;
    if (resultsList) {
      resultsList.addEventListener('scroll', handleScroll);
      return () => resultsList.removeEventListener('scroll', handleScroll);
    }
  }, []);
  
  // Scroll to top of results list
  const scrollToTop = () => {
    if (resultsListRef.current) {
      resultsListRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  return (
    <div className="flex h-screen w-full bg-gray-50">
      {/* Sidebar */}
      <div className={`bg-white shadow-lg z-10 transition-all ${showSidebar ? 'w-96' : 'w-0'}`}>
        {showSidebar && (
          <div className="h-full flex flex-col">
            {/* Search Header */}
            <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-cyan-100 rounded-b-lg">
              <h1 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <Heart size={24} className="text-blue-500 mr-2 fill-blue-500" /> Hospital Finder
              </h1>
              <form onSubmit={handleSearch} className="relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search for location"
                  className="w-full py-2 px-10 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <button type="submit" className="absolute right-3 top-2 bg-blue-500 text-white p-1 rounded-full hover:bg-blue-600 transition">
                  <Search size={16} />
                </button>
              </form>
            </div>
            
            {/* Filters */}
            <div className="p-4 border-b bg-white">
              <div className="flex items-center mb-2">
                <Filter size={16} className="text-blue-500 mr-2" />
                <h2 className="text-sm font-semibold text-gray-700">Category</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {['all', 'hospital', 'clinic', 'medical center', 'emergency care'].map((category) => (
                  <button
                    key={category}
                    className={`text-xs px-3 py-1 rounded-full transition ${
                      categoryFilter === category
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-800 hover:bg-blue-100'
                    }`}
                    onClick={() => handleCategoryChange(category)}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>
              
              <div className="flex items-center mt-4 mb-2">
                <Navigation size={16} className="text-blue-500 mr-2" />
                <h2 className="text-sm font-semibold text-gray-700">Transportation</h2>
              </div>
              <div className="flex gap-2">
                {[
                  { id: 'DRIVING', label: 'Car', icon: '🚗' },
                  { id: 'WALKING', label: 'Walk', icon: '🚶' },
                  { id: 'TRANSIT', label: 'Transit', icon: '🚆' }
                ].map((mode) => (
                  <button
                    key={mode.id}
                    className={`text-xs px-3 py-1 rounded-full flex items-center transition ${
                      travelMode === mode.id
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-800 hover:bg-blue-100'
                    }`}
                    onClick={() => handleTravelModeChange(mode.id)}
                  >
                    <span className="mr-1">{mode.icon}</span> {mode.label}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Results List with Explicit Scrollbar */}
            <div 
              ref={resultsListRef}
              className="flex-1 overflow-y-auto relative scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-blue-50"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#93c5fd #dbeafe'
              }}
            >
              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="relative w-16 h-16">
                    <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 rounded-full animate-ping"></div>
                    <div className="absolute top-1 left-1 w-14 h-14 border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                  </div>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="divide-y">
                  {searchResults.map((place, index) => (
                    <div 
                      key={place.place_id}
                      className={`p-4 cursor-pointer hover:bg-blue-50 transition ${selectedPlace?.place_id === place.place_id ? 'bg-blue-50' : ''}`}
                      onClick={() => getPlaceDetails(place.place_id)}
                    >
                      <div className="flex items-start">
                        <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0 shadow-md">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{place.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{place.vicinity}</p>
                          {place.rating && (
                            <div className="flex items-center mt-1">
                              <Star size={14} className="text-yellow-400 fill-yellow-400" />
                              <span className="text-sm text-gray-600 ml-1">{place.rating}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <div className="flex justify-center">
                    <MapPin size={48} className="text-blue-300" />
                  </div>
                  <p className="mt-4 text-gray-500">
                    {userLocation ? "No results found" : "Share your location or search for an area"}
                  </p>
                </div>
              )}
              
              {/* Scroll to top button */}
              {showScrollTop && (
                <button 
                  className="absolute bottom-4 right-4 bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600 transition animate-bounce"
                  onClick={scrollToTop}
                >
                  <ChevronUp size={20} />
                </button>
              )}
            </div>
            
            {/* Current Location Button */}
            <div className="p-4 border-t">
              <button 
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full flex items-center justify-center font-medium hover:from-blue-600 hover:to-cyan-600 transition shadow-md"
                onClick={() => {
                  if (map) {
                    getCurrentLocation(map);
                  }
                }}
              >
                <Compass size={18} className="mr-2" />
                Use Current Location
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Map and Toggle Button */}
      <div className="relative flex-1">
        <button 
          className="absolute top-4 left-4 z-10 bg-white p-2 rounded-full shadow-lg hover:bg-gray-100 transition"
          onClick={() => setShowSidebar(!showSidebar)}
        >
          {showSidebar ? <X size={20} /> : <List size={20} />}
        </button>
        
        <div ref={mapRef} className="w-full h-full" />
      </div>
      
      {/* Place Details Panel */}
      {selectedPlace && (
        <div className="absolute bottom-0 right-0 w-96 bg-white shadow-lg rounded-tl-2xl z-20 overflow-hidden">
          {/* Details Header */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-100">
            <div className="flex justify-between items-start">
              <h2 className="text-lg font-bold text-gray-900">{selectedPlace.name}</h2>
              <button 
                className="p-1 hover:bg-blue-200 rounded-full transition"
                onClick={() => setSelectedPlace(null)}
              >
                <X size={20} />
              </button>
            </div>
            
            {selectedPlace.rating && (
              <div className="flex items-center mt-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={16} 
                      className={i < Math.floor(selectedPlace.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} 
                    />
                  ))}
                </div>
                <span className="ml-2 text-sm text-gray-600">{selectedPlace.rating} ({selectedPlace.reviews?.length || 0} reviews)</span>
              </div>
            )}
          </div>
          
          {/* Details Content */}
          <div className="max-h-72 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#93c5fd #dbeafe' }}>
            <div className="p-4 space-y-3">
              <div className="flex items-start">
                <MapPin size={18} className="text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700">{selectedPlace.formatted_address}</p>
              </div>
              
              {selectedPlace.formatted_phone_number && (
                <div className="flex items-center">
                  <Phone size={18} className="text-blue-500 mr-2 flex-shrink-0" />
                  <p className="text-sm text-gray-700">{selectedPlace.formatted_phone_number}</p>
                </div>
              )}
              
              {selectedPlace.opening_hours && (
                <div className="flex items-start">
                  <Clock size={18} className="text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      {selectedPlace.opening_hours.isOpen ? (
                        <span className="text-green-600">Open now</span>
                      ) : (
                        <span className="text-red-600">Closed</span>
                      )}
                    </p>
                    {selectedPlace.opening_hours.weekday_text && (
                      <details className="mt-1">
                        <summary className="text-xs text-blue-600 cursor-pointer">Opening hours</summary>
                        <ul className="mt-1 pl-1 text-xs text-gray-600 space-y-0.5">
                          {selectedPlace.opening_hours.weekday_text.map((day, i) => (
                            <li key={i}>{day}</li>
                          ))}
                        </ul>
                      </details>
                    )}
                  </div>
                </div>
              )}
              
              {selectedPlace.website && (
                <div className="flex items-center">
                  <Globe size={18} className="text-blue-500 mr-2 flex-shrink-0" />
                  <a 
                    href={selectedPlace.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline truncate max-w-xs"
                  >
                    {selectedPlace.website}
                  </a>
                </div>
              )}
            </div>
            
            {/* Feedback and Reviews - Mid-bottom */}
            <div className="p-4 border-t border-gray-100">
              <button 
                className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-lg flex items-center justify-center hover:bg-gray-200 transition"
                onClick={() => setShowFeedback(!showFeedback)}
              >
                <MessageCircle size={16} className="mr-2 text-blue-500" />
                {showFeedback ? "Hide Reviews" : "Show Reviews"}
              </button>
              
              {showFeedback && selectedPlace.reviews && selectedPlace.reviews.length > 0 && (
                <div className="mt-4 space-y-3 max-h-48 overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin', scrollbarColor: '#93c5fd #dbeafe' }}>
                  {selectedPlace.reviews.slice(0, 3).map((review, index) => (
                    <div key={index} className="text-sm border-l-2 border-blue-200 pl-3 py-1">
                      <div className="flex items-center">
                        <span className="font-medium text-gray-800">{review.author_name}</span>
                        <div className="flex ml-2">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              size={12} 
                              className={i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} 
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-600 mt-1 text-xs">{review.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Action Buttons - Separate from feedback */}
          <div className="p-4 border-t bg-gray-50">
            <button 
              className="w-full py-3 mb-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full flex items-center justify-center shadow-md hover:from-blue-600 hover:to-cyan-600 transition"
              onClick={() => getDirections(selectedPlace)}
            >
              <Navigation size={16} className="mr-1" />
              Get Directions
            </button>
            {selectedPlace.formatted_phone_number && (
              <a 
                href={`tel:${selectedPlace.formatted_phone_number}`}
                className="w-full py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-full flex items-center justify-center shadow-md hover:from-green-600 hover:to-teal-600 transition"
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Phone size={16} className="mr-1" />
                Call Now
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default HospitalFinderApp;
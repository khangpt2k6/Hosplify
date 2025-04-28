const LoadingSpinner = () => {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
        <p className="ml-4 text-lg text-blue-600 font-medium">Loading products...</p>
      </div>
    );
  };
  
  export default LoadingSpinner;
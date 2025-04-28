const Pagination = ({ itemsPerPage, totalItems, paginate, currentPage }) => {
    const pageNumbers = [];
    
    for (let i = 1; i <= Math.ceil(totalItems / itemsPerPage); i++) {
      pageNumbers.push(i);
    }
    
    // Limit displayed pages
    const maxDisplayedPages = 5;
    let pagesToShow = [...pageNumbers];
    
    if (pageNumbers.length > maxDisplayedPages) {
      const halfDisplay = Math.floor(maxDisplayedPages / 2);
      let startPage = Math.max(currentPage - halfDisplay, 1);
      let endPage = startPage + maxDisplayedPages - 1;
      
      if (endPage > pageNumbers.length) {
        endPage = pageNumbers.length;
        startPage = Math.max(endPage - maxDisplayedPages + 1, 1);
      }
      
      pagesToShow = pageNumbers.slice(startPage - 1, endPage);
    }
  
    if (pageNumbers.length <= 1) {
      return null;
    }
  
    return (
      <nav className="mt-8 flex justify-center">
        <ul className="flex space-x-1">
          {/* Previous Button */}
          <li>
            <button
              onClick={() => currentPage > 1 && paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-2 rounded-md ${
                currentPage === 1
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              &laquo;
            </button>
          </li>
          
          {/* First Page */}
          {pagesToShow[0] > 1 && (
            <>
              <li>
                <button
                  onClick={() => paginate(1)}
                  className="px-3 py-2 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200"
                >
                  1
                </button>
              </li>
              {pagesToShow[0] > 2 && (
                <li className="px-3 py-2">...</li>
              )}
            </>
          )}
          
          {/* Page Numbers */}
          {pagesToShow.map(number => (
            <li key={number}>
              <button
                onClick={() => paginate(number)}
                className={`px-3 py-2 rounded-md ${
                  currentPage === number
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}
              >
                {number}
              </button>
            </li>
          ))}
          
          {/* Last Page */}
          {pagesToShow[pagesToShow.length - 1] < pageNumbers.length && (
            <>
              {pagesToShow[pagesToShow.length - 1] < pageNumbers.length - 1 && (
                <li className="px-3 py-2">...</li>
              )}
              <li>
                <button
                  onClick={() => paginate(pageNumbers.length)}
                  className="px-3 py-2 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200"
                >
                  {pageNumbers.length}
                </button>
              </li>
            </>
          )}
          
          {/* Next Button */}
          <li>
            <button
              onClick={() => currentPage < pageNumbers.length && paginate(currentPage + 1)}
              disabled={currentPage === pageNumbers.length}
              className={`px-3 py-2 rounded-md ${
                currentPage === pageNumbers.length
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              &raquo;
            </button>
          </li>
        </ul>
      </nav>
    );
  };
  
  export default Pagination;
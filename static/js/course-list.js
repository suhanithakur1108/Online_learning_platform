// ============================================
// STUDYHUB - Course List Page JavaScript
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const searchInput = document.getElementById('searchInput');
    const searchForm = document.getElementById('searchForm');
    const levelFilters = document.querySelectorAll('.level-filter');
    const priceFilters = document.querySelectorAll('input[name="price"]');
    const sortSelect = document.getElementById('sortSelect');
    const coursesContainer = document.getElementById('coursesContainer');
    const resetBtn = document.getElementById('resetFilters');
    
    // Only run if on course list page
    if (!coursesContainer) return;
    
    const courseItems = document.querySelectorAll('.course-item');
    
    // Function to filter courses
    function filterCourses() {
        // Get selected levels
        const selectedLevels = Array.from(levelFilters)
            .filter(cb => cb.checked)
            .map(cb => cb.value);
        
        // Get selected price
        const selectedPrice = document.querySelector('input[name="price"]:checked')?.value || 'all';
        
        let visibleCount = 0;
        
        // Filter courses
        courseItems.forEach(item => {
            let show = true;
            
            // Level filter
            if (selectedLevels.length > 0) {
                const courseLevel = item.dataset.level;
                if (!selectedLevels.includes(courseLevel)) {
                    show = false;
                }
            }
            
            // Price filter
            if (show && selectedPrice !== 'all') {
                const coursePrice = parseFloat(item.dataset.price);
                if (selectedPrice === 'free' && coursePrice !== 0) {
                    show = false;
                } else if (selectedPrice === 'paid' && coursePrice === 0) {
                    show = false;
                }
            }
            
            item.style.display = show ? 'block' : 'none';
            if (show) visibleCount++;
        });
        
        // Update results count
        const resultsText = document.querySelector('.results-count');
        if (resultsText) {
            resultsText.textContent = `Showing ${visibleCount} courses`;
        }
    }
    
    // Function to sort courses
    function sortCourses() {
        const sortValue = sortSelect?.value || 'newest';
        const courses = Array.from(courseItems);
        const container = document.querySelector('.courses-grid') || coursesContainer;
        
        courses.sort((a, b) => {
            const titleA = a.dataset.title || '';
            const titleB = b.dataset.title || '';
            const priceA = parseFloat(a.dataset.price) || 0;
            const priceB = parseFloat(b.dataset.price) || 0;
            
            switch(sortValue) {
                case 'price-low':
                    return priceA - priceB;
                case 'price-high':
                    return priceB - priceA;
                case 'newest':
                    return titleA.localeCompare(titleB);
                default:
                    return 0;
            }
        });
        
        // Reorder DOM elements
        courses.forEach(course => {
            container.appendChild(course);
        });
    }
    
    // Reset all filters
    function resetFilters() {
        // Reset level checkboxes
        levelFilters.forEach(cb => cb.checked = false);
        
        // Reset price to "all"
        const priceAll = document.getElementById('price-all');
        if (priceAll) priceAll.checked = true;
        
        // Reset sort
        if (sortSelect) sortSelect.value = 'newest';
        
        // Reset search
        if (searchInput) searchInput.value = '';
        
        // Show all courses
        courseItems.forEach(item => item.style.display = 'block');
        
        // Update results text
        const resultsText = document.querySelector('.results-count');
        if (resultsText && courseItems.length) {
            resultsText.textContent = `Showing ${courseItems.length} courses`;
        }
        
        // Sort courses
        sortCourses();
        
        // Reload page to clear URL parameters
        if (window.location.search) {
            window.location.href = window.location.pathname;
        }
    }
    
    // Event listeners
    if (levelFilters.length) {
        levelFilters.forEach(filter => filter.addEventListener('change', filterCourses));
    }
    
    if (priceFilters.length) {
        priceFilters.forEach(filter => filter.addEventListener('change', filterCourses));
    }
    
    if (sortSelect) {
        sortSelect.addEventListener('change', sortCourses);
    }
    
    if (resetBtn) {
        resetBtn.addEventListener('click', resetFilters);
    }
    
    // Debounced search
    if (searchInput && searchForm) {
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                if (this.value.length > 2 || this.value.length === 0) {
                    searchForm.submit();
                }
            }, 500);
        });
    }
    
    // Initial filter and sort
    filterCourses();
    sortCourses();
});
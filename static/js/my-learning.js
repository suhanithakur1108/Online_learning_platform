// ============================================
// STUDYHUB - My Learning Page JavaScript
// ============================================

class MyLearningManager {
    constructor() {
        this.init();
    }
    
    init() {
        this.cacheDOM();
        this.bindEvents();
        this.loadSavedFilters();
        this.animateCards();
    }
    
    cacheDOM() {
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.searchInput = document.getElementById('searchCourses');
        this.courseCards = document.querySelectorAll('.course-card');
        this.coursesGrid = document.getElementById('coursesGrid');
        this.resultsCount = document.getElementById('resultsCount');
    }
    
    bindEvents() {
        // Filter buttons
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleFilterClick(e));
        });
        
        // Search input with debounce
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => this.debounce(this.handleSearch, 300)(e));
        }
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
    }
    
    handleFilterClick(event) {
        const btn = event.currentTarget;
        const filter = btn.dataset.filter;
        
        // Update active state
        this.filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Save to localStorage
        localStorage.setItem('myLearningFilter', filter);
        
        // Apply filter
        this.applyFilters();
    }
    
    handleSearch(event) {
        const searchTerm = event.target.value.toLowerCase();
        localStorage.setItem('myLearningSearch', searchTerm);
        this.applyFilters();
    }
    
    applyFilters() {
        const activeFilter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
        const searchTerm = this.searchInput?.value.toLowerCase() || '';
        
        let visibleCount = 0;
        let inProgressCount = 0;
        let completedCount = 0;
        
        this.courseCards.forEach(card => {
            const status = card.dataset.status;
            const title = card.dataset.title?.toLowerCase() || '';
            const instructor = card.dataset.instructor?.toLowerCase() || '';
            
            let show = true;
            
            // Filter by status
            if (activeFilter !== 'all' && status !== activeFilter) {
                show = false;
            }
            
            // Filter by search
            if (show && searchTerm) {
                if (!title.includes(searchTerm) && !instructor.includes(searchTerm)) {
                    show = false;
                }
            }
            
            // Count courses
            if (show) {
                visibleCount++;
                if (status === 'in-progress') inProgressCount++;
                if (status === 'completed') completedCount++;
            }
            
            // Show/hide with animation
            if (show) {
                card.style.display = 'block';
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 10);
            } else {
                card.style.display = 'none';
            }
        });
        
        // Update results count
        this.updateResultsCount(visibleCount);
        
        // Update statistics
        this.updateStatistics(inProgressCount, completedCount);
        
        // Show/hide empty state
        this.toggleEmptyState(visibleCount);
    }
    
    updateResultsCount(count) {
        if (this.resultsCount) {
            this.resultsCount.textContent = `Showing ${count} course${count !== 1 ? 's' : ''}`;
        }
    }
    
    updateStatistics(inProgress, completed) {
        const inProgressStat = document.getElementById('inProgressCount');
        const completedStat = document.getElementById('completedCount');
        
        if (inProgressStat) inProgressStat.textContent = inProgress;
        if (completedStat) completedStat.textContent = completed;
    }
    
    toggleEmptyState(visibleCount) {
        let emptyState = document.querySelector('.empty-state');
        
        if (visibleCount === 0 && this.courseCards.length > 0) {
            if (!emptyState) {
                emptyState = this.createEmptyState();
                this.coursesGrid?.parentNode.appendChild(emptyState);
            }
            emptyState.style.display = 'block';
            if (this.coursesGrid) this.coursesGrid.style.display = 'none';
        } else if (visibleCount > 0) {
            if (emptyState) emptyState.style.display = 'none';
            if (this.coursesGrid) this.coursesGrid.style.display = 'grid';
        }
    }
    
    createEmptyState() {
        const div = document.createElement('div');
        div.className = 'empty-state';
        div.innerHTML = `
            <i class="fas fa-search"></i>
            <h3>No courses found</h3>
            <p>Try adjusting your search or filter criteria</p>
            <button class="btn-browse" id="clearFiltersBtn">
                <i class="fas fa-redo-alt"></i> Clear Filters
            </button>
        `;
        
        div.querySelector('#clearFiltersBtn')?.addEventListener('click', () => {
            this.clearAllFilters();
        });
        
        return div;
    }
    
    clearAllFilters() {
        // Reset filter buttons
        this.filterBtns.forEach(btn => {
            if (btn.dataset.filter === 'all') {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        // Clear search
        if (this.searchInput) {
            this.searchInput.value = '';
        }
        
        // Clear localStorage
        localStorage.removeItem('myLearningFilter');
        localStorage.removeItem('myLearningSearch');
        
        // Apply filters
        this.applyFilters();
        
        // Show toast
        this.showToast('All filters cleared!', 'info');
    }
    
    loadSavedFilters() {
        const savedFilter = localStorage.getItem('myLearningFilter');
        const savedSearch = localStorage.getItem('myLearningSearch');
        
        if (savedFilter) {
            const filterBtn = document.querySelector(`.filter-btn[data-filter="${savedFilter}"]`);
            if (filterBtn) {
                this.filterBtns.forEach(btn => btn.classList.remove('active'));
                filterBtn.classList.add('active');
            }
        }
        
        if (savedSearch && this.searchInput) {
            this.searchInput.value = savedSearch;
        }
        
        this.applyFilters();
    }
    
    animateCards() {
        this.courseCards.forEach((card, index) => {
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 50);
        });
    }
    
    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + F to focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            this.searchInput?.focus();
        }
        
        // Escape to clear search
        if (e.key === 'Escape' && this.searchInput) {
            this.searchInput.value = '';
            this.applyFilters();
        }
        
        // Numbers 1-3 for filters
        if (e.key >= '1' && e.key <= '3') {
            const filters = ['all', 'in-progress', 'completed'];
            const filter = filters[parseInt(e.key) - 1];
            const filterBtn = document.querySelector(`.filter-btn[data-filter="${filter}"]`);
            if (filterBtn) {
                filterBtn.click();
            }
        }
    }
    
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.innerHTML = `
            <div class="toast-content toast-${type}">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'danger' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.myLearning = new MyLearningManager();
});

// Add toast styles
const toastStyles = document.createElement('style');
toastStyles.textContent = `
    .toast-notification {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 9999;
        animation: slideInRight 0.3s ease-out;
    }
    
    .toast-content {
        padding: 12px 20px;
        border-radius: 10px;
        background: white;
        box-shadow: 0 5px 20px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .toast-success {
        background: #28a745;
        color: white;
    }
    
    .toast-danger {
        background: #dc3545;
        color: white;
    }
    
    .toast-info {
        background: #17a2b8;
        color: white;
    }
    
    [data-bs-theme="dark"] .toast-content {
        background: #2d2d3d;
        color: white;
    }
    
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(toastStyles);
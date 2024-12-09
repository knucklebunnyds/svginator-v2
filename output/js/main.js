// Main Application Entry Point
class App {
    constructor() {
        this.isScrollMode = false;
        this.thumbnailSize = 'small';
    }

    init() {
        this.initializeEventListeners();
        this.initializeState();
    }

    initializeState() {
        // Initialize gallery state
        const gallery = document.querySelector('.nft-gallery');
        if (gallery) {
            gallery.classList.add('small-grid');
        }

        // Initialize filter state
        const controls = document.querySelector('.collection-controls');
        if (controls) {
            controls.classList.remove('active');
        }

        // Initialize view state
        const viewLabel = document.querySelector('.view-label');
        if (viewLabel) {
            viewLabel.textContent = 'Paginated';
        }

        // Initialize size state
        const sizeLabel = document.querySelector('.size-label');
        if (sizeLabel) {
            sizeLabel.textContent = 'Small';
        }
    }

    initializeEventListeners() {
        // Project info button
        const infoBtn = document.querySelector('.info-btn');
        if (infoBtn) {
            infoBtn.removeEventListener('click', window.modalManager.showCollectionInfo);
            infoBtn.addEventListener('click', () => window.modalManager.showCollectionInfo());
        }

        // Filter toggle button
        const filterToggleBtn = document.querySelector('.filter-toggle');
        if (filterToggleBtn) {
            filterToggleBtn.removeEventListener('click', this.toggleFilters);
            filterToggleBtn.addEventListener('click', () => this.toggleFilters());
        }

        // View toggle button
        const viewToggleBtn = document.querySelector('.view-toggle');
        if (viewToggleBtn) {
            viewToggleBtn.removeEventListener('click', this.toggleView);
            viewToggleBtn.addEventListener('click', () => this.toggleView());
        }

        // Size toggle button
        const sizeToggleBtn = document.querySelector('.size-toggle');
        if (sizeToggleBtn) {
            sizeToggleBtn.removeEventListener('click', this.toggleThumbnailSize);
            sizeToggleBtn.addEventListener('click', () => this.toggleThumbnailSize());
        }

        // Clear filters button
        const clearFiltersBtn = document.querySelector('.clear-filters-btn');
        if (clearFiltersBtn) {
            clearFiltersBtn.removeEventListener('click', this.clearFilters);
            clearFiltersBtn.addEventListener('click', () => this.clearFilters());
        }
    }

    toggleView() {
        this.isScrollMode = !this.isScrollMode;
        const viewLabel = document.querySelector('.view-label');
        if (viewLabel) {
            viewLabel.textContent = this.isScrollMode ? 'Infinite Scroll' : 'Paginated';
        }
        
        const gallery = document.querySelector('.nft-gallery');
        const pagination = document.querySelector('.pagination');
        
        if (gallery && pagination) {
            if (this.isScrollMode) {
                pagination.style.display = 'none';
                gallery.classList.add('infinite-scroll');
            } else {
                pagination.style.display = 'flex';
                gallery.classList.remove('infinite-scroll');
            }
            
            window.galleryManager.displayNFTs();
        }
    }

    toggleThumbnailSize() {
        const gallery = document.querySelector('.nft-gallery');
        const sizeLabel = document.querySelector('.size-label');
        
        if (!gallery || !sizeLabel) return;

        gallery.classList.remove('small-grid', 'large-grid', 'full-grid');
        
        switch(this.thumbnailSize) {
            case 'small':
                this.thumbnailSize = 'large';
                gallery.classList.add('large-grid');
                sizeLabel.textContent = 'Large';
                break;
            case 'large':
                this.thumbnailSize = 'full';
                gallery.classList.add('full-grid');
                sizeLabel.textContent = 'Full';
                break;
            case 'full':
                this.thumbnailSize = 'small';
                gallery.classList.add('small-grid');
                sizeLabel.textContent = 'Small';
                break;
        }
    }

    toggleFilters() {
        const controls = document.querySelector('.collection-controls');
        if (controls) {
            controls.classList.toggle('active');
        }
    }

    clearFilters() {
        document.querySelectorAll('.filter-select').forEach(select => {
            select.value = '';
        });
        if (window.galleryManager && typeof window.galleryManager.applyFilters === 'function') {
            window.galleryManager.applyFilters();
        }
    }
}

// Create app instance
window.app = new App();

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize managers in correct order
    window.utils.initializeSmoothScroll();
    window.modalManager.init();
    window.themeManager.init();
    window.app.init();
    window.galleryManager.loadNFTs();
}); 
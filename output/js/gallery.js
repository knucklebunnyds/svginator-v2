// Gallery Management
class GalleryManager {
    constructor() {
        this.allNFTs = [];
        this.filteredNFTs = [];
        this.currentPage = 1;
        this.itemsPerPage = 12;
        this.currentNFT = null;
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        this.initializeEventListeners();
        this.loadNFTs();
    }

    initializeEventListeners() {
        // Remove existing listeners first
        this.removeEventListeners();

        // Sort dropdown
        this.sortSelect = document.getElementById('sort-select');
        if (this.sortSelect) {
            this.handleSort = this.handleSort.bind(this);
            this.sortSelect.addEventListener('change', this.handleSort);
        }

        // Pagination controls
        this.paginationControls = document.querySelectorAll('.pagination-control');
        this.paginationControls.forEach(control => {
            control.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                if (action === 'prev') this.prevPage();
                if (action === 'next') this.nextPage();
            });
        });

        // Modal navigation
        this.prevBtn = document.querySelector('.modal-nav .prev');
        this.nextBtn = document.querySelector('.modal-nav .next');
        if (this.prevBtn) this.prevBtn.addEventListener('click', () => this.showPrevNFT());
        if (this.nextBtn) this.nextBtn.addEventListener('click', () => this.showNextNFT());
    }

    removeEventListeners() {
        if (this.sortSelect) {
            this.sortSelect.removeEventListener('change', this.handleSort);
        }
    }

    createSVGObject(src, alt) {
        return `
            <object data="${src}" type="image/svg+xml" class="nft-svg">
                <img src="${src}" alt="${alt}" class="fallback">
            </object>
        `;
    }

    handleSVGLoad(object) {
        const svgDoc = object.contentDocument;
        if (svgDoc) {
            const svg = svgDoc.querySelector('svg');
            if (svg) {
                // Apply current theme
                const theme = document.documentElement.getAttribute('data-theme') || 'default';
                svg.setAttribute('data-theme', theme);
            }
        }
    }

    createNFTCardHTML(nft) {
        const card = document.createElement('div');
        card.className = 'nft-card';
        card.innerHTML = `
            <div class="nft-image"></div>
            <div class="nft-info">
                <h3>${nft.name}</h3>
                <p class="nft-id">#${nft.id}</p>
                ${nft.rank ? `<p class="nft-rank">Rank: #${nft.rank}</p>` : ''}
            </div>
        `;

        // Create and append SVG object
        const imageContainer = card.querySelector('.nft-image');
        const objectHTML = this.createSVGObject(nft.image, nft.name);
        imageContainer.innerHTML = objectHTML;

        // Add load event listener to SVG object
        const object = imageContainer.querySelector('object');
        if (object) {
            object.addEventListener('load', () => this.handleSVGLoad(object));
        }

        return card;
    }

    async loadNFTs() {
        console.log('Starting loadNFTs...');
        const gallery = document.querySelector('.nft-gallery');
        if (!gallery) {
            console.error('Gallery element not found');
            return;
        }

        try {
            gallery.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-primary);">
                    Loading NFTs...
                </div>
            `;

            // First, try to load the rarity report
            let rarityReport = {};
            try {
                const rarityResponse = await fetch('rarity_report.json');
                if (rarityResponse.ok) {
                    rarityReport = await rarityResponse.json();
                    console.log('Loaded rarity report:', rarityReport);
                }
            } catch (error) {
                console.warn('Failed to load rarity report:', error);
            }

            // Fetch NFT data
            const nftPromises = [];
            for (let i = 1; i <= 50; i++) { // Start with 50 NFTs for testing
                const id = i.toString().padStart(4, '0');
                nftPromises.push(this.fetchNFTData(id));
            }

            const results = await Promise.all(nftPromises);
            this.allNFTs = results.filter(nft => nft !== null && nft.id);
            console.log('Loaded NFTs:', this.allNFTs);
            
            // Update NFTs with rarity information
            if (Object.keys(rarityReport).length > 0) {
                this.allNFTs.forEach(nft => {
                    const rarityInfo = rarityReport[nft.id];
                    if (rarityInfo) {
                        nft.rank = rarityInfo.rank;
                        nft.rarityScore = rarityInfo.score;
                    }
                });
            }
            
            // Sort by ID
            this.allNFTs.sort((a, b) => parseInt(a.id) - parseInt(b.id));
            this.filteredNFTs = [...this.allNFTs];
            
            this.displayNFTs();
        } catch (error) {
            console.error('Error loading NFTs:', error);
            if (gallery) {
                gallery.innerHTML = `
                    <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-primary);">
                        Failed to load NFTs. Please try refreshing the page.<br>
                        Error: ${error.message}
                    </div>
                `;
            }
        }
    }

    async fetchNFTData(id) {
        try {
            console.log(`Fetching NFT ${id}...`);
            const response = await fetch(`metadata/${id}.json`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log(`NFT ${id} metadata:`, data);
            const nft = {
                id,
                ...data,
                image: `images/${data.image}`
            };
            console.log(`NFT ${id} processed:`, nft);
            return nft;
        } catch (error) {
            console.error(`Error fetching NFT ${id}:`, error);
            return null;
        }
    }

    handleSort() {
        const sortSelect = document.getElementById('sort-select');
        if (!sortSelect) return;

        const sortValue = sortSelect.value;
        
        switch(sortValue) {
            case 'id':
                // Sort by ID (ascending)
                this.filteredNFTs.sort((a, b) => parseInt(a.id) - parseInt(b.id));
                break;
            case 'idDesc':
                // Sort by ID (descending)
                this.filteredNFTs.sort((a, b) => parseInt(b.id) - parseInt(a.id));
                break;
            case 'rank':
                // Sort by rarity rank (ascending)
                this.filteredNFTs.sort((a, b) => (a.rank || 999999) - (b.rank || 999999));
                break;
            case 'rankDesc':
                // Sort by rarity rank (descending)
                this.filteredNFTs.sort((a, b) => (b.rank || 999999) - (a.rank || 999999));
                break;
        }
        
        this.currentPage = 1;
        this.displayNFTs();
    }

    displayNFTs() {
        console.log('Displaying NFTs:', this.filteredNFTs);
        const gallery = document.querySelector('.nft-gallery');
        if (!gallery) return;

        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const nftsToShow = this.filteredNFTs.slice(startIndex, endIndex);
        console.log('NFTs to show:', nftsToShow);
        
        gallery.innerHTML = '';
        
        if (nftsToShow.length === 0) {
            gallery.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
                    No NFTs found matching your criteria.
                </div>
            `;
            return;
        }
        
        nftsToShow.forEach(nft => {
            if (!nft || !nft.id) {
                console.error('Invalid NFT data:', nft);
                return;
            }

            const card = this.createNFTCardHTML(nft);
            gallery.appendChild(card);

            // Add click event listener to show modal
            card.addEventListener('click', () => {
                this.currentNFT = nft;
                window.modalManager.showNFTModal(nft);
            });
        });

        this.updatePaginationControls();
    }

    updatePaginationControls() {
        const totalPages = Math.ceil(this.filteredNFTs.length / this.itemsPerPage);
        const prevBtn = document.querySelector('[data-action="prev"]');
        const nextBtn = document.querySelector('[data-action="next"]');
        const pageInfo = document.querySelector('.page-info');
        
        if (prevBtn) prevBtn.disabled = this.currentPage === 1;
        if (nextBtn) nextBtn.disabled = this.currentPage === totalPages;
        if (pageInfo) pageInfo.textContent = `Page ${this.currentPage} of ${totalPages}`;
    }

    prevPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.displayNFTs();
        }
    }

    nextPage() {
        const totalPages = Math.ceil(this.filteredNFTs.length / this.itemsPerPage);
        if (this.currentPage < totalPages) {
            this.currentPage++;
            this.displayNFTs();
        }
    }

    showNextNFT() {
        const currentIndex = this.filteredNFTs.findIndex(nft => nft.id === this.currentNFT?.id);
        if (currentIndex < this.filteredNFTs.length - 1) {
            const nextNFT = this.filteredNFTs[currentIndex + 1];
            this.currentNFT = nextNFT;
            window.modalManager.showNFTModal(nextNFT);
        }
    }

    showPrevNFT() {
        const currentIndex = this.filteredNFTs.findIndex(nft => nft.id === this.currentNFT?.id);
        if (currentIndex > 0) {
            const prevNFT = this.filteredNFTs[currentIndex - 1];
            this.currentNFT = prevNFT;
            window.modalManager.showNFTModal(prevNFT);
        }
    }
}

// Initialize gallery manager
window.galleryManager = new GalleryManager(); 
// Modal Management
class ModalManager {
    constructor() {
        this.init();
    }

    init() {
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Close modal on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const modal = document.getElementById('gallery-modal');
                const expandedOverlay = document.getElementById('expanded-image-overlay');
                
                if (expandedOverlay?.style.display === 'flex') {
                    expandedOverlay.style.display = 'none';
                } else if (modal?.classList.contains('active')) {
                    this.closeModal();
                }
            }
        });

        // Close modal on click outside
        const modal = document.getElementById('gallery-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });
        }

        // Close button
        const closeBtn = document.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeModal());
        }
    }

    showNFTModal(nft) {
        const modal = document.getElementById('gallery-modal');
        if (!modal) return;

        // Format trait type to remove numeric prefix and duplicates
        const formattedTraits = nft.attributes
            .filter(attr => !attr.trait_type.includes('backgrounds/'))
            .map(attr => ({
                trait_type: attr.trait_type.replace(/^\d+_/, ''),
                value: attr.value,
                rarity: this.calculateTraitRarity(attr.trait_type, attr.value, window.galleryManager.allNFTs)
            }))
            .filter((trait, index, self) => 
                index === self.findIndex(t => t.trait_type === trait.trait_type)
            );

        // Update modal content
        const modalImage = modal.querySelector('.modal-image');
        const modalInfo = modal.querySelector('.modal-info');
        
        if (modalImage) {
            modalImage.innerHTML = window.galleryManager.createSVGObject(nft.image, nft.name);
            modalImage.addEventListener('click', () => this.expandImage(modalImage));
        }

        if (modalInfo) {
            modalInfo.innerHTML = `
                <h2>${nft.name}</h2>
                ${nft.rank ? `<div class="rank">Rank #${nft.rank}</div>` : ''}
                <div class="trait-list">
                    ${this.generateTraitsList(formattedTraits)}
                </div>
            `;
        }

        // Show modal
        modal.style.display = 'flex';
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    calculateTraitRarity(traitType, value, allNFTs) {
        if (!allNFTs || allNFTs.length === 0) return null;
        
        const total = allNFTs.length;
        const count = allNFTs.filter(nft => 
            nft.attributes.some(attr => 
                attr.trait_type === traitType && attr.value === value
            )
        ).length;
        
        return ((count / total) * 100).toFixed(1);
    }

    generateTraitsList(traits) {
        return traits.map(trait => `
            <div class="trait-item">
                <div class="trait-type">
                    ${trait.trait_type}
                    ${trait.rarity ? `<span class="trait-percentage">${trait.rarity}%</span>` : ''}
                </div>
                <div class="trait-value">${trait.value}</div>
            </div>
        `).join('');
    }

    expandImage(element) {
        const overlay = document.getElementById('expanded-image-overlay');
        if (!overlay) return;

        const object = element.querySelector('object');
        if (!object) return;

        overlay.querySelector('.expanded-image-container').innerHTML = window.galleryManager.createSVGObject(object.data, object.querySelector('img').alt);
        overlay.style.display = 'flex';

        // Close expanded view when clicking outside or on close button
        const closeBtn = overlay.querySelector('.expanded-image-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                overlay.style.display = 'none';
            });
        }

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.style.display = 'none';
            }
        });
    }

    closeModal() {
        const modal = document.getElementById('gallery-modal');
        const expandedOverlay = document.getElementById('expanded-image-overlay');
        
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        }
        
        if (expandedOverlay) {
            expandedOverlay.style.display = 'none';
        }
        
        document.body.style.overflow = '';
    }
}

// Initialize modal manager
window.modalManager = new ModalManager(); 
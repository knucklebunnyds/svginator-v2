// Collection Info Dialog Functions
// Define functions globally first
window.showCollectionInfo = function() {
    console.log('Showing collection info dialog...');
    const collectionDialog = document.getElementById('collection-info-dialog');
    if (collectionDialog) {
        collectionDialog.classList.add('is-active');
        document.body.style.overflow = 'hidden';
    } else {
        console.error('Collection dialog element not found');
    }
}

window.closeCollectionInfo = function() {
    console.log('Closing collection info dialog...');
    const collectionDialog = document.getElementById('collection-info-dialog');
    if (collectionDialog) {
        collectionDialog.classList.remove('is-active');
        document.body.style.overflow = '';
    } else {
        console.error('Collection dialog element not found');
    }
}

// Set up event listeners when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('Setting up collection info dialog event listeners...');
    
    const collectionDialog = document.getElementById('collection-info-dialog');
    const infoBtn = document.querySelector('.info-btn');
    const closeBtn = document.querySelector('.kbds-dialog__close');

    console.log('Elements found:', {
        collectionDialog: !!collectionDialog,
        infoBtn: !!infoBtn,
        closeBtn: !!closeBtn
    });

    if (collectionDialog && closeBtn) {
        // Close on close button click
        closeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            closeCollectionInfo();
        });

        // Close on overlay click
        collectionDialog.addEventListener('click', function(e) {
            if (e.target === collectionDialog) {
                closeCollectionInfo();
            }
        });

        // Close on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && collectionDialog.classList.contains('is-active')) {
                closeCollectionInfo();
            }
        });

        // Add click handler to info button if it exists
        if (infoBtn) {
            infoBtn.addEventListener('click', function(e) {
                e.preventDefault();
                showCollectionInfo();
            });
        }
    } else {
        console.error('Required elements not found:', {
            dialog: !!collectionDialog,
            closeBtn: !!closeBtn,
            infoBtn: !!infoBtn
        });
    }
}); 
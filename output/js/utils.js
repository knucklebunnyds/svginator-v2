// Utility Functions
class Utils {
    constructor() {
        this.initializeSmoothScroll();
    }

    initializeSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = anchor.getAttribute('href');
                if (targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    toggleDocs() {
        const content = document.querySelector('.svg-docs-content');
        const header = document.querySelector('.svg-docs-header');
        const chevron = header.querySelector('.chevron');
        const docsContent = document.getElementById('docsContent');
        
        if (!content.classList.contains('open')) {
            content.classList.add('open');
            chevron.style.transform = 'rotate(180deg)';
            
            // Get the content height after it's loaded
            const contentHeight = docsContent.scrollHeight;
            content.style.maxHeight = `${contentHeight + 80}px`; // Add padding
        } else {
            content.classList.remove('open');
            chevron.style.transform = 'rotate(0)';
            content.style.maxHeight = '0';
        }
    }

    loadDocumentation() {
        fetch('dev/svg-structure.md')
            .then(response => response.text())
            .then(text => {
                const docsContent = document.getElementById('docsContent');
                docsContent.innerHTML = marked.parse(text);
                // Set initial height after content is loaded
                if (document.querySelector('.svg-docs-content').classList.contains('open')) {
                    document.querySelector('.svg-docs-content').style.height = `${docsContent.scrollHeight}px`;
                }
            })
            .catch(error => {
                console.error('Error loading documentation:', error);
                document.getElementById('docsContent').innerHTML = 'Error loading documentation. Please try again later.';
            });
    }

    // Add marked.js for Markdown parsing if needed
    loadMarkedJS() {
        if (!window.marked) {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/marked/marked.min.js';
            document.head.appendChild(script);
        }
    }

    // Color swatch functionality
    initializeColorSwatches() {
        document.querySelectorAll('.color-swatch').forEach(swatch => {
            swatch.addEventListener('click', () => {
                const colorValue = swatch.querySelector('.color-value').textContent;
                navigator.clipboard.writeText(colorValue);
                
                const message = document.querySelector('.copied-message');
                message.classList.add('show');
                setTimeout(() => message.classList.remove('show'), 2000);
            });
        });
    }
}

// Export for use in other files
window.utils = new Utils(); 
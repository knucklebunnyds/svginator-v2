// SVG Theme System
document.addEventListener('DOMContentLoaded', () => {
    // Initialize theme select
    const themeSelect = document.querySelector('.theme-select');
    if (themeSelect) {
        // Load saved theme
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
            themeSelect.value = savedTheme;
        }

        // Handle theme changes
        themeSelect.addEventListener('change', (e) => {
            const theme = e.target.value;
            if (theme) {
                document.documentElement.setAttribute('data-theme', theme);
            } else {
                document.documentElement.removeAttribute('data-theme');
            }
            localStorage.setItem('theme', theme);
        });
    }
}); 
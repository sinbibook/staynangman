// Footer JavaScript
(function() {
    'use strict';

    // Footer functionality can be added here if needed
    // For example: dynamic year update, form submissions, etc.

    // Update copyright year dynamically
    function updateCopyrightYear() {
        const yearElements = document.querySelectorAll('.copyright');
        const currentYear = new Date().getFullYear();

        yearElements.forEach(element => {
            element.innerHTML = element.innerHTML.replace(/\d{4}/, currentYear);
        });
    }

    // Top Button functionality
    function initTopButton() {
        const topButton = document.getElementById('topButton');
        if (!topButton) return;

        let isScrolling = false;

        // Show/hide button based on scroll position
        function handleScroll() {
            if (!isScrolling) {
                window.requestAnimationFrame(() => {
                    if (window.pageYOffset > 300) {
                        topButton.classList.add('show');
                    } else {
                        topButton.classList.remove('show');
                    }
                    isScrolling = false;
                });
                isScrolling = true;
            }
        }

        // Smooth scroll to top
        topButton.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        // Add scroll event listener
        window.addEventListener('scroll', handleScroll);

        // Check initial scroll position
        handleScroll();
    }

    // Initialize footer
    const runInitializers = () => {
        updateCopyrightYear();
        initTopButton();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', runInitializers);
    } else {
        // DOM is already loaded
        runInitializers();
    }

})();
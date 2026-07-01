/**
 * Header and Footer Loader
 * Dynamically loads header and footer templates into pages
 */

(function() {
    'use strict';

    // Track if header and footer are both loaded
    let headerLoaded = false;
    let footerLoaded = false;

    // Initialize mapper after both header and footer are loaded
    async function tryInitializeMapper() {
        if (headerLoaded && footerLoaded && window.HeaderFooterMapper) {
            // 프리뷰 환경인지 확인 (iframe 내부)
            const isPreview = window.parent !== window;

            if (!isPreview) {
                // 일반 페이지: 기본 데이터로 매핑
                const mapper = new window.HeaderFooterMapper();
                await mapper.initialize();

                // 매핑 완료 후 헤더/사이드바 표시
                if (window.showHeaders) window.showHeaders();
            }
            // 프리뷰 환경: PreviewHandler가 처리하므로 여기서는 매핑하지 않음
        }
    }

    // Load CSS
    function loadCSS(href) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        document.head.appendChild(link);
    }

    // Load Header
    async function loadHeader() {
        try {
            // Load header CSS first and ensure it loads before continuing
            const headerCSS = document.createElement('link');
            headerCSS.rel = 'stylesheet';
            headerCSS.href = 'styles/header.css';
            document.head.appendChild(headerCSS);

            const response = await fetch('common/header.html', { cache: 'no-cache' });
            const html = await response.text();

            // Create a temporary container
            const temp = document.createElement('div');
            temp.innerHTML = html;

            // Find header opened and top header directly from temp
            const headerOpened = temp.querySelector('.header-opened');
            const headerOpenedOverlay = temp.querySelector('.header-opened-overlay');
            const topHeader = temp.querySelector('.top-header');
            const mobileFixedButtons = temp.querySelector('.mobile-fixed-buttons');

            // Insert top header directly to body
            if (topHeader) {
                document.body.insertBefore(topHeader, document.body.firstChild);
            }

            // Insert header-opened right after top-header
            if (headerOpened) {
                document.body.insertBefore(headerOpened, topHeader.nextSibling);
            }

            // Insert overlay
            if (headerOpenedOverlay) {
                document.body.appendChild(headerOpenedOverlay);
            }

            // Insert mobile buttons
            if (mobileFixedButtons) {
                document.body.appendChild(mobileFixedButtons);
            }

            // Load header JavaScript
            const script = document.createElement('script');
            script.src = 'js/common/header.js';
            script.onload = async function() {
                // Remove any inline onclick handlers and set up proper event listener
                setTimeout(() => {
                    const hamburgerButton = document.getElementById('hamburger-button');
                    if (hamburgerButton) {
                        // Remove inline onclick if it exists
                        hamburgerButton.removeAttribute('onclick');

                        // Remove any existing listeners by cloning
                        const newButton = hamburgerButton.cloneNode(true);
                        hamburgerButton.parentNode.replaceChild(newButton, hamburgerButton);

                        // Add clean event listener
                        newButton.addEventListener('click', function(e) {
                            e.preventDefault();
                            e.stopPropagation();
                            if (window.toggleHeaderMenu) {
                                window.toggleHeaderMenu();
                            }
                        });
                    }
                }, 100);

                // Mark header as loaded after script is fully loaded
                headerLoaded = true;
                await tryInitializeMapper();
            };
            document.body.appendChild(script);

            // Immediately check scroll position after header is loaded
            setTimeout(() => {
                if (window.scrollY > 50 || window.pageYOffset > 50) {
                    const header = document.querySelector('.top-header');
                    if (header) {
                        header.classList.add('scrolled');
                    }
                }
            }, 100);
        } catch (error) {
            console.error('Error loading header:', error);
        }
    }

    // Load Footer
    async function loadFooter() {
        try {
            const response = await fetch('common/footer.html', { cache: 'no-cache' });
            if (response.ok) {
                // Load footer CSS
                loadCSS('styles/footer.css');

                const html = await response.text();

                // Create a temporary container
                const temp = document.createElement('div');
                temp.innerHTML = html;

                // Append footer at the end of body
                const footer = temp.querySelector('.footer');
                if (footer) {
                    document.body.appendChild(footer);
                }

                // Also append top button if exists
                const topButton = temp.querySelector('#topButton');
                if (topButton) {
                    document.body.appendChild(topButton);
                }

                // Load footer JavaScript if exists
                const script = document.createElement('script');
                script.src = 'js/common/footer.js';
                document.body.appendChild(script);

                // Mark footer as loaded and try to initialize mapper
                footerLoaded = true;
                await tryInitializeMapper();
            }
        } catch (error) {
            console.error('Error loading footer:', error);
        }
    }

    // Initialize
    document.addEventListener('DOMContentLoaded', function() {
        loadHeader();
        loadFooter();
    });

})();

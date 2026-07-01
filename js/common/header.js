// Header JavaScript
(function() {
    'use strict';

    // Update submenu position based on header height
    function updateSubmenuPosition() {
        const header = document.querySelector('.top-header');
        const headerOpened = document.querySelector('.header-opened');

        if (header && headerOpened) {
            const headerHeight = header.offsetHeight;
            const scrollY = window.scrollY;

            // 스크롤 상태와 관계없이 항상 80px
            headerOpened.style.top = '80px';
        }
    }

    // Scroll Effect for Header
    window.addEventListener('scroll', function() {
        const header = document.querySelector('.top-header');
        const hamburgerBtn = document.querySelector('.hamburger-button');

        if (header) {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }

        // Reservation Button scroll effect
        const reservationBtn = document.querySelector('.reservation-btn');
        if (reservationBtn) {
            if (window.scrollY > 50) {
                reservationBtn.classList.add('scrolled');
            } else {
                reservationBtn.classList.remove('scrolled');
            }
        }

        // Hamburger Button scroll effect
        if (hamburgerBtn) {
            if (window.scrollY > 50) {
                hamburgerBtn.classList.add('scrolled');
            } else {
                hamburgerBtn.classList.remove('scrolled');
            }
        }

        // Update submenu position after header state change
        updateSubmenuPosition();
    });

    // Toggle Mobile Menu
    window.toggleMobileMenu = function() {
        const mobileMenu = document.getElementById('mobile-menu');
        const menuIcon = document.getElementById('menu-icon');
        const closeIcon = document.getElementById('close-icon');
        const body = document.body;
        const html = document.documentElement;

        if (mobileMenu.classList.contains('active')) {
            mobileMenu.classList.remove('active');
            menuIcon.style.display = 'block';
            closeIcon.style.display = 'none';

            // 현재 스크롤 위치 저장
            const scrollY = body.style.top ? -parseInt(body.style.top) : 0;

            // 모든 스타일 완전히 리셋
            body.classList.remove('mobile-menu-open');
            body.style.overflow = '';
            body.style.position = '';
            body.style.width = '';
            body.style.height = '';
            body.style.top = '';
            body.style.left = '';

            html.style.overflow = '';

            // 원래 스크롤 위치로 복원
            if (scrollY > 0) {
                window.scrollTo(0, scrollY);
            }
        } else {
            // 현재 스크롤 위치 저장
            const scrollY = window.pageYOffset;

            mobileMenu.classList.add('active');
            menuIcon.style.display = 'none';
            closeIcon.style.display = 'block';

            // body 고정하되 현재 스크롤 위치 유지
            body.classList.add('mobile-menu-open');
            body.style.overflow = 'hidden';
            body.style.position = 'fixed';
            body.style.width = '100%';
            body.style.height = '100%';
            body.style.top = `-${scrollY}px`;
            body.style.left = '0';

            html.style.overflow = 'hidden';
        }
    };

    // Navigation function
    window.navigateTo = function(page, id) {
        // Close mobile menu if open
        const mobileMenu = document.getElementById('mobile-menu');
        if (mobileMenu && mobileMenu.classList.contains('active')) {
            toggleMobileMenu();
        }

        // Navigate to page
        let url = '';
        switch(page) {
            case 'home':
                url = 'index.html';
                break;
            case 'main':
                url = 'main.html';
                break;
            case 'directions':
                url = 'directions.html';
                break;
            case 'reservation-info':
                url = 'reservation.html';
                break;
            default:
                url = page + '.html';
        }

        // id 파라미터가 있으면 쿼리스트링으로 추가
        if (url && id) {
            url += '?id=' + encodeURIComponent(id);
        }

        if (url) {
            window.location.href = url;
        }
    };

    // Submenu hover effect
    function initSubmenuHover() {
        const menuItems = document.querySelectorAll('.menu-item-wrapper');

        menuItems.forEach(item => {
            let hoverTimeout;

            item.addEventListener('mouseenter', function() {
                clearTimeout(hoverTimeout);
            });

            item.addEventListener('mouseleave', function() {
                hoverTimeout = setTimeout(() => {
                    // Optional: Add any cleanup code here
                }, 100);
            });
        });
    }

    // Check if logo image exists and hide text
    function checkLogoImage() {
        const logoImage = document.querySelector('.logo-image');
        const logoText = document.querySelector('.logo-text');

        if (logoImage && logoText) {
            // Check if logo image src exists and is not empty
            if (logoImage.src && !logoImage.src.includes('undefined') && !logoImage.src.endsWith('/')) {
                logoText.style.display = 'none';
            }
        }
    }


    // Check and set header state based on scroll position
    function checkInitialScroll() {
        const header = document.querySelector('.top-header');

        if (header) {
            if (window.scrollY > 50 || window.pageYOffset > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
    }

    // Header Menu Toggle - toggleMenu와 toggleHeaderMenu 둘 다 지원
    window.toggleMenu = function() {
        window.toggleHeaderMenu();
    };

    window.toggleHeaderMenu = function() {
        const headerOpened = document.getElementById('header-opened');
        const hamburgerButton = document.getElementById('hamburger-button');
        const overlay = document.getElementById('header-opened-overlay');
        const topHeader = document.querySelector('.top-header');
        const body = document.body;
        const html = document.documentElement;

        if (headerOpened && hamburgerButton) {
            const isExpanded = headerOpened.classList.contains('expanded');

            if (isExpanded) {
                // 닫기
                headerOpened.classList.remove('expanded');
                hamburgerButton.classList.remove('active');
                if (overlay) overlay.classList.remove('active');
                if (topHeader) topHeader.classList.remove('menu-open');

                // 스크롤 복원
                const scrollY = body.style.top ? -parseInt(body.style.top, 10) : 0;

                body.classList.remove('menu-open-body');
                html.classList.remove('menu-open');

                // 스크롤 관련 스타일 제거 (top만 제거, 나머지는 CSS 클래스로 처리)
                body.style.top = '';

                // 원래 스크롤 위치로 복원
                if (scrollY > 0) {
                    window.scrollTo(0, scrollY);
                }

                // Remove global event listeners when menu closes
                if (window.menuClickHandler) {
                    window.removeEventListener('click', window.menuClickHandler, true);
                    window.menuClickHandler = null;
                }
                if (window.menuKeyHandler) {
                    window.removeEventListener('keydown', window.menuKeyHandler, true);
                    window.menuKeyHandler = null;
                }
            } else {
                // 열기 - 현재 스크롤 위치 저장하고 body 고정
                const scrollY = window.pageYOffset || document.documentElement.scrollTop;

                body.classList.add('menu-open-body');
                html.classList.add('menu-open');

                // 스크롤 방지를 위해 body 고정 (top만 설정, 나머지는 CSS 클래스로 처리)
                body.style.top = `-${scrollY}px`;

                // 메뉴 위치를 현재 헤더 하단으로 설정
                // 스크롤 상태와 관계없이 항상 80px
                headerOpened.style.top = '80px';

                headerOpened.classList.add('expanded');
                hamburgerButton.classList.add('active');
                if (overlay) overlay.classList.add('active');
                if (topHeader) topHeader.classList.add('menu-open');

                // Add global event listeners when menu opens
                setTimeout(() => {
                    window.menuClickHandler = function(e) {
                        const headerOpened = document.getElementById('header-opened');
                        const hamburgerButton = document.getElementById('hamburger-button');
                        const topHeader = document.querySelector('.top-header');

                        if (headerOpened && headerOpened.classList.contains('expanded')) {
                            const isOutsideMenu = !headerOpened.contains(e.target);
                            const isNotHeader = !topHeader.contains(e.target);

                            if (isOutsideMenu && isNotHeader) {
                                console.log('Outside click detected, closing menu');
                                e.preventDefault();
                                e.stopPropagation();
                                toggleHeaderMenu();
                            }
                        }
                    };

                    window.menuKeyHandler = function(e) {
                        if (e.key === 'Escape' || e.keyCode === 27) {
                            const headerOpened = document.getElementById('header-opened');
                            if (headerOpened && headerOpened.classList.contains('expanded')) {
                                console.log('ESC key pressed, closing menu');
                                e.preventDefault();
                                e.stopPropagation();
                                toggleHeaderMenu();
                            }
                        }
                    };

                    window.addEventListener('click', window.menuClickHandler, true);
                    window.addEventListener('keydown', window.menuKeyHandler, true);
                }, 100);
            }
        }
    };

    // Change Side Image when menu section is hovered
    function initMenuHoverEffects() {
        const menuSections = document.querySelectorAll('.menu-section');

        menuSections.forEach(section => {
            const title = section.querySelector('.menu-section-title').textContent.toLowerCase();

            section.addEventListener('mouseenter', function() {
                changeSideImage(title);
            });
        });
    }

    // Change Side Image
    function changeSideImage(menuText) {
        const imageBanner = document.getElementById('side-image-banner');
        if (!imageBanner) return;

        let imageUrl = '';

        switch(menuText.toLowerCase()) {
            case 'about':
                imageUrl = './images/room.jpg';
                break;
            case 'spaces':
                imageUrl = './images/pool.jpg';
                break;
            case 'specials':
                imageUrl = './images/exterior.jpg';
                break;
            case 'reservation':
                imageUrl = './images/bbq.jpg';
                break;
            default:
                imageUrl = './images/room.jpg';
        }

        imageBanner.style.backgroundImage = `url('${imageUrl}')`;
    }

    // Initialize header on page load
    document.addEventListener('DOMContentLoaded', function() {

        // Check initial scroll position
        checkInitialScroll();

        // Initialize submenu hover
        initSubmenuHover();

        // Check logo image
        checkLogoImage();

        // Update submenu position initially
        updateSubmenuPosition();

        // Update submenu position on window resize
        window.addEventListener('resize', updateSubmenuPosition);

        // Wait a bit for DOM to be fully ready, then initialize hamburger button
        setTimeout(function() {
            const hamburgerButton = document.getElementById('hamburger-button');

            if (hamburgerButton) {
                // Remove any existing event listeners
                hamburgerButton.replaceWith(hamburgerButton.cloneNode(true));
                const newHamburgerButton = document.getElementById('hamburger-button');

                // Add both click and touch events for mobile compatibility
                newHamburgerButton.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleHeaderMenu();
                });

                newHamburgerButton.addEventListener('touchstart', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleHeaderMenu();
                }, { passive: false });
            }

            // Initialize circular reservation button
            const circularReservationBtn = document.querySelector('.circular-reservation-btn');
            if (circularReservationBtn) {
                circularReservationBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    navigateTo('reservation');
                });
            }
        }, 100);

        // Initialize overlay click event
        const overlay = document.getElementById('header-opened-overlay');
        if (overlay) {
            overlay.addEventListener('click', function(e) {
                e.preventDefault();
                toggleHeaderMenu();
            });

            overlay.addEventListener('touchstart', function(e) {
                e.preventDefault();
                toggleHeaderMenu();
            }, { passive: false });
        }


        // Initialize menu hover effects
        setTimeout(initMenuHoverEffects, 500);

        // Check for multi-column layout
        // initMultiColumnLayout(); // 주석 처리 - 단일 항목으로 변경

        // For mobile - use side header instead of mobile menu
        const mobileToggle = document.querySelector('.mobile-toggle');
        if (mobileToggle && window.innerWidth <= 768) {
            mobileToggle.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                toggleHeaderMenu();
            });
        }
    });

    // Menu Accordion Toggle for Side Header
    window.toggleMenuAccordion = function(header) {
        const content = header.nextElementSibling;

        // Toggle current accordion
        header.classList.toggle('active');
        content.classList.toggle('active');
    };

    // Mobile Accordion Toggle
    window.toggleMobileAccordion = function(header) {
        // 모바일에서는 아코디언 기능 비활성화
        if (window.innerWidth <= 768) {
            return; // 아무것도 하지 않음
        }

        // 데스크톱에서만 작동
        const content = header.nextElementSibling;

        // Toggle current accordion
        header.classList.toggle('active');
        content.classList.toggle('active');
    };

    // Also check when window loads (for refresh scenarios)
    window.addEventListener('load', function() {
        checkInitialScroll();
    });


    // Immediate check for page refresh scenarios
    checkInitialScroll();

})();

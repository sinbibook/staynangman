// Directions page JavaScript
(function() {
    'use strict';

    // 수동 스크롤 애니메이션 함수
    function setupManualScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // common.css의 애니메이션 클래스 사용
                    if (entry.target.classList.contains('hero-content')) {
                        entry.target.classList.add('animate-fade-in');
                    } else if (entry.target.classList.contains('logo-line-container')) {
                        entry.target.classList.add('animate-slide-up');
                    } else if (entry.target.classList.contains('map-section')) {
                        entry.target.classList.add('animate-fade-in');
                    } else if (entry.target.classList.contains('location-details')) {
                        entry.target.classList.add('animate-slide-left');
                    } else if (entry.target.classList.contains('location-note-section')) {
                        entry.target.classList.add('animate-slide-up');
                    } else {
                        entry.target.classList.add('animate-fade-in');
                    }

                    // .visible 클래스도 추가 (full-banner 등을 위해)
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);

        // 모든 애니메이션 요소 관찰
        const animateElements = document.querySelectorAll('.animate-element, .animate-hero, .hero-content, .logo-line-container');

        animateElements.forEach(element => {
            observer.observe(element);
        });

        return observer;
    }

    // DOM ready event
    document.addEventListener('DOMContentLoaded', function() {

        // DirectionsMapper가 데이터를 로드한 후에 애니메이션 초기화
        setTimeout(function() {

            // Full-banner fade 애니메이션
            const fullBannerObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            }, { threshold: 0.1 });

            const fullBanner = document.querySelector('.full-banner');
            if (fullBanner) {
                fullBannerObserver.observe(fullBanner);
            } else {
            }

            // 수동으로 스크롤 애니메이션 설정
            setupManualScrollAnimations();

            // Handle typing animation
            const typingText = document.querySelector('.typing-text');
            if (typingText) {
                setTimeout(() => {
                    typingText.classList.add('typed');
                }, 2700);
            }

            // Location note section 애니메이션
            const locationNoteObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            }, { threshold: 0.1 });

            const locationNote = document.querySelector('.location-note-section');
            if (locationNote) {
                locationNoteObserver.observe(locationNote);
            }

        }, 1000); // 더 긴 지연으로 DirectionsMapper가 완전히 로드될 때까지 기다림
    });

    // Global function for reinitializing scroll animations (called by DirectionsMapper)
    window.setupScrollAnimations = function() {
        setupManualScrollAnimations();
    };

    // Global function for initializing location notes (called by DirectionsMapper)
    window.initializeLocationNotes = function() {
    };
})();
/**
 * Layout Map Page JavaScript
 */

(function() {
    'use strict';

    /**
     * 페이지 초기화
     */
    function initPage() {
        initScrollAnimations();

        // mapPage() 완료 후 초기화를 위해 전역 함수 노출
        // (preview-handler에서 mapPage() 후 호출)
        window._initLayoutMap = () => {
            // 추가 초기화 필요시 여기에 작성
        };
    }

    /**
     * 스크롤 애니메이션 초기화
     */
    function initScrollAnimations() {
        const layoutMapItems = document.querySelectorAll('.layout-map-item');
        const animateElements = document.querySelectorAll('.animate-element');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        });

        layoutMapItems.forEach(item => {
            observer.observe(item);
        });

        animateElements.forEach(element => {
            observer.observe(element);
        });
    }

    // 페이지 로드 시 초기화
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPage);
    } else {
        initPage();
    }
})();

// Room 페이지 JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // 썸네일 상호작용 설정
    setupRoomThumbnailInteraction();

    // Hero 슬라이더는 room-mapper.js에서 처리

    // 스크롤 애니메이션 초기화 (데이터 로드 후 실행)
    setTimeout(() => {
        initRoomScrollAnimations();
        initParallaxEffect();
        setupSectionToggles();
    }, 500);
});

/**
 * 객실 썸네일 상호작용 설정
 */
function setupRoomThumbnailInteraction() {
    const thumbnails = document.querySelectorAll('.room-thumb');
    const mainImg = document.getElementById('room-main-img');

    if (!mainImg || thumbnails.length === 0) return;

    thumbnails.forEach((thumb, index) => {
        thumb.addEventListener('click', function() {
            // 모든 썸네일의 active 클래스 제거
            thumbnails.forEach(t => t.classList.remove('active'));

            // 현재 썸네일에 active 클래스 추가
            this.classList.add('active');

            // 메인 이미지 업데이트
            const thumbImg = this.querySelector('img');
            if (thumbImg && thumbImg.src) {
                mainImg.src = thumbImg.src;
                mainImg.alt = thumbImg.alt;
            }
        });
    });
}

/**
 * Room 페이지 스크롤 애니메이션 초기화
 */
function initRoomScrollAnimations() {

    // Intersection Observer 설정
    const observerOptions = {
        threshold: 0.05, // 5%만 보여도 트리거 (모바일 친화적)
        rootMargin: '0px 0px 50px 0px' // 뷰포트 아래쪽에서 미리 트리거
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // 요소가 뷰포트에 들어왔을 때
                entry.target.classList.add('visible');

                // 한 번 나타난 후에는 다시 관찰하지 않음
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // animate-on-scroll 클래스를 가진 모든 요소 관찰
    const animateElements = document.querySelectorAll('.animate-on-scroll');

    animateElements.forEach((element, index) => {
        // 순차적 애니메이션을 위한 딜레이 설정
        element.style.transitionDelay = `${index * 100}ms`;
        observer.observe(element);
    });

    // 특정 요소에 추가 효과 부여 (데스크탑에서만)
    if (window.innerWidth > 768) {
        const slideLeftElements = document.querySelectorAll('.room-detail-item:nth-child(odd)');
        slideLeftElements.forEach(el => {
            if (!el.classList.contains('animate-on-scroll')) {
                el.classList.add('animate-on-scroll');
            }
            el.classList.add('slide-right');
            observer.observe(el);
        });

        const slideRightElements = document.querySelectorAll('.room-detail-item:nth-child(even)');
        slideRightElements.forEach(el => {
            if (!el.classList.contains('animate-on-scroll')) {
                el.classList.add('animate-on-scroll');
            }
            el.classList.add('slide-left');
            observer.observe(el);
        });
    } else {
        // 모바일에서는 페이드 인 효과만
        const detailItems = document.querySelectorAll('.room-detail-item');
        detailItems.forEach(el => {
            if (!el.classList.contains('animate-on-scroll')) {
                el.classList.add('animate-on-scroll');
            }
            observer.observe(el);
        });
    }

    // 갤러리 아이템 애니메이션 - 새로운 방식
    const galleryItems = document.querySelectorAll('.gallery-item.animate-on-scroll');
    galleryItems.forEach((item) => {
        // data-delay 속성 사용
        const delay = item.getAttribute('data-delay');
        if (delay) {
            item.style.transitionDelay = `${delay / 1000}s`;
        }
        observer.observe(item);
    });

    // 갤러리 제목 애니메이션 (메인 타이틀 - delay 적용)
    const galleryTitle = document.querySelector('.gallery-grid-title.animate-fade-up');
    if (galleryTitle) {
        const delay = galleryTitle.getAttribute('data-delay');
        if (delay) {
            galleryTitle.style.transitionDelay = `${delay / 1000}s`;
        }
        observer.observe(galleryTitle);
    }

}

/**
 * Parallax 효과 초기화
 */
function initParallaxEffect() {
    const banner = document.querySelector('.full-banner');
    if (!banner) return;

    // CSS fixed가 작동하는지 체크
    const testDiv = document.createElement('div');
    testDiv.style.backgroundAttachment = 'fixed';
    const supportsFixed = testDiv.style.backgroundAttachment === 'fixed';

    // 모바일이거나 fixed를 지원하지 않으면 JavaScript parallax 사용
    if (window.innerWidth <= 1024 || !supportsFixed) {
        let ticking = false;

        function updateParallax() {
            const scrolled = window.pageYOffset;
            const bannerTop = banner.offsetTop;
            const bannerHeight = banner.offsetHeight;

            // 배너가 뷰포트에 있을 때만 업데이트
            if (scrolled + window.innerHeight > bannerTop && scrolled < bannerTop + bannerHeight) {
                const speed = 0.5;
                const yPos = -(scrolled - bannerTop) * speed;
                banner.style.transform = `translateY(${yPos}px)`;
            }

            ticking = false;
        }

        function requestTick() {
            if (!ticking) {
                window.requestAnimationFrame(updateParallax);
                ticking = true;
            }
        }

        window.addEventListener('scroll', requestTick);
    }
}

/**
 * Section toggle functionality
 */
function setupSectionToggles() {
    const toggleButtons = document.querySelectorAll('.section-toggle-btn');

    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.getAttribute('data-toggle');
            const content = document.querySelector(`[data-content="${targetId}"]`);
            const minusIcon = this.querySelector('.toggle-minus');
            const plusIcon = this.querySelector('.toggle-plus');

            if (content) {
                content.classList.toggle('collapsed');

                // Toggle icons
                if (content.classList.contains('collapsed')) {
                    minusIcon.style.display = 'none';
                    plusIcon.style.display = 'block';
                } else {
                    minusIcon.style.display = 'block';
                    plusIcon.style.display = 'none';
                }
            }
        });
    });
}

// 전역 함수로 내보내기 (room-mapper.js에서 사용)
window.setupRoomThumbnailInteraction = setupRoomThumbnailInteraction;
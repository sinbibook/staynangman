// Facility Page JavaScript
(function() {
    'use strict';


    // Export initHeroSlider to global scope for mapper
    window.initHeroSlider = initHeroSlider;

    // Initialize hero slider when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        // Wait for mapper to complete before initializing slider
        setTimeout(() => {
            initHeroSlider();
        }, 100);

        // Setup wipe animation for special section
        setTimeout(setupWipeAnimation, 500);
    });

    function initHeroSlider() {
        const slider = document.querySelector('[data-facility-hero-slider]');
        if (!slider) {
            return;
        }

        // 이미 초기화되었는지 확인 (중복 방지)
        if (slider.dataset.sliderInitialized === 'true') {
            return;
        }

        const slides = slider.querySelectorAll('.slide');
        const prevBtn = document.querySelector('.slider-btn.prev');
        const nextBtn = document.querySelector('.slider-btn.next');
        const progressBar = document.querySelector('.progress-bar');


        if (!slides.length) {
            return;
        }

        let currentSlide = 0;

        function showSlide(index) {
            // Hide all slides
            slides.forEach((slide, i) => {
                slide.classList.toggle('active', i === index);
            });
        }

        function nextSlide() {
            currentSlide = (currentSlide + 1) % slides.length;
            showSlide(currentSlide);
            resetProgress();
        }

        function prevSlide() {
            currentSlide = (currentSlide - 1 + slides.length) % slides.length;
            showSlide(currentSlide);
            resetProgress();
        }

        // 시간 기반 애니메이션 변수
        let animationStartTime = null;
        let animationFrameId = null;
        const SLIDE_DURATION = 3000; // 3초

        // requestAnimationFrame 기반 프로그레스바 애니메이션
        function animateProgress(timestamp) {
            if (!animationStartTime) animationStartTime = timestamp;

            const elapsed = timestamp - animationStartTime;
            const progress = Math.min((elapsed / SLIDE_DURATION) * 100, 100);

            if (progressBar) {
                progressBar.style.width = progress + '%';
            }

            if (progress >= 100) {
                // 슬라이드 전환
                nextSlide();
                animationStartTime = timestamp;
            }

            animationFrameId = requestAnimationFrame(animateProgress);
        }

        function startAutoSlide() {
            if (animationFrameId) return; // 이미 실행 중이면 무시

            animationStartTime = null;
            if (progressBar) progressBar.style.width = '0%';
            animationFrameId = requestAnimationFrame(animateProgress);
        }

        function stopAutoSlide() {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }
        }

        function resetProgress() {
            stopAutoSlide();
            if (progressBar) progressBar.style.width = '0%';
            startAutoSlide();
        }

        // Set up event listeners
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                stopAutoSlide();
                prevSlide();
                startAutoSlide();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                stopAutoSlide();
                nextSlide();
                startAutoSlide();
            });
        }

        // 호버해도 프로그레스바 계속 진행 (호버 일시정지 기능 제거)

        // Touch swipe support for mobile
        let touchStartX = 0;
        let touchEndX = 0;
        let isSwiping = false;
        let touchStartY = 0;
        let touchEndY = 0;

        // 이벤트 위임을 사용하여 동적으로 추가된 슬라이드도 처리
        slider.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            touchEndX = touchStartX; // 초기화
            touchEndY = touchStartY; // 초기화
            isSwiping = true;
            stopAutoSlide();

            // 모바일 디버깅용
            e.preventDefault(); // 기본 스크롤 방지
        }, { passive: false });

        slider.addEventListener('touchmove', (e) => {
            if (!isSwiping) return;

            touchEndX = e.touches[0].clientX;
            touchEndY = e.touches[0].clientY;

            // 수평 스와이프인 경우만 기본 동작 방지
            const diffX = Math.abs(touchStartX - touchEndX);
            const diffY = Math.abs(touchStartY - touchEndY);

            if (diffX > diffY) {
                e.preventDefault(); // 수평 스와이프시 스크롤 방지
            }
        }, { passive: false });

        const handleTouchEnd = (e) => {
            if (!isSwiping) return;
            isSwiping = false;

            const swipeDistanceX = touchStartX - touchEndX;
            const swipeDistanceY = touchStartY - touchEndY;
            const threshold = 30; // 더 낮은 threshold로 민감도 증가

            // 수평 스와이프가 수직보다 큰 경우만 처리
            if (Math.abs(swipeDistanceX) > Math.abs(swipeDistanceY) &&
                Math.abs(swipeDistanceX) > threshold) {
                if (swipeDistanceX > 0) {
                    // Swiped left - next slide
                    nextSlide();
                } else {
                    // Swiped right - previous slide
                    prevSlide();
                }
                e.preventDefault();
            }

            startAutoSlide();
        };

        slider.addEventListener('touchend', handleTouchEnd, { passive: false });
        slider.addEventListener('touchcancel', handleTouchEnd, { passive: false });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                stopAutoSlide();
                prevSlide();
                startAutoSlide();
            } else if (e.key === 'ArrowRight') {
                stopAutoSlide();
                nextSlide();
                startAutoSlide();
            }
        });

        // Start the slider
        showSlide(0);
        startAutoSlide();

        // 초기화 완료 표시
        slider.dataset.sliderInitialized = 'true';

    }

    // Add fade-in animation to hero section on page load
    window.addEventListener('load', function() {
        const heroSection = document.querySelector('.facility-hero-section');
        if (heroSection) {
            heroSection.classList.add('fade-in-hero');
        }
    });

    // Usage boxes animation - handled by ScrollAnimations below
})();

// ScrollAnimations 초기화
let scrollAnimations;

function initScrollAnimations() {
    if (typeof ScrollAnimations === 'undefined') {
        setTimeout(initScrollAnimations, 100);
        return;
    }

    scrollAnimations = new ScrollAnimations({
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    const animations = [
        // Facility intro text animation (image will use custom wipe effect)
        { type: 'slideUp', selector: '.facility-intro-text', options: { delay: 200 } },

        // Usage boxes sequential animation - one by one with increased delays
        { type: 'slideUp', selector: '.usage-box[data-features-box]', options: { delay: 100, duration: 800 } },
        { type: 'slideUp', selector: '.usage-box[data-additional-box]', options: { delay: 600, duration: 800 } },   // 0.5초 후
        { type: 'slideUp', selector: '.usage-box[data-benefits-box]', options: { delay: 1100, duration: 800 } },   // 1초 후 (0.5초씩 간격)

        // Special section animations
        { type: 'slideRight', selector: '.facility-special-left', options: { delay: 100 } },
        { type: 'slideLeft', selector: '.facility-special-right', options: { delay: 200 } }
    ];

    scrollAnimations.registerAnimations(animations);

    // Initialize custom wipe reveal for dome image
    initDomeImageWipe();
}

/**
 * Initialize dome image wipe reveal effect
 */
function initDomeImageWipe() {
    const domeImage = document.querySelector('.facility-intro-image.wipe-reveal');

    if (!domeImage) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add visible class to trigger wipe animation
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, 100); // Small delay for better effect

                // Add shadow after wipe animation completes (1.2s)
                setTimeout(() => {
                    entry.target.classList.add('shadow-ready');
                    entry.target.style.overflow = 'visible';
                }, 1300); // After wipe animation completes

                // Unobserve after animation triggers
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
    });

    observer.observe(domeImage);
}

// Initialize animations after DOM loads
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        initScrollAnimations();
    }, 100);
});

/**
 * 컨베이어 벨트 방식 슬라이더 설정
 */
function setupWipeAnimation() {
    const leftSlider = document.querySelector('[data-wipe-slider="left"]');
    const rightSlider = document.querySelector('[data-wipe-slider="right"]');

    // 양쪽 슬라이더가 모두 있어야 작동
    if (leftSlider && rightSlider) {
        createConveyorSlider(leftSlider, rightSlider);
    }
}

/**
 * 컨베이어 벨트 방식 슬라이더 생성
 * 이미지가 순서대로 왼쪽 → 오른쪽으로 이동하며 순환
 */
function createConveyorSlider(leftContainer, rightContainer) {
    // JSON에서 이미지 배열 가져오기
    const imageUrls = getSliderImages();

    if (!imageUrls || imageUrls.length < 2) {
        return;
    }

    let currentIndex = 0;
    let isTransitioning = false;

    // 초기 이미지 설정
    const leftImg = leftContainer.querySelector('img.active');
    const rightImg = rightContainer.querySelector('img.active');

    if (leftImg && rightImg && imageUrls.length >= 2) {
        leftImg.src = imageUrls[0];
        rightImg.src = imageUrls[1];
        currentIndex = 1;
    }

    // 다음 이미지로 전환 (wipe 방식 - 새 이미지를 먼저 뒤에 배치)
    function nextImages() {
        if (isTransitioning || imageUrls.length < 2) return;
        isTransitioning = true;

        // 다음 이미지 인덱스 계산
        const nextIndex = (currentIndex + 1) % imageUrls.length;
        const nextImageUrl = imageUrls[nextIndex];

        // 먼저 기존 이미지의 src를 새 이미지로 변경 (뒤에 배치)
        leftImg.style.zIndex = '1';
        rightImg.style.zIndex = '1';

        // 새 이미지를 기존 img 태그에 로드
        const tempLeftSrc = leftImg.src;
        const tempRightSrc = rightImg.src;
        leftImg.src = rightImg.src;
        rightImg.src = nextImageUrl;

        // 왼쪽 와이프 오버레이 생성 (현재 이미지를 보여줌)
        const leftWipeOverlay = document.createElement('div');
        leftWipeOverlay.style.position = 'absolute';
        leftWipeOverlay.style.top = '0';
        leftWipeOverlay.style.right = '0';
        leftWipeOverlay.style.width = '100%';
        leftWipeOverlay.style.height = '100%';
        leftWipeOverlay.style.background = `url('${tempLeftSrc}') center/cover`;
        leftWipeOverlay.style.zIndex = '10';
        leftWipeOverlay.style.transition = 'width 0.8s ease-in-out';
        leftWipeOverlay.style.overflow = 'hidden';

        // 오른쪽 와이프 오버레이 생성
        const rightWipeOverlay = document.createElement('div');
        rightWipeOverlay.style.position = 'absolute';
        rightWipeOverlay.style.top = '0';
        rightWipeOverlay.style.right = '0';
        rightWipeOverlay.style.width = '100%';
        rightWipeOverlay.style.height = '100%';
        rightWipeOverlay.style.background = `url('${tempRightSrc}') center/cover`;
        rightWipeOverlay.style.zIndex = '10';
        rightWipeOverlay.style.transition = 'width 0.8s ease-in-out';
        rightWipeOverlay.style.overflow = 'hidden';

        // 컨테이너 설정
        leftContainer.style.position = 'relative';
        leftContainer.style.overflow = 'hidden';
        rightContainer.style.position = 'relative';
        rightContainer.style.overflow = 'hidden';

        // 오버레이 추가
        leftContainer.appendChild(leftWipeOverlay);
        rightContainer.appendChild(rightWipeOverlay);

        // 와이프 애니메이션 시작 (순차적으로)
        setTimeout(() => {
            leftWipeOverlay.style.width = '0';
        }, 50);

        setTimeout(() => {
            rightWipeOverlay.style.width = '0';
        }, 150); // 오른쪽은 약간 늦게

        // 애니메이션 완료 후 정리
        setTimeout(() => {
            // 오버레이 제거
            if (leftContainer.contains(leftWipeOverlay)) leftContainer.removeChild(leftWipeOverlay);
            if (rightContainer.contains(rightWipeOverlay)) rightContainer.removeChild(rightWipeOverlay);

            currentIndex = nextIndex;
            isTransitioning = false;
        }, 900);
    }

    // 자동 슬라이드 (3초마다)
    let autoSlideInterval = setInterval(nextImages, 3000);

    // 호버 시 일시정지
    const handleMouseEnter = () => clearInterval(autoSlideInterval);
    const handleMouseLeave = () => {
        autoSlideInterval = setInterval(nextImages, 3000);
    };

    leftContainer.addEventListener('mouseenter', handleMouseEnter);
    leftContainer.addEventListener('mouseleave', handleMouseLeave);
    rightContainer.addEventListener('mouseenter', handleMouseEnter);
    rightContainer.addEventListener('mouseleave', handleMouseLeave);

}

/**
 * 슬라이더 이미지 URL 가져오기
 */
function getSliderImages() {
    // JSON 데이터에서 이미지 가져오기
    // window.facilitySpecialImages가 null이면 슬라이더 비활성화 (mapper에서 설정)
    if (window.facilitySpecialImages && window.facilitySpecialImages.length > 0) {
        // URL만 추출
        return window.facilitySpecialImages.map(img => img.url);
    }

    // 데이터가 없으면 빈 배열 반환 (슬라이더 비활성화, mapper에서 설정한 placeholder 유지)
    return [];
}
/**
 * 공통 스크롤 애니메이션 라이브러리
 * 모든 페이지에서 재사용 가능한 스크롤 기반 애니메이션
 */
class ScrollAnimations {
    constructor(config = {}) {
        this.config = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px',
            ...config
        };
        this.observers = [];
        this.typingInstances = new Map();
        this.init();
    }

    init() {}

    /**
     * 설정 배열로 여러 애니메이션 등록
     * @param {Array} animations - 애니메이션 설정 배열
     */
    registerAnimations(animations) {
        animations.forEach(animation => {
            switch (animation.type) {
                case 'fadeIn':
                    this.fadeInAnimation(animation.selector, animation.options);
                    break;
                case 'slideUp':
                    this.slideUpAnimation(animation.selector, animation.options);
                    break;
                case 'slideLeft':
                    this.slideLeftAnimation(animation.selector, animation.options);
                    break;
                case 'slideRight':
                    this.slideRightAnimation(animation.selector, animation.options);
                    break;
                case 'fadeUp':
                    this.fadeUpAnimation(animation.selector, animation.options);
                    break;
                case 'sequential':
                    this.sequentialAnimation(animation.selector, animation.options);
                    break;
                case 'typing':
                    this.typingAnimation(animation.selector, animation.options);
                    break;
                default:
                    console.warn(`Unknown animation type: ${animation.type}`);
            }
        });
    }

    /**
     * Fade In 애니메이션
     */
    fadeInAnimation(selector, options = {}) {
        const elements = document.querySelectorAll(selector);
        this.observeElements(elements, 'animate-fade-in', options);
    }

    /**
     * Slide Up 애니메이션
     */
    slideUpAnimation(selector, options = {}) {
        const elements = document.querySelectorAll(selector);
        this.observeElements(elements, 'animate-slide-up', options);
    }

    /**
     * Slide Left 애니메이션
     */
    slideLeftAnimation(selector, options = {}) {
        const elements = document.querySelectorAll(selector);
        this.observeElements(elements, 'animate-slide-left', options);
    }

    /**
     * Slide Right 애니메이션
     */
    slideRightAnimation(selector, options = {}) {
        const elements = document.querySelectorAll(selector);
        this.observeElements(elements, 'animate-slide-right', options);
    }

    /**
     * Fade Up 애니메이션 (모바일용 섹션 애니메이션)
     */
    fadeUpAnimation(selector, options = {}) {
        const elements = document.querySelectorAll(selector);
        this.observeElements(elements, 'animate-fade-up', options);
    }

    /**
     * 순차적 애니메이션 (히어로 영역용)
     */
    sequentialAnimation(selector, options = {}) {
        const { delay = 200, stagger = true } = options;
        const elements = document.querySelectorAll(selector);

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const children = entry.target.children;
                    Array.from(children).forEach((child, index) => {
                        const animationDelay = stagger ? delay * index : delay;
                        setTimeout(() => {
                            child.classList.add('animate-sequential-item');
                        }, animationDelay);
                    });
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: this.config.threshold,
            rootMargin: this.config.rootMargin
        });

        elements.forEach(el => {
            // 초기 상태 설정
            const children = el.children;
            Array.from(children).forEach(child => {
                child.classList.add('sequential-item-hidden');
            });
            observer.observe(el);
        });

        this.observers.push(observer);
    }

    /**
     * 타이핑 애니메이션 (클로징 영역용)
     */
    typingAnimation(selector, options = {}) {
        const { speed = 50, lineDelay = 1000 } = options;
        const elements = document.querySelectorAll(selector);

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.startTypingEffect(entry.target, speed, lineDelay);
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: this.config.threshold,
            rootMargin: this.config.rootMargin
        });

        elements.forEach(el => observer.observe(el));
        this.observers.push(observer);
    }

    /**
     * 타이핑 효과 실행
     */
    startTypingEffect(element, speed, lineDelay) {
        const lines = element.querySelectorAll('.typing-line');
        if (lines.length === 0) {
            // 자동으로 라인 분할
            this.createTypingLines(element);
            return this.startTypingEffect(element, speed, lineDelay);
        }

        lines.forEach(line => {
            const originalText = line.textContent;
            line.textContent = '';
            line.style.visibility = 'visible';
        });

        this.typeLines(lines, speed, lineDelay, 0);
    }

    /**
     * 텍스트를 타이핑 라인으로 분할
     */
    createTypingLines(element) {
        const text = element.textContent;
        const lines = text.split('\n').filter(line => line.trim());

        element.innerHTML = '';
        lines.forEach((lineText, index) => {
            const lineElement = document.createElement('div');
            lineElement.className = 'typing-line';
            lineElement.textContent = lineText.trim();
            lineElement.style.visibility = 'hidden';
            element.appendChild(lineElement);
        });
    }

    /**
     * 라인별 순차 타이핑
     */
    typeLines(lines, speed, lineDelay, currentLineIndex) {
        if (currentLineIndex >= lines.length) return;

        const currentLine = lines[currentLineIndex];
        const text = currentLine.textContent;
        currentLine.textContent = '';
        currentLine.style.visibility = 'visible';

        let charIndex = 0;
        const typeChar = () => {
            if (charIndex < text.length) {
                currentLine.textContent += text[charIndex];
                charIndex++;
                setTimeout(typeChar, speed);
            } else {
                // 현재 라인 완료, 다음 라인으로
                setTimeout(() => {
                    this.typeLines(lines, speed, lineDelay, currentLineIndex + 1);
                }, lineDelay);
            }
        };

        typeChar();
    }

    /**
     * 기본 요소 관찰 (Intersection Observer)
     */
    observeElements(elements, animationClass, options = {}) {
        const { delay = 0, once = true } = options;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.classList.add(animationClass);
                    }, delay);

                    if (once) {
                        observer.unobserve(entry.target);
                    }
                }
            });
        }, {
            threshold: this.config.threshold,
            rootMargin: this.config.rootMargin
        });

        elements.forEach(el => observer.observe(el));
        this.observers.push(observer);
    }

    /**
     * Essence 슬라이더 (컨베이어 벨트 스타일 와이프 애니메이션)
     */
    createEssenceSlider(selector, options = {}) {
        const {
            autoSlide = true,
            duration = 3000,
            animationSpeed = 800
        } = options;

        const container = document.querySelector(selector);
        if (!container) return null;

        const thumbnails = container.querySelectorAll('.essence-thumb');
        const mainImage = container.querySelector('[data-essence-image]');

        if (!thumbnails.length || !mainImage) return null;

        let currentSlide = 0;
        let sliderInterval;
        let isTransitioning = false;
        let images = [];

        // 이미지 배열 초기화
        function initializeImages() {
            images = [];
            thumbnails.forEach(thumb => {
                const img = thumb.querySelector('img');
                if (img && img.src) {
                    images.push(img.src);
                }
            });
            if (mainImage.src) {
                images.push(mainImage.src);
            }
        }

        // 컨베이어 벨트 스타일 이미지 전환 애니메이션
        function animateImageSwap() {
            if (isTransitioning || images.length < 3) return;

            isTransitioning = true;

            // 현재 이미지들 가져오기
            const thumbImages = Array.from(thumbnails).map(thumb => thumb.querySelector('img'));
            const currentSources = thumbImages.map(img => img.src);
            currentSources.push(mainImage.src);

            // 컨베이어 벨트 방식: 오른쪽→왼쪽 순환
            const newSources = [
                currentSources[currentSources.length - 1], // 메인이 첫 번째 썸네일로
                ...currentSources.slice(0, -1) // 나머지는 한 칸씩 이동
            ];

            // 각 컨테이너에 와이프 애니메이션 적용
            const containers = Array.from(thumbnails).map(thumb =>
                thumb.querySelector('.essence-thumb-container') || thumb
            );
            const mainContainer = mainImage.parentElement;
            containers.push(mainContainer);

            containers.forEach((container, index) => {
                const currentImg = index < thumbImages.length ? thumbImages[index] : mainImage;
                const newSrc = newSources[index];
                const currentSrc = currentImg.src;

                // 먼저 기존 이미지의 src를 새 이미지로 변경 (뒤에 배치)
                currentImg.style.zIndex = '1';
                const tempSrc = currentImg.src;
                currentImg.src = newSrc;

                // 와이프 오버레이 생성 (현재 이미지를 보여줌)
                const wipeOverlay = document.createElement('div');
                wipeOverlay.style.position = 'absolute';
                wipeOverlay.style.top = '0';
                wipeOverlay.style.right = '0';
                wipeOverlay.style.width = '100%';
                wipeOverlay.style.height = '100%';
                wipeOverlay.style.background = `url('${tempSrc}') center/cover`;

                // 썸네일과 메인 이미지의 다른 border-radius 적용
                if (index < thumbImages.length) {
                    wipeOverlay.style.borderRadius = '100px 100px 0 0';
                } else {
                    wipeOverlay.style.borderRadius = '275px 275px 0 0';
                }

                wipeOverlay.style.zIndex = '10';
                wipeOverlay.style.transition = `width ${animationSpeed}ms ease-in-out`;
                wipeOverlay.style.overflow = 'hidden';

                // 컨테이너 설정
                container.style.position = 'relative';
                container.style.overflow = 'hidden';

                // 오버레이 추가
                container.appendChild(wipeOverlay);

                // 와이프 애니메이션 시작
                setTimeout(() => {
                    wipeOverlay.style.width = '0';
                }, 50 + index * 50); // 순차적 애니메이션

                // 정리 작업
                setTimeout(() => {
                    // 오버레이 제거
                    if (container.contains(wipeOverlay)) container.removeChild(wipeOverlay);

                    if (index === containers.length - 1) {
                        isTransitioning = false;
                    }
                }, animationSpeed + 100);
            });
        }

        // 다음 슬라이드
        function nextSlide() {
            if (isTransitioning) return;
            currentSlide = (currentSlide + 1) % images.length;
            animateImageSwap();
        }

        // 자동 슬라이드 시작/정지
        function startAutoSlide() {
            if (!autoSlide) return;
            stopAutoSlide();
            sliderInterval = setInterval(nextSlide, duration);
        }

        function stopAutoSlide() {
            if (sliderInterval) {
                clearInterval(sliderInterval);
                sliderInterval = null;
            }
        }

        // 이벤트 리스너 설정
        thumbnails.forEach(thumb => {
            thumb.addEventListener('click', () => {
                if (isTransitioning) return;
                stopAutoSlide();
                nextSlide();
                startAutoSlide();
            });
        });

        // 호버 이벤트
        container.addEventListener('mouseenter', stopAutoSlide);
        container.addEventListener('mouseleave', startAutoSlide);

        // 초기화
        initializeImages();
        startAutoSlide();

        // 인스턴스 저장
        const instance = {
            start: startAutoSlide,
            stop: stopAutoSlide,
            next: nextSlide,
            destroy: function() {
                stopAutoSlide();
                container.removeEventListener('mouseenter', stopAutoSlide);
                container.removeEventListener('mouseleave', startAutoSlide);
            }
        };

        this.essenceSliderInstances.set(selector, instance);
        return instance;
    }

    /**
     * 와이프 애니메이션 설정
     */
    setupWipeAnimation(selector, options = {}) {
        const { threshold = 0.1 } = options;
        const elements = document.querySelectorAll(selector);

        // 와이프 애니메이션 CSS 동적 추가
        if (!document.querySelector('#wipe-animation-styles')) {
            const style = document.createElement('style');
            style.id = 'wipe-animation-styles';
            style.textContent = `
                .wipe-container {
                    position: relative;
                    overflow: hidden;
                }

                .wipe-container::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    right: 0;
                    width: 100%;
                    height: 100%;
                    background: inherit;
                    z-index: 10;
                    transition: width 0.8s ease-in-out;
                }

                .wipe-container.wiping::before {
                    width: 0;
                }
            `;
            document.head.appendChild(style);
        }

        elements.forEach(element => {
            element.classList.add('wipe-container');

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !entry.target.classList.contains('wiping')) {
                        entry.target.classList.add('wiping');
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold });

            observer.observe(element);
            this.observers.push(observer);
        });
    }

    /**
     * 간편한 애니메이션 설정 헬퍼 메소드
     * 데이터 속성을 이용한 자동 애니메이션 등록
     */
    autoSetup() {
        // data-animate 속성이 있는 모든 요소를 자동으로 애니메이션 등록
        const animatedElements = document.querySelectorAll('[data-animate]');

        animatedElements.forEach(element => {
            const animationType = element.getAttribute('data-animate');
            const delay = parseInt(element.getAttribute('data-delay')) || 0;
            const stagger = element.getAttribute('data-stagger') === 'true';

            switch(animationType) {
                case 'fade-in':
                    this.fadeInAnimation(`[data-animate="fade-in"]`, { delay });
                    break;
                case 'slide-up':
                    this.slideUpAnimation(`[data-animate="slide-up"]`, { delay });
                    break;
                case 'slide-left':
                    this.slideLeftAnimation(`[data-animate="slide-left"]`, { delay });
                    break;
                case 'slide-right':
                    this.slideRightAnimation(`[data-animate="slide-right"]`, { delay });
                    break;
                case 'sequential':
                    if (stagger) {
                        this.sequentialAnimation(`[data-animate="sequential"]`, {
                            delay: delay || 200,
                            stagger: true
                        });
                    }
                    break;
            }
        });
    }

    /**
     * 페이지별 공통 애니메이션 설정
     * 각 페이지에서 간단하게 호출할 수 있는 메소드
     */
    setupPageAnimations(pageType = 'default') {
        const commonAnimations = [
            // 히어로 섹션 애니메이션
            {
                type: 'sequential',
                selector: '.hero-text-content',
                options: { delay: 200, stagger: true }
            },
            // 섹션 타이틀 애니메이션
            {
                type: 'fadeIn',
                selector: '.section-title, .rooms-title, .gallery-section-title',
                options: { delay: 0 }
            },
            // 콘텐츠 블록 애니메이션
            {
                type: 'slideUp',
                selector: '.essence-content, .gallery-content, .rooms-content',
                options: { delay: 100 }
            }
        ];

        // 페이지별 특별 애니메이션
        const pageSpecificAnimations = {
            'index': [
                // Index 페이지 특별 애니메이션
                {
                    type: 'slideLeft',
                    selector: '.essence-thumbnails',
                    options: { delay: 300 }
                },
                {
                    type: 'slideRight',
                    selector: '.essence-image',
                    options: { delay: 400 }
                },
                {
                    type: 'sequential',
                    selector: '.gallery-grid',
                    options: { delay: 150, stagger: true }
                },
                {
                    type: 'sequential',
                    selector: '.closing-text-content',
                    options: { delay: 300, stagger: true }
                }
            ],
            'room': [
                // Room 페이지 애니메이션
                {
                    type: 'fadeIn',
                    selector: '.room-images',
                    options: { delay: 200 }
                },
                {
                    type: 'slideUp',
                    selector: '.room-info',
                    options: { delay: 300 }
                }
            ]
        };

        // 공통 애니메이션 등록
        this.registerAnimations(commonAnimations);

        // 페이지별 애니메이션 등록
        if (pageSpecificAnimations[pageType]) {
            this.registerAnimations(pageSpecificAnimations[pageType]);
        }

        // 자동 설정도 실행
        this.autoSetup();
    }

    /**
     * 모든 Observer 정리
     */
    destroy() {
        this.observers.forEach(observer => observer.disconnect());
        this.observers = [];
        this.typingInstances.clear();
    }

    /**
     * 개별 애니메이션 재시작
     */
    restart(selector) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
            el.classList.remove('animate-fade-in', 'animate-slide-up', 'animate-slide-left', 'animate-slide-right', 'animate-sequential-item');
        });
    }
}

// 전역으로 노출
window.ScrollAnimations = ScrollAnimations;

// ES6 모듈 지원
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ScrollAnimations;
}
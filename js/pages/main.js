// Main page JavaScript
(function() {
    'use strict';

    // DOM ready event
    document.addEventListener('DOMContentLoaded', function() {

        // MainMapper가 데이터를 로드한 후에 애니메이션 초기화
        // setTimeout으로 약간의 지연을 줘서 DOM이 완전히 생성되도록 함
        setTimeout(function() {
            // ScrollAnimations 인스턴스 생성
            const scrollAnimator = new ScrollAnimations({
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            });

            // text-content 순차 애니메이션 등록
            const textContent = document.querySelector('.text-content');
            if (textContent) {
                // hero-content 요소를 sequential animation 대상으로 설정
                const heroContent = textContent.querySelector('.hero-content');
                if (heroContent) {
                    // 초기 상태 설정 - 각 자식 요소들
                    const logoLine = textContent.querySelector('.logo-line-container');
                    const heroTitle = heroContent.querySelector('.hero-title');
                    const heroDescription = heroContent.querySelector('.hero-description');

                    if (logoLine) {
                        logoLine.style.opacity = '0';
                        logoLine.style.transform = 'translateX(-50px)';
                        logoLine.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                    }
                    if (heroTitle) {
                        heroTitle.style.opacity = '0';
                        heroTitle.style.transform = 'translateX(-50px)';
                        heroTitle.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                    }
                    if (heroDescription) {
                        heroDescription.style.opacity = '0';
                        heroDescription.style.transform = 'translateX(50px)';
                        heroDescription.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                    }

                    // IntersectionObserver로 text-content 감시
                    const textObserver = new IntersectionObserver((entries) => {
                        entries.forEach(entry => {
                            if (entry.isIntersecting) {
                                // 순차적 애니메이션 실행
                                if (logoLine) {
                                    setTimeout(() => {
                                        logoLine.style.opacity = '1';
                                        logoLine.style.transform = 'translateX(0)';
                                    }, 100);
                                }
                                if (heroTitle) {
                                    setTimeout(() => {
                                        heroTitle.style.opacity = '1';
                                        heroTitle.style.transform = 'translateX(0)';
                                    }, 300);
                                }
                                if (heroDescription) {
                                    setTimeout(() => {
                                        heroDescription.style.opacity = '1';
                                        heroDescription.style.transform = 'translateX(0)';
                                    }, 500);
                                }
                                textObserver.unobserve(entry.target);
                            }
                        });
                    }, { threshold: 0.2 });

                    textObserver.observe(textContent);
                }
            }

            // About block 이미지와 텍스트 애니메이션
            const observerOptions = {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            };

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        // about-block 내의 이미지와 텍스트에 visible 클래스 추가
                        const image = entry.target.querySelector('.about-image');
                        const text = entry.target.querySelector('.about-text');

                        if (image) {
                            image.classList.add('visible');
                        }
                        if (text) {
                            setTimeout(() => {
                                text.classList.add('visible');
                            }, 200); // 텍스트는 이미지보다 조금 늦게
                        }
                    }
                });
            }, observerOptions);

            // about-block 요소들 관찰
            const aboutBlocks = document.querySelectorAll('.about-block');
            aboutBlocks.forEach(block => {
                observer.observe(block);
            });

            // full-banner fade 애니메이션
            scrollAnimator.fadeInAnimation('.full-banner', { delay: 200 });

            // Handle typing animation
            const typingText = document.querySelector('.typing-text');
            if (typingText) {
                setTimeout(() => {
                    typingText.classList.add('typed');
                }, 2700);
            }
        }, 500); // MainMapper가 DOM을 생성할 시간을 줌
    });
})();

// Prologue Hero Slider
// 슬라이드 1장: 네비게이션 숨김, 자동재생 없음 / 2장 이상: index 메인 히어로와 같은 ‹ › + 프로그레스바
(function() {
    'use strict';

    const SLIDE_DURATION = 5000; // index 메인 히어로와 동일
    let teardown = null;

    function initMainHeroSlider() {
        // 재매핑(관리자 미리보기 등)으로 다시 불려도 타이머·리스너가 쌓이지 않게 이전 것 정리
        if (teardown) {
            teardown();
            teardown = null;
        }

        const section = document.querySelector('.page-hero-section');
        const slider = document.querySelector('[data-main-hero-slider]');
        const nav = document.querySelector('[data-main-hero-nav]');
        if (!section || !slider) return;

        const slides = Array.from(slider.querySelectorAll('.slide'));
        const isMulti = slides.length > 1;
        if (nav) nav.classList.toggle('is-active', isMulti);
        if (!isMulti) return;

        const prevBtn = nav ? nav.querySelector('.slider-btn.prev') : null;
        const nextBtn = nav ? nav.querySelector('.slider-btn.next') : null;
        const progressBar = nav ? nav.querySelector('.progress-bar') : null;
        const abort = new AbortController();
        const listen = { signal: abort.signal };
        let current = Math.max(0, slides.findIndex(slide => slide.classList.contains('active')));
        let timer = null;

        slides.forEach((slide, i) => slide.classList.toggle('active', i === current));

        function show(index) {
            const next = (index + slides.length) % slides.length;
            if (next === current) return;
            // 새 슬라이드 먼저 활성화 (흰 배경 방지)
            slides[next].classList.add('active');
            slides[current].classList.remove('active');
            current = next;
        }

        function startProgress() {
            if (!progressBar) return;
            progressBar.style.transition = 'none';
            progressBar.style.width = '0%';
            progressBar.offsetHeight; // 리플로우로 0% 상태 확정
            progressBar.style.transition = `width ${SLIDE_DURATION}ms linear`;
            progressBar.style.width = '100%';
        }

        function stop() {
            clearInterval(timer);
            timer = null;
            if (progressBar) {
                progressBar.style.transition = 'none';
                progressBar.style.width = '0%';
            }
        }

        function start() {
            stop();
            timer = setInterval(() => {
                show(current + 1);
                startProgress();
            }, SLIDE_DURATION);
            startProgress();
        }

        function go(index) {
            show(index);
            start();
        }

        if (prevBtn) prevBtn.addEventListener('click', () => go(current - 1), listen);
        if (nextBtn) nextBtn.addEventListener('click', () => go(current + 1), listen);

        // 모바일 스와이프 (타이틀·네비가 슬라이드 위를 덮으므로 섹션 전체에서 받는다)
        let touchStartX = 0;
        let touchStartY = 0;
        let touchEndX = 0;
        let touchEndY = 0;

        section.addEventListener('touchstart', (e) => {
            touchStartX = touchEndX = e.changedTouches[0].screenX;
            touchStartY = touchEndY = e.changedTouches[0].screenY;
        }, { passive: true, signal: abort.signal });

        section.addEventListener('touchmove', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            touchEndY = e.changedTouches[0].screenY;
            const deltaX = Math.abs(touchStartX - touchEndX);
            const deltaY = Math.abs(touchStartY - touchEndY);
            // 수평 이동이 수직보다 크면 스크롤 방지
            if (deltaX > deltaY && deltaX > 10) {
                e.preventDefault();
            }
        }, { passive: false, signal: abort.signal });

        section.addEventListener('touchend', () => {
            const deltaX = touchStartX - touchEndX;
            const deltaY = Math.abs(touchStartY - touchEndY);
            if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > deltaY) {
                go(deltaX > 0 ? current + 1 : current - 1);
            }
        }, { passive: true, signal: abort.signal });

        start();

        teardown = () => {
            stop();
            abort.abort();
        };
    }

    // MainMapper / preview-handler 에서 호출
    window.initMainHeroSlider = initMainHeroSlider;

    // 매퍼가 이 스크립트보다 먼저 슬라이드를 그렸다면 바로 초기화
    if (document.querySelector('[data-main-hero-slider] .slide')) {
        initMainHeroSlider();
    }
})();
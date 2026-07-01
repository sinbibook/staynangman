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
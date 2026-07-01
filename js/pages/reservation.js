
// 스크롤 기반 이미지 및 텍스트 애니메이션 시스템
document.addEventListener('DOMContentLoaded', function() {
    // 타이핑 애니메이션 처리
    const typingText = document.querySelector('.typing-text');
    if (typingText) {
        setTimeout(() => {
            typingText.classList.add('typed');
        }, 2700);
    }
    // 모든 이미지 패널 가져오기
    const imagePanels = document.querySelectorAll('.reservation-panel-image');
    // 모든 reservation 박스 가져오기
    const reservationBoxes = document.querySelectorAll('.reservation-box');

    // 이미지 애니메이션을 위한 Intersection Observer 설정
    const imageObserverOptions = {
        root: null,
        rootMargin: '-20% 0px',
        threshold: 0
    };

    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // CSS에서 border-radius를 처리하므로 JavaScript에서는 설정하지 않음
            } else {
                entry.target.classList.remove('visible');
            }
        });
    }, imageObserverOptions);

    // 텍스트 박스 애니메이션을 위한 Intersection Observer 설정
    const textObserverOptions = {
        root: null,
        rootMargin: '-10% 0px',
        threshold: 0.2
    };

    const textObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, textObserverOptions);

    // 각 이미지 패널 관찰 시작
    imagePanels.forEach(panel => {
        imageObserver.observe(panel);
    });

    // 각 텍스트 박스 관찰 시작
    reservationBoxes.forEach(box => {
        textObserver.observe(box);
    });

});
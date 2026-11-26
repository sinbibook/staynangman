/**
 * Main Page Data Mapper
 * main.html 전용 매핑 함수들을 포함한 클래스
 * BaseDataMapper를 상속받아 main 페이지 특화 기능 제공
 */
class MainMapper extends BaseDataMapper {
    constructor() {
        super();
    }

    // ============================================================================
    // 🏠 MAIN PAGE SPECIFIC MAPPINGS
    // ============================================================================

    /**
     * Hero 이미지 매핑
     * homepage.customFields.pages.main.sections[0].hero.images → [data-main-hero-slider]
     * - 선택 이미지 1장: 슬라이드 1개만 그리고 네비게이션은 숨김 (기존 단일 이미지와 동일하게 보임)
     * - 선택 이미지 2장 이상: index 메인 히어로와 같은 ‹ › + 프로그레스바 슬라이더 (js/pages/main.js)
     */
    mapHeroSlider() {
        if (!this.isDataLoaded) return;

        const heroData = this.safeGet(this.data, 'homepage.customFields.pages.main.sections.0.hero');
        const slider = this.safeSelect('[data-main-hero-slider]');
        const isDemo = this.dataSource === 'demo-filled.json';

        if (!slider) return;

        // isSelected: true인 이미지만 필터링하고 sortOrder로 정렬
        let images = Array.isArray(heroData?.images)
            ? heroData.images
                .filter(img => img && img.isSelected === true && img.url)
                .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
                .map(img => ({ url: img.url, alt: this.sanitizeText(img.description, '메인 이미지') }))
            : [];

        if (images.length === 0) {
            images = isDemo
                // demo 모드: fallback 이미지
                ? [{ url: './images/hero.jpg', alt: '메인 이미지' }]
                // standard-template-data.json: empty-image placeholder
                : [{ url: ImageHelpers.EMPTY_IMAGE_WITH_ICON, alt: '이미지 없음', isEmpty: true }];
        }

        slider.innerHTML = '';
        images.forEach((image, index) => {
            const slide = document.createElement('div');
            slide.className = index === 0 ? 'slide active' : 'slide';

            const img = document.createElement('img');
            img.src = image.url;
            img.alt = image.alt;
            img.loading = index === 0 ? 'eager' : 'lazy';
            if (image.isEmpty) {
                img.classList.add('empty-image-placeholder');
            }

            slide.appendChild(img);
            slider.appendChild(slide);
        });

        // 슬라이드 개수에 맞춰 네비게이션 노출/자동재생 (재매핑 시에도 다시 초기화)
        if (typeof window.initMainHeroSlider === 'function') {
            window.initMainHeroSlider();
        }
    }

    /**
     * Property Name Korean 매핑 (customFields 우선)
     * homepage.customFields.property.name → [data-main-property-name-kr]
     */
    mapPropertyNameKr() {
        if (!this.isDataLoaded) return;

        const propertyName = this.getPropertyName();
        const propertyNameElement = this.safeSelect('[data-main-property-name-kr]');

        if (propertyNameElement) {
            propertyNameElement.textContent = propertyName;
        }
    }

    /**
     * Property Name English 매핑 (customFields 우선)
     * homepage.customFields.property.nameEn → [data-main-property-name-en]
     */
    mapPropertyNameEn() {
        if (!this.isDataLoaded) return;

        const propertyNameEn = this.getPropertyNameEn();
        const propertyNameElement = this.safeSelect('[data-main-property-name-en]');

        if (propertyNameElement) {
            propertyNameElement.textContent = propertyNameEn;
        }
    }

    /**
     * About 섹션 매핑 (제목 + 설명)
     * customFields.pages.main.sections[0].hero.title → [data-main-about-title]
     * customFields.pages.main.sections[0].hero.description → [data-main-about-description]
     */
    mapAboutSection() {
        if (!this.isDataLoaded) return;

        const heroData = this.safeGet(this.data, 'homepage.customFields.pages.main.sections.0.hero');

        // About 제목 매핑
        const aboutTitle = this.safeSelect('[data-main-about-title]');
        if (aboutTitle) {
            aboutTitle.textContent = this.sanitizeText(heroData?.title, '소개 페이지 히어로 타이틀');
        }

        // About 설명 매핑
        const aboutDescription = this.safeSelect('[data-main-about-description]');
        if (aboutDescription) {
            aboutDescription.innerHTML = this._formatTextWithLineBreaks(heroData?.description, '소개 페이지 히어로 설명');
        }
    }

    /**
     * Full Banner 이미지 매핑
     * property.images[0].exterior → [data-main-banner] 배경 이미지
     */
    mapFullBanner() {
        if (!this.isDataLoaded) return;

        const banner = this.safeSelect('[data-main-banner]');
        if (!banner) return;

        const isDemo = this.dataSource === 'demo-filled.json';

        // 숙소 exterior 이미지 가져오기 (customFields 우선)
        const exteriorImages = this.getPropertyImages('property_exterior');
        const targetImage = exteriorImages[0];

        // 기존 placeholder img 제거
        const existingPlaceholder = banner.querySelector('.banner-placeholder-img');
        if (existingPlaceholder) {
            existingPlaceholder.remove();
        }

        if (targetImage && targetImage.url) {
            // 배경 이미지 설정
            banner.style.backgroundImage = `url('${targetImage.url}')`;
            banner.classList.remove('empty-image-placeholder');
        } else if (isDemo) {
            // demo 모드: fallback 이미지
            banner.style.backgroundImage = `url('./images/exterior.jpg')`;
            banner.classList.remove('empty-image-placeholder');
        } else {
            // standard-template-data.json: empty-image placeholder (img 요소 사용)
            banner.style.backgroundImage = 'none';
            banner.classList.add('empty-image-placeholder');

            const placeholderImg = document.createElement('img');
            placeholderImg.src = ImageHelpers.EMPTY_IMAGE_WITH_ICON;
            placeholderImg.alt = '이미지 없음';
            placeholderImg.className = 'banner-placeholder-img empty-image-placeholder';
            placeholderImg.style.cssText = 'width: 100%; height: 100%; position: absolute; top: 0; left: 0;';
            banner.style.position = 'relative';
            banner.insertBefore(placeholderImg, banner.firstChild);
        }

        // 공통 배경 스타일 (이미지가 있을 때만)
        if (targetImage?.url || isDemo) {
            banner.style.backgroundSize = 'cover';
            banner.style.backgroundPosition = 'center';
            banner.style.backgroundRepeat = 'no-repeat';
        }

        // 숙소 영문명 매핑 (customFields 우선, full-banner 내부)
        const propertyNameEn = this.getPropertyNameEn();
        const closingPropertyName = banner.querySelector('[data-closing-property-name]');
        if (closingPropertyName) {
            closingPropertyName.textContent = propertyNameEn;
        }
    }

    /**
     * Introduction 섹션 매핑 (동적 블록 생성)
     * homepage.customFields.pages.main.sections[0].about[] → [data-main-introduction]
     */
    mapIntroductionSection() {
        if (!this.isDataLoaded) return;

        const aboutBlocks = this.safeGet(this.data, 'homepage.customFields.pages.main.sections.0.about');
        const introContainer = this.safeSelect('[data-main-introduction]');
        const isDemo = this.dataSource === 'demo-filled.json';

        if (!introContainer) {
            return;
        }

        // 기존 about-block 제거
        introContainer.innerHTML = '';

        // 최소 2개 블록 보장
        const emptyImage = ImageHelpers.EMPTY_IMAGE_WITH_ICON;
        const minBlocks = 2;
        let blocksToRender = Array.isArray(aboutBlocks) ? [...aboutBlocks] : [];

        // 부족한 블록 수만큼 기본 블록 추가
        while (blocksToRender.length < minBlocks) {
            blocksToRender.push(isDemo ? {
                title: '소개 섹션 타이틀',
                description: '소개 섹션 설명',
                images: ['./images/room.jpg']
            } : {
                title: '소개 섹션 타이틀',
                description: '소개 섹션 설명',
                images: [emptyImage],
                isEmpty: true
            });
        }

        // 각 about 블록에 대해 about-block 생성
        const totalBlocks = blocksToRender.length;
        blocksToRender.forEach((block, index) => {
            const aboutBlock = this.createAboutBlock(block, isDemo);

            // 동적 그라데이션 적용
            this.applyDynamicGradient(aboutBlock, index, totalBlocks);

            introContainer.appendChild(aboutBlock);
        });

        // about-block 스크롤 애니메이션 재설정
        this.setupAboutBlockAnimations();
    }

    /**
     * about-block 스크롤 애니메이션 설정
     */
    setupAboutBlockAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const image = entry.target.querySelector('.about-image');
                    const text = entry.target.querySelector('.about-text');

                    if (image) {
                        image.classList.add('visible');
                    }
                    if (text) {
                        setTimeout(() => {
                            text.classList.add('visible');
                        }, 200);
                    }
                }
            });
        }, observerOptions);

        const aboutBlocks = document.querySelectorAll('.about-block');
        aboutBlocks.forEach(block => {
            observer.observe(block);
        });
    }

    /**
     * 동적 그라데이션 적용 헬퍼 함수
     */
    applyDynamicGradient(element, index, total) {
        // 블록이 하나일 때는 CSS에서 처리
        if (total === 1) {
            // CSS의 .about-block:first-child 스타일 사용
            // 세로줄 색상 스타일 적용 (중복 방지)
            this.applyAboutTextLineStyle(0.2);
            return;
        }

        // 여러 블록일 때는 그라데이션
        // 색상 정의
        const startColor = { r: 230, g: 243, b: 255 }; // #e6f3ff (하늘색 - body 배경색)
        const endColor = { r: 101, g: 131, b: 153 }; // #658399

        // 현재 블록의 위치 비율 계산
        const ratio = index / (total - 1);
        const nextRatio = Math.min(1, (index + 1) / (total - 1));

        // 색상 보간
        const topColor = {
            r: Math.round(startColor.r + (endColor.r - startColor.r) * ratio),
            g: Math.round(startColor.g + (endColor.g - startColor.g) * ratio),
            b: Math.round(startColor.b + (endColor.b - startColor.b) * ratio)
        };

        const bottomColor = {
            r: Math.round(startColor.r + (endColor.r - startColor.r) * nextRatio),
            g: Math.round(startColor.g + (endColor.g - startColor.g) * nextRatio),
            b: Math.round(startColor.b + (endColor.b - startColor.b) * nextRatio)
        };

        // CSS의 nth-child 스타일 사용 (인라인 스타일 제거)
        // element.style.background은 CSS에서 처리

        // 첫 번째 블록이 아주 밝을 때 텍스트 색상 조정 - CSS에서 처리하도록 변경
        // inline 스타일 적용 제거 - CSS 변수 사용
    }

    /**
     * about-text 세로줄 스타일 적용 (중복 방지)
     */
    applyAboutTextLineStyle(opacity) {
        const styleId = 'about-text-line-style';
        let existingStyle = document.getElementById(styleId);

        if (!existingStyle) {
            existingStyle = document.createElement('style');
            existingStyle.id = styleId;
            document.head.appendChild(existingStyle);
        }

        existingStyle.textContent = `
            .about-block:first-child .about-text::after {
                background: rgba(101, 131, 153, ${opacity}) !important;
            }
        `;
    }

    /**
     * About 블록 생성 헬퍼 함수 (새로운 구조 - 원형 이미지 1개 + 중앙정렬 텍스트)
     */
    createAboutBlock(block, isDemo = true) {
        const aboutBlock = document.createElement('div');
        aboutBlock.className = 'about-block';

        // 내부 컨테이너 추가
        const innerContainer = document.createElement('div');
        innerContainer.className = 'about-block-inner';

        // 이미지 컨테이너 (세로 이미지)
        const imageContainer = document.createElement('div');
        imageContainer.className = 'about-image';
        const img = document.createElement('img');

        // 이미지 처리
        const defaultImage = './images/room.jpg';
        const emptyImage = ImageHelpers.EMPTY_IMAGE_WITH_ICON;
        let useEmptyPlaceholder = false;

        if (block.images && Array.isArray(block.images) && block.images[0]) {
            img.src = typeof block.images[0] === 'string' ? block.images[0] : block.images[0].url || defaultImage;
        } else {
            // 이미지가 없을 때 isDemo에 따라 처리
            if (isDemo) {
                img.src = defaultImage;
            } else {
                img.src = emptyImage;
                useEmptyPlaceholder = true;
            }
        }

        // empty-image placeholder 처리
        if (block.isEmpty || useEmptyPlaceholder) {
            img.classList.add('empty-image-placeholder');
            img.alt = '이미지 없음';
        } else {
            img.alt = this.sanitizeText(block.title, '소개 이미지');
        }
        imageContainer.appendChild(img);

        // 텍스트 컨테이너
        const aboutText = document.createElement('div');
        aboutText.className = 'about-text';

        const title = document.createElement('h3');
        title.className = 'about-title';
        title.textContent = this.sanitizeText(block.title, '소개 섹션 타이틀');

        const description = document.createElement('p');
        description.className = 'about-description';
        description.innerHTML = this._formatTextWithLineBreaks(block.description, '소개 섹션 설명');

        aboutText.appendChild(title);
        aboutText.appendChild(description);

        // inner container에 추가
        innerContainer.appendChild(imageContainer);
        innerContainer.appendChild(aboutText);

        // about-block에 inner container 추가
        aboutBlock.appendChild(innerContainer);

        return aboutBlock;
    }

    // ============================================================================
    // 🔄 TEMPLATE METHODS IMPLEMENTATION
    // ============================================================================

    /**
     * Main 페이지 전체 매핑 실행
     */
    async mapPage() {

        if (!this.isDataLoaded) {
            return;
        }

        // Main 페이지 섹션들 순차 매핑
        this.mapHeroSlider();
        this.mapPropertyNameKr();
        this.mapPropertyNameEn();
        this.mapAboutSection();
        this.mapFullBanner();
        this.mapIntroductionSection();

        // 메타 태그 업데이트
        this.updateMetaTags();

        // 스크롤 애니메이션 재초기화
        this.reinitializeScrollAnimations();
    }

    /**
     * 스크롤 애니메이션 재초기화
     */
    reinitializeScrollAnimations() {
        // main.js의 setupScrollAnimations() 함수 호출
        if (typeof window.setupScrollAnimations === 'function') {
            window.setupScrollAnimations();
        }

        // 즉시 체크 (화면에 이미 보이는 요소들)
        const animateElements = document.querySelectorAll('.animate-element');
        animateElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 150;

            if (elementTop < window.innerHeight - elementVisible) {
                element.classList.add('animate');
            }
        });
    }
}

// ============================================================================
// 🚀 INITIALIZATION
// ============================================================================

// 페이지 로드 시 자동 초기화 (로컬 환경용, iframe 아닐 때만)
if (typeof window !== 'undefined' && window.parent === window) {
    window.addEventListener('DOMContentLoaded', async () => {
        const mapper = new MainMapper();
        await mapper.initialize();
    });
}

// ES6 모듈 및 글로벌 노출
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MainMapper;
} else {
    window.MainMapper = MainMapper;
}

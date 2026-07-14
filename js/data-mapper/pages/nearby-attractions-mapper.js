/**
 * Nearby Attractions Page Data Mapper
 * nearby-attractions.html 전용 매핑 함수들을 포함한 클래스
 * BaseDataMapper를 상속받아 주변 명소 페이지 전용 기능 제공
 */
class NearbyAttractionsMapper extends BaseDataMapper {
    constructor() {
        super();
    }

    /**
     * 메인 매핑 메서드
     */
    async mapPage() {
        if (!this.isDataLoaded) return;

        try {
            // enabled 확인 - false면 404로 리다이렉트
            const isEnabled = this.safeGet(this.data, 'homepage.customFields.pages.nearbyAttractions.sections.0.enabled');
            if (isEnabled === false) {
                window.location.href = window.location.pathname.split('/').slice(0, -1).join('/') + '/404.html';
                return;
            }

            // SEO 메타 태그 업데이트
            this.updateMetaTags();

            // 각 섹션 매핑
            this.mapHeroSection();
            this.mapPropertyInfo();
            this.mapIntroSection();
            this.mapAttractionsContent();
            this.mapClosingSection();

            // 헤더, 푸터 매핑
            if (typeof window.headerFooterMapper !== 'undefined') {
                window.headerFooterMapper.mapHeaderFooter();
            }

            // 슬라이더 초기화 (main.html의 reinitializeScrollAnimations처럼)
            this.initializeSlider();

        } catch (error) {
            console.error('NearbyAttractionsMapper mapPage error:', error);
        }
    }

    /**
     * SEO 메타 태그 업데이트
     */
    updateMetaTags() {
        const propertyNameEn = this.getPropertyNameEn();
        const pageTitle = document.getElementById('page-title');
        if (pageTitle) {
            pageTitle.textContent = `주변 명소 - ${propertyNameEn}`;
        }

        // 네이버/구글 사이트 인증 meta 태그 주입 (전 페이지 공통)
        const seo = this.safeGet(this.data, 'homepage.seo');
        if (seo) {
            this.upsertMetaByName('naver-site-verification', seo.naverSiteVerification);
            this.upsertMetaByName('google-site-verification', seo.googleSiteVerification);
        }
    }

    /**
     * Hero 섹션 매핑 (nearbyAttractions.hero.images[0])
     */
    mapHeroSection() {
        if (!this.isDataLoaded || !this.data.property) return;

        // Hero 이미지 매핑
        const heroImages = this.safeGet(this.data, 'homepage.customFields.pages.nearbyAttractions.sections.0.hero.images');
        const heroImg = document.querySelector('[data-nearby-hero-image]');

        if (!heroImg) return;

        if (heroImages && heroImages.length > 0) {
            // url이 있는 이미지를 찾기
            const selectedImage = heroImages.find(img => img.url) || heroImages[0];
            if (selectedImage && selectedImage.url) {
                heroImg.src = selectedImage.url;
                heroImg.alt = selectedImage.description || '주변 명소 히어로 이미지';
                heroImg.classList.remove('empty-image-placeholder');
                return;
            }
        }

        // 이미지가 없을 경우 placeholder 사용
        if (typeof ImageHelpers !== 'undefined') {
            heroImg.src = ImageHelpers.EMPTY_IMAGE_WITH_ICON;
            heroImg.alt = '이미지 없음';
            heroImg.classList.add('empty-image-placeholder');
            heroImg.style.opacity = '1';
        }
    }

    /**
     * Property 정보 매핑
     */
    mapPropertyInfo() {
        if (!this.isDataLoaded) return;

        const propertyName = this.getPropertyName();
        const propertyNameEn = this.getPropertyNameEn();

        // 모든 한글 숙소명 요소 매핑
        document.querySelectorAll('[data-property-name]').forEach(el => {
            el.textContent = propertyName;
        });

        // 모든 영문 숙소명 요소 매핑
        document.querySelectorAll('[data-hero-property-name-en]').forEach(el => {
            el.textContent = propertyNameEn;
        });

        // Intro 섹션 영문 숙소명 매핑
        document.querySelectorAll('[data-attractions-property-name-en]').forEach(el => {
            el.textContent = propertyNameEn;
        });
    }

    /**
     * Intro 섹션 매핑 (nearbyAttractions.hero.title, description)
     */
    mapIntroSection() {
        if (!this.isDataLoaded || !this.data.property) return;

        const heroData = this.safeGet(this.data, 'homepage.customFields.pages.nearbyAttractions.sections.0.hero');
        if (!heroData) return;

        // 제목 매핑
        const titleEl = document.querySelector('[data-nearby-attractions-about-title]');
        if (titleEl && heroData.title) {
            titleEl.textContent = this.sanitizeText(heroData.title);
        }

        // 설명 매핑
        const descEl = document.querySelector('[data-nearby-attractions-about-description]');
        if (descEl && heroData.description) {
            descEl.textContent = this.sanitizeText(heroData.description);
        }
    }

    /**
     * 주변 명소 슬라이드 동적 생성
     */
    generateAttractionsSlides() {
        const aboutItems = this.safeGet(this.data, 'homepage.customFields.pages.nearbyAttractions.sections.0.about') || [];
        const slider = document.querySelector('.attractions-slider');
        if (!slider) return;

        // 기존 슬라이드 제거 (동적 생성된 것만)
        const existingSlides = slider.querySelectorAll('.attractions-slide[data-generated="true"]');
        existingSlides.forEach(slide => slide.remove());

        // 필요한 슬라이드 생성 (최소 1개)
        const existingCount = slider.querySelectorAll('.attractions-slide:not([data-generated="true"])').length;
        const minSlides = Math.max(1, aboutItems.length); // 최소 1개 슬라이드
        const neededCount = Math.max(0, minSlides - existingCount);

        for (let i = 0; i < neededCount; i++) {
            const slideIndex = existingCount + i;
            const slide = document.createElement('div');
            slide.className = 'attractions-slide animate-element';
            slide.setAttribute('data-generated', 'true');
            if (slideIndex === 0) {
                slide.classList.add('active');
            }

            slide.innerHTML = `
                <div class="title-buttons-row">
                    <h3 class="attraction-item-title" data-nearby-attractions-title-${slideIndex}></h3>
                    <div class="slide-nav-buttons">
                        <button class="attractions-prev" aria-label="Previous attraction">‹</button>
                        <button class="attractions-next" aria-label="Next attraction">›</button>
                    </div>
                </div>
                <div class="attractions-image-wrapper">
                    <div class="attraction-images-grid">
                        <div class="attraction-grid-item">
                            <img alt="주변 명소" class="attraction-image empty-image-placeholder" data-nearby-attractions-image-${slideIndex}>
                        </div>
                        <div class="attraction-grid-item">
                            <img alt="주변 명소" class="attraction-image empty-image-placeholder" data-nearby-attractions-image-${slideIndex}-b>
                        </div>
                    </div>
                </div>
                <p class="attraction-item-description" data-nearby-attractions-description-${slideIndex}></p>
            `;

            slider.appendChild(slide);
        }
    }

    /**
     * 주변 명소 정보 매핑 (nearbyAttractions.about[0~n])
     */
    mapAttractionsContent() {
        if (!this.isDataLoaded || !this.data.property) return;

        const aboutItems = this.safeGet(this.data, 'homepage.customFields.pages.nearbyAttractions.sections.0.about') || [];

        // 필요한 슬라이드 생성
        this.generateAttractionsSlides();

        // aboutItems가 없으면 첫 번째 슬라이드에만 placeholder 표시
        if (aboutItems.length === 0) {
            const placeholderImages = document.querySelectorAll('[data-nearby-attractions-image-0], [data-nearby-attractions-image-0-b]');
            placeholderImages.forEach(imgEl => {
                if (typeof ImageHelpers !== 'undefined') {
                    imgEl.src = ImageHelpers.EMPTY_IMAGE_WITH_ICON;
                    imgEl.alt = '이미지 없음';
                    imgEl.classList.add('empty-image-placeholder');
                    imgEl.style.opacity = '1';
                }
            });
            return;
        }

        // 모든 명소 처리 (제한 없음)
        for (let i = 0; i < aboutItems.length; i++) {
            const item = aboutItems[i];

            // 제목 매핑
            const titleEl = document.querySelector(`[data-nearby-attractions-title-${i}]`);
            if (titleEl && item.title) {
                titleEl.textContent = this.sanitizeText(item.title);
            }

            // 설명 매핑 (\n을 <br>로 변환)
            const descEl = document.querySelector(`[data-nearby-attractions-description-${i}]`);
            if (descEl && item.description) {
                const sanitized = this.sanitizeText(item.description);
                descEl.innerHTML = sanitized.replace(/\n/g, '<br>');
            }

            // 이미지 매핑 (최대 2개)
            const imgSelectors = [`[data-nearby-attractions-image-${i}]`, `[data-nearby-attractions-image-${i}-b]`];
            const images = item.images || [];

            imgSelectors.forEach((selector, idx) => {
                const imgEl = document.querySelector(selector);
                if (!imgEl) return;

                const imageData = images[idx];

                if (imageData && imageData.url && imageData.isSelected) {
                    imgEl.src = imageData.url;
                    imgEl.alt = imageData.description || item.title || `주변 명소 ${i + 1}`;
                    imgEl.classList.remove('empty-image-placeholder');
                } else {
                    // 이미지가 없을 경우 placeholder 사용
                    if (typeof ImageHelpers !== 'undefined') {
                        imgEl.src = ImageHelpers.EMPTY_IMAGE_WITH_ICON;
                        imgEl.alt = '이미지 없음';
                        imgEl.classList.add('empty-image-placeholder');
                        imgEl.style.opacity = '1';
                    }
                }
            });
        }
    }

    /**
     * Closing 섹션 매핑 (단일 이미지 - exterior[3])
     */
    mapClosingSection() {
        if (!this.isDataLoaded || !this.data.property) return;

        const propertyNameEn = this.getPropertyNameEn();

        // Closing 이미지 매핑 (index 3 사용)
        const exteriorImages = this.getPropertyImages('property_exterior');
        const closingSection = document.querySelector('[data-nearby-closing]');
        const closingImg = document.querySelector('[data-nearby-closing-image]');

        if (closingImg) {
            if (exteriorImages.length > 0) {
                closingImg.src = exteriorImages[0].url;
                closingImg.alt = exteriorImages[0].description || 'Closing Image';
                closingImg.classList.remove('empty-image-placeholder');
            } else if (typeof ImageHelpers !== 'undefined') {
                closingImg.src = ImageHelpers.EMPTY_IMAGE_WITH_ICON;
                closingImg.alt = '이미지 없음';
                closingImg.classList.add('empty-image-placeholder');
                closingImg.style.opacity = '1';
            }
        }

        // Closing 텍스트 매핑
        const closingPropertyName = document.querySelector('[data-closing-property-name-en]');
        if (closingPropertyName) {
            closingPropertyName.textContent = propertyNameEn;
        }

        // 스크롤 시 visible 클래스 추가
        if (closingSection) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.1
            });

            observer.observe(closingSection);
        }
    }

    /**
     * 슬라이더 초기화 (mapPage 내부에서 호출)
     */
    initializeSlider() {
        if (typeof window._initNearbyAttractionsSlider === 'function') {
            window._initNearbyAttractionsSlider();
        }
    }
}

// Mapper 클래스 및 인스턴스 전역 변수 할당
window.NearbyAttractionsMapper = NearbyAttractionsMapper;
window.nearbyAttractionsMapper = new NearbyAttractionsMapper();

/**
 * Layout Map Page Data Mapper
 * layout-map.html 전용 매핑 함수들을 포함한 클래스
 * BaseDataMapper를 상속받아 배치도 페이지 전용 기능 제공
 */
class LayoutMapMapper extends BaseDataMapper {
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
            const isEnabled = this.safeGet(this.data, 'homepage.customFields.pages.layoutMap.sections.0.enabled');
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
            this.mapLayoutMapContent();
            this.mapClosingSection();

            // 헤더, 푸터 매핑
            if (typeof window.headerFooterMapper !== 'undefined') {
                window.headerFooterMapper.mapHeaderFooter();
            }

            // 페이지 초기화 (main.html의 reinitializeScrollAnimations처럼)
            this.initializePage();

        } catch (error) {
            console.error('LayoutMapMapper mapPage error:', error);
        }
    }

    /**
     * SEO 메타 태그 업데이트
     */
    updateMetaTags() {
        const propertyNameEn = this.getPropertyNameEn();
        const pageTitle = document.getElementById('page-title');
        if (pageTitle) {
            pageTitle.textContent = `배치도 - ${propertyNameEn}`;
        }

        // 네이버/구글 사이트 인증 meta 태그 주입 (전 페이지 공통)
        const seo = this.safeGet(this.data, 'homepage.seo');
        if (seo) {
            this.upsertMetaByName('naver-site-verification', seo.naverSiteVerification);
            this.upsertMetaByName('google-site-verification', seo.googleSiteVerification);
        }
    }

    /**
     * Hero 섹션 매핑 (layoutMap.sections[0].hero.images[0])
     */
    mapHeroSection() {
        if (!this.isDataLoaded || !this.data.property) return;

        const heroData = this.safeGet(this.data, 'homepage.customFields.pages.layoutMap.sections.0.hero');
        if (!heroData) return;

        const heroImages = heroData.images || [];
        const heroImg = document.querySelector('[data-layout-map-hero-image]');

        if (!heroImg) return;

        if (heroImages.length > 0) {
            // url이 있는 이미지를 찾기
            const selectedImage = heroImages.find(img => img.url) || heroImages[0];
            if (selectedImage && selectedImage.url) {
                heroImg.src = selectedImage.url;
                heroImg.alt = selectedImage.description || '배치도 히어로 이미지';
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
    }

    /**
     * Intro 섹션 매핑 (layoutMap.about.title, description)
     */
    mapIntroSection() {
        if (!this.isDataLoaded || !this.data.property) return;

        const aboutData = this.safeGet(this.data, 'homepage.customFields.pages.layoutMap.sections.0.about');
        if (!aboutData) return;

        // 제목 매핑
        const titleEl = document.querySelector('[data-layout-map-about-title]');
        if (titleEl && aboutData.title) {
            titleEl.textContent = this.sanitizeText(aboutData.title);
        }

        // 설명 매핑
        const descEl = document.querySelector('[data-layout-map-about-description]');
        if (descEl && aboutData.description) {
            descEl.textContent = this.sanitizeText(aboutData.description);
        }
    }

    /**
     * 배치도 아이템 동적 생성 (이미지-설명이 교대로 추가)
     */
    generateLayoutMapItems() {
        const aboutData = this.safeGet(this.data, 'homepage.customFields.pages.layoutMap.sections.0.about');
        if (!aboutData) return;

        const images = aboutData.images || [];
        const container = document.querySelector('.layout-map-content');

        if (!container) return;

        // 기존 동적 생성된 아이템 제거 (1번째는 HTML에 있으므로 유지)
        container.querySelectorAll('[data-generated="true"]').forEach(el => el.remove());

        // 2번째 이미지부터 동적 생성
        for (let i = 1; i < images.length; i++) {
            // 이미지 아이템 생성
            const imageItem = document.createElement('div');
            imageItem.className = 'layout-map-item animate-element';
            imageItem.setAttribute('data-generated', 'true');
            imageItem.innerHTML = `<img alt="배치도" class="layout-map-image" data-layout-map-image-${i}>`;
            imageItem.style.opacity = '1';
            imageItem.style.transform = 'translateY(0)';
            container.appendChild(imageItem);

            // 설명 아이템 생성
            const descItem = document.createElement('div');
            descItem.className = 'layout-map-description-item animate-element';
            descItem.setAttribute('data-generated', 'true');
            descItem.innerHTML = `<p data-layout-map-description-${i}></p>`;
            descItem.style.opacity = '1';
            descItem.style.transform = 'translateY(0)';
            container.appendChild(descItem);
        }
    }

    /**
     * 배치도 컨텐츠 매핑 (layoutMap.about.images[0~n] 각각에 대한 설명)
     */
    mapLayoutMapContent() {
        if (!this.isDataLoaded || !this.data.property) return;

        const aboutData = this.safeGet(this.data, 'homepage.customFields.pages.layoutMap.sections.0.about');
        if (!aboutData) return;

        const images = aboutData.images || [];
        if (!Array.isArray(images)) return;

        // 필요한 아이템 생성
        this.generateLayoutMapItems();

        // 첫 번째 이미지 처리
        const imgEl = document.querySelector('[data-layout-map-image-0]');
        const imgContainer = imgEl?.closest('.layout-map-item');
        const descEl = document.querySelector('[data-layout-map-description-0]');
        const descContainer = descEl?.closest('.layout-map-description-item');

        if (images.length > 0 && images[0]) {
            if (images[0].isSelected) {
                // isSelected가 true면 이미지 표시
                if (imgContainer) imgContainer.style.display = '';

                if (imgEl && images[0].url) {
                    imgEl.src = images[0].url;
                    imgEl.alt = images[0].description || '배치도';
                    imgEl.classList.remove('empty-image-placeholder');
                }

                // 설명 매핑 - 내용이 없으면 영역 자체를 숨김
                if (descEl) {
                    if (images[0].description) {
                        const sanitized = this.sanitizeText(images[0].description);
                        descEl.innerHTML = sanitized.replace(/\n/g, '<br>');
                        if (descContainer) descContainer.style.display = '';
                    } else {
                        // 설명값이 비면 이전 텍스트 제거 + 영역 숨김
                        descEl.innerHTML = '';
                        if (descContainer) descContainer.style.display = 'none';
                    }
                }
            } else {
                // isSelected가 false면 숨김
                if (imgContainer) imgContainer.style.display = 'none';
                if (descContainer) descContainer.style.display = 'none';
            }
        }

        // 2번째 이미지부터 매핑
        for (let i = 1; i < images.length; i++) {
            const imageData = images[i];
            const imgEl = document.querySelector(`[data-layout-map-image-${i}]`);
            const imgContainer = imgEl?.closest('.layout-map-item');
            const descEl = document.querySelector(`[data-layout-map-description-${i}]`);
            const descContainer = descEl?.closest('.layout-map-description-item');

            if (imageData && imageData.isSelected) {
                // isSelected가 true면 이미지 표시
                if (imgContainer) imgContainer.style.display = '';

                if (imgEl && imageData.url) {
                    imgEl.src = imageData.url;
                    imgEl.alt = imageData.description || '배치도';
                    imgEl.classList.remove('empty-image-placeholder');
                }

                // 설명 매핑 - 내용이 없으면 영역 자체를 숨김
                if (descEl) {
                    if (imageData.description) {
                        const sanitized = this.sanitizeText(imageData.description);
                        descEl.innerHTML = sanitized.replace(/\n/g, '<br>');
                        if (descContainer) descContainer.style.display = '';
                    } else {
                        // 설명값이 비면 이전 텍스트 제거 + 영역 숨김
                        descEl.innerHTML = '';
                        if (descContainer) descContainer.style.display = 'none';
                    }
                }
            } else {
                // isSelected가 false면 숨김
                if (imgContainer) imgContainer.style.display = 'none';
                if (descContainer) descContainer.style.display = 'none';
            }
        }
    }

    /**
     * Closing 섹션 매핑 (단일 이미지 - exterior[5])
     */
    mapClosingSection() {
        if (!this.isDataLoaded || !this.data.property) return;

        const propertyNameEn = this.getPropertyNameEn();

        // Closing 이미지 매핑 (index 5 사용)
        const exteriorImages = this.getPropertyImages('property_exterior');
        const closingSection = document.querySelector('[data-layout-map-closing]');
        const closingImg = document.querySelector('[data-layout-map-closing-image]');

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
     * 페이지 초기화 (mapPage 내부에서 호출)
     */
    initializePage() {
        if (typeof window._initLayoutMap === 'function') {
            window._initLayoutMap();
        }
    }
}

// Mapper 클래스 및 인스턴스 전역 변수 할당
window.LayoutMapMapper = LayoutMapMapper;
window.layoutMapMapper = new LayoutMapMapper();

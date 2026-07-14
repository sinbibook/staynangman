/**
 * Base Data Mapper Class
 * 모든 페이지별 매퍼의 기반이 되는 클래스
 * 공통 기능과 유틸리티 메소드들을 제공
 */
class BaseDataMapper {
    constructor() {
        this.data = null;
        this.isDataLoaded = false;
        this.animationObserver = null;

        // ========================================
        // 📌 전역 JSON 파일 설정 (한 곳에서만 변경)
        // ========================================
        // 테스트할 때: 'demo-filled.json' (실제 데이터가 들어있는 파일)
        // 실제 상용할 때: 'standard-template-data.json' (빈 템플릿)

        this.dataSource = 'standard-template-data.json';  // ← 여기만 변경하면 전체 페이지 적용!
    }
    // ============================================================================
    // 🔧 CORE UTILITIES
    // ============================================================================

    /**
     * 스네이크 케이스를 카멜 케이스로 변환
     * API 데이터(snake_case) → JavaScript 표준(camelCase)
     */
    convertToCamelCase(obj) {
        if (Array.isArray(obj)) {
            return obj.map(item => this.convertToCamelCase(item));
        } else if (obj !== null && typeof obj === 'object') {
            return Object.keys(obj).reduce((result, key) => {
                // 스네이크 케이스를 카멜 케이스로 변환
                const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
                result[camelKey] = this.convertToCamelCase(obj[key]);
                return result;
            }, {});
        }
        return obj;
    }

    /**
     * JSON 데이터 로드
     */
    async loadData() {
        try {
            // 캐시 방지를 위한 타임스탬프 추가
            const timestamp = new Date().getTime();
            const response = await fetch(`./${this.dataSource}?t=${timestamp}`);
            const rawData = await response.json();

            // 스네이크 케이스를 카멜 케이스로 자동 변환
            this.data = this.convertToCamelCase(rawData);
            this.isDataLoaded = true;

            // 데이터 소스에 따라 이미지 폴백 처리 설정
            // demo-filled.json: JSON 이미지만 사용 (폴백 없음)
            // standard-template-data.json: image-helpers의 폴백 이미지 사용
            if (this.dataSource === 'demo-filled.json') {
                window.useImageHelpersFallback = false;
            } else {
                window.useImageHelpersFallback = true;
            }

            return this.data;
        } catch (error) {
            console.error(`Failed to load property data from ${this.dataSource}:`, error);
            this.isDataLoaded = false;
            throw error;
        }
    }

    /**
     * 시간 포맷팅 함수 (HH:MM:SS -> HH:MM)
     */
    formatTime(timeString) {
        if (!timeString) return null;
        const timeParts = timeString.split(':');
        if (timeParts.length >= 2) {
            return `${timeParts[0]}:${timeParts[1]}`;
        }
        return timeString;
    }

    /**
     * 데이터 안전 접근 헬퍼
     */
    safeGet(obj, path, defaultValue = null) {
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : defaultValue;
        }, obj);
    }

    /**
     * DOM 요소 안전 선택
     */
    safeSelect(selector) {
        try {
            return document.querySelector(selector);
        } catch (error) {
            console.warn(`Invalid selector: ${selector}`);
            return null;
        }
    }

    /**
     * 여러 DOM 요소 안전 선택
     */
    safeSelectAll(selector) {
        try {
            return document.querySelectorAll(selector);
        } catch (error) {
            console.warn(`Invalid selector: ${selector}`);
            return [];
        }
    }

    // ============================================================================
    // 📝 TEXT UTILITIES
    // ============================================================================

    /**
     * 값이 비어있는지 확인하는 헬퍼 메서드
     * @private
     * @param {any} value - 확인할 값
     * @returns {boolean} 비어있으면 true
     */
    _isEmptyValue(value) {
        return value === null || value === undefined || value === '';
    }

    /**
     * HTML 특수 문자를 이스케이프 처리하는 헬퍼 메서드 (XSS 방지)
     * @private
     * @param {string} text - 이스케이프할 텍스트
     * @returns {string} 이스케이프 처리된 텍스트
     */
    _escapeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * 텍스트를 정제하는 헬퍼 메서드
     * 빈 값이면 fallback 반환, 아니면 trim된 값 반환
     * @param {string} text - 정제할 텍스트
     * @param {string} fallback - 빈 값일 때 반환할 기본값
     * @returns {string} 정제된 텍스트 또는 fallback
     */
    sanitizeText(text, fallback = '') {
        if (this._isEmptyValue(text)) return fallback;
        return text.trim();
    }

    /**
     * 텍스트의 줄바꿈을 HTML <br> 태그로 변환하는 헬퍼 메서드 (XSS 안전)
     * @private
     * @param {string} text - 변환할 텍스트
     * @param {string} fallback - 빈 값일 때 반환할 기본값
     * @returns {string} 줄바꿈이 <br>로 변환된 HTML 문자열
     */
    _formatTextWithLineBreaks(text, fallback = '') {
        if (this._isEmptyValue(text)) return fallback;
        // 앞뒤 공백 제거
        const trimmedText = text.trim();
        // 먼저 HTML 특수 문자를 이스케이프 처리한 후 줄바꿈 변환
        const escapedText = this._escapeHTML(trimmedText);
        return escapedText.replace(/\n/g, '<br>');
    }

    // ============================================================================
    // 🏠 CUSTOMFIELDS HELPERS (Property & Room)
    // ============================================================================

    /**
     * 숙소 이름 가져오기 (customFields 우선, 없으면 기본값)
     */
    getPropertyName() {
        const customName = this.safeGet(this.data, 'homepage.customFields.property.name');
        return this.sanitizeText(customName, this.safeGet(this.data, 'property.name') || '숙소명');
    }

    /**
     * 숙소 영문명 가져오기 (customFields 우선, 없으면 기본값)
     */
    getPropertyNameEn() {
        const customNameEn = this.safeGet(this.data, 'homepage.customFields.property.nameEn');
        return this.sanitizeText(customNameEn, this.safeGet(this.data, 'property.nameEn') || 'PROPERTY NAME');
    }

    /**
     * 숙소 이미지 가져오기 (customFields의 카테고리별 이미지)
     * @param {string} imageCategory - 이미지 카테고리 (property_thumbnail, property_exterior, property_surrounding)
     * @returns {Array} 정렬된 이미지 배열
     */
    getPropertyImages(imageCategory) {
        const customImages = this.safeGet(this.data, 'homepage.customFields.property.images') || [];

        // 카테고리와 isSelected로 필터링
        const filteredImages = customImages.filter(img => img.category === imageCategory && img.isSelected);

        // sortOrder로 정렬
        return filteredImages.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    }

    /**
     * 객실 타입별 customFields 가져오기
     * @param {string} roomId - 객실 ID
     * @returns {Object|null} 해당 객실의 customFields 또는 null
     */
    getRoomTypeCustomFields(roomId) {
        const roomtypes = this.safeGet(this.data, 'homepage.customFields.roomtypes') || [];
        return roomtypes.find(rt => rt.id === roomId) || null;
    }

    /**
     * 객실 이름 가져오기 (customFields 우선, 없으면 기본값)
     * @param {Object} room - 객실 데이터
     * @returns {string} 객실 이름
     */
    getRoomName(room) {
        const customFields = this.getRoomTypeCustomFields(room.id);
        return this.sanitizeText(customFields?.name, room.name || '객실명');
    }

    /**
     * 객실 영문명 가져오기 (customFields 우선, 없으면 기본값)
     * @param {Object} room - 객실 데이터
     * @returns {string} 객실 영문명
     */
    getRoomNameEn(room) {
        const customFields = this.getRoomTypeCustomFields(room.id);
        return this.sanitizeText(customFields?.nameEn, room.nameEn || 'ROOM NAME');
    }

    /**
     * 객실 이미지 가져오기 (customFields의 카테고리별 이미지)
     * @param {Object} room - 객실 데이터
     * @param {string} imageCategory - 이미지 카테고리 (roomtype_interior, roomtype_exterior, roomtype_thumbnail)
     * @returns {Array} 정렬된 이미지 배열
     */
    getRoomImages(room, imageCategory) {
        const customFields = this.getRoomTypeCustomFields(room.id);
        const customImages = customFields?.images || [];

        // 카테고리와 isSelected로 필터링
        const filteredImages = customImages.filter(img => img.category === imageCategory && img.isSelected);

        // sortOrder로 정렬
        return filteredImages.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    }

    // ============================================================================
    // 🎨 ANIMATION UTILITIES
    // ============================================================================

    /**
     * 스크롤 애니메이션 재초기화
     */
    reinitializeScrollAnimations() {
        if (this.animationObserver) {
            this.animationObserver.disconnect();
        }

        if (window.initScrollAnimations) {
            window.initScrollAnimations();
        } else {
            this.initDefaultScrollAnimations();
        }
    }

    /**
     * 기본 스크롤 애니메이션 초기화
     */
    initDefaultScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        this.animationObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (entry.target.classList.contains('gallery-item')) {
                        const galleryItems = Array.from(entry.target.parentElement.children);
                        const index = galleryItems.indexOf(entry.target);
                        const delays = [0, 0.2, 0.4, 0.6];

                        setTimeout(() => {
                            entry.target.classList.add('animate');
                        }, (delays[index] || 0) * 1000);
                    } else {
                        entry.target.classList.add('animate');
                    }
                }
            });
        }, observerOptions);

        // 애니메이션 가능한 요소들 관찰 시작
        this.safeSelectAll('.fade-in-up, .fade-in-scale, .gallery-item, .signature-item').forEach(el => {
            this.animationObserver.observe(el);
        });
    }

    // ============================================================================
    // 🏢 BUSINESS INFO UTILITIES
    // ============================================================================

    /**
     * E-commerce registration 매핑
     */
    mapEcommerceRegistration() {
        if (!this.isDataLoaded) return;

        const ecommerceNumber = this.safeGet(this.data, 'property.businessInfo.eCommerceRegistrationNumber');

        if (!ecommerceNumber) return;

        // 통신판매업신고번호 매핑
        const ecommerceElement = this.safeSelect('.ecommerce-registration');
        if (ecommerceElement) {
            ecommerceElement.textContent = `통신판매업신고번호 : ${ecommerceNumber}`;
        }
    }

    // ============================================================================
    // 📝 META & SEO UTILITIES
    // ============================================================================

    /**
     * 메타 태그 업데이트 (homepage.seo + 페이지별 SEO 병합)
     * @param {Object} pageSEO - 페이지별 SEO 데이터 (선택사항, 전역 SEO보다 우선 적용)
     */
    upsertMetaByName(name, content) {
        if (!content) return;
        let meta = document.head.querySelector(`meta[name="${name}"]`);
        if (!meta) {
            meta = document.createElement('meta');
            meta.setAttribute('name', name);
            document.head.appendChild(meta);
        }
        meta.setAttribute('content', content);
    }

    updateMetaTags(pageSEO = null) {
        // homepage.seo 글로벌 SEO 데이터 적용
        const globalSEO = this.safeGet(this.data, 'homepage.seo') || {};
        // 전역 SEO와 페이지별 SEO를 병합합니다. 페이지별 설정이 우선됩니다.
        const finalSEO = { ...globalSEO, ...(pageSEO || {}) };
        if (Object.keys(finalSEO).length > 0) {
            this.updateSEOInfo(finalSEO);
        }
    }

    /**
     * SEO 정보 업데이트
     */
    updateSEOInfo(seo) {
        if (!seo) return;

        if (seo.title) {
            const title = this.safeSelect('title');
            if (title) title.textContent = seo.title;

            // OG Title도 같이 업데이트
            const ogTitle = this.safeSelect('meta[property="og:title"]');
            if (ogTitle) ogTitle.setAttribute('content', seo.title);
        }

        if (seo.description) {
            const metaDescription = this.safeSelect('meta[name="description"]');
            if (metaDescription) metaDescription.setAttribute('content', seo.description);

            // OG Description도 같이 업데이트
            const ogDescription = this.safeSelect('meta[property="og:description"]');
            if (ogDescription) ogDescription.setAttribute('content', seo.description);
        }

        if (seo.keywords) {
            const metaKeywords = this.safeSelect('meta[name="keywords"]');
            if (metaKeywords) metaKeywords.setAttribute('content', seo.keywords);
        }

        // OG URL은 현재 페이지 URL로 설정
        const ogUrl = this.safeSelect('meta[property="og:url"]');
        if (ogUrl) ogUrl.setAttribute('content', window.location.href);

        // 네이버/구글 사이트 인증 meta 태그 주입 (값 있으면 생성/갱신)
        this.upsertMetaByName('naver-site-verification', seo.naverSiteVerification);
        this.upsertMetaByName('google-site-verification', seo.googleSiteVerification);
    }

    /**
     * 기본 OG 이미지 가져오기 (로고 이미지 사용)
     */
    getDefaultOGImage() {
        if (!this.isDataLoaded) return null;

        const logoImages = this.safeGet(this.data, 'homepage.images.0.logo');
        if (logoImages && logoImages.length > 0 && logoImages[0]?.url) {
            return logoImages[0].url;
        }

        return null;
    }

    // ============================================================================
    // 🔄 TEMPLATE METHODS (서브클래스에서 구현)
    // ============================================================================

    /**
     * 페이지별 매핑 실행 (서브클래스에서 오버라이드)
     */
    async mapPage() {
        throw new Error('mapPage() method must be implemented by subclass');
    }

    /**
     * 페이지별 초기화 (서브클래스에서 오버라이드)
     */
    async initialize() {
        try {
            await this.loadData();
            await this.mapPage();
        } catch (error) {
            console.error('Failed to initialize mapper:', error);
        }
    }

}

// ES6 모듈 및 글로벌 노출
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BaseDataMapper;
} else {
    window.BaseDataMapper = BaseDataMapper;
}

/**
 * Directions Page Data Mapper
 * directions.html 전용 매핑 함수들을 포함한 클래스
 * BaseDataMapper를 상속받아 오시는길 페이지 전용 기능 제공
 */
class DirectionsMapper extends BaseDataMapper {
    // Kakao Map 설정 상수
    static KAKAO_MAP_ZOOM_LEVEL = 5;
    static SDK_WAIT_INTERVAL = 100; // ms

    constructor() {
        super();
    }

    // ============================================================================
    // 🗺️ DIRECTIONS PAGE MAPPINGS
    // ============================================================================

    /**
     * Hero 이미지 매핑 (data-main-hero-img)
     */
    mapHeroImage() {
        if (!this.isDataLoaded) return;

        const heroImg = this.safeSelect('[data-main-hero-img]');
        if (!heroImg) return;

        const isDemo = this.dataSource === 'demo-filled.json';
        const directionsData = this.safeGet(this.data, 'homepage.customFields.pages.directions.sections.0.hero');

        // isSelected: true인 이미지만 필터링하고 sortOrder로 정렬
        const selectedImages = directionsData?.images
            ? directionsData.images
                .filter(img => img.isSelected === true)
                .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
            : [];

        if (selectedImages.length > 0) {
            heroImg.src = selectedImages[0].url;
            heroImg.alt = this.sanitizeText(selectedImages[0].description, '오시는길 이미지');
            heroImg.classList.remove('empty-image-placeholder');
        } else if (isDemo) {
            // demo 모드: fallback 이미지
            heroImg.src = './images/hero4.jpg';
            heroImg.alt = '오시는길 이미지';
            heroImg.classList.remove('empty-image-placeholder');
        } else {
            // standard-template-data.json: empty-image placeholder
            heroImg.src = ImageHelpers.EMPTY_IMAGE_WITH_ICON;
            heroImg.alt = '이미지 없음';
            heroImg.classList.add('empty-image-placeholder');
        }
    }

    /**
     * Property Name Korean 매핑 (customFields 우선)
     * customFields.property.name → [data-main-property-name-kr]
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
     * customFields.property.nameEn → [data-main-property-name-en]
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
     * Location Info 섹션 매핑 (타이틀, 주소)
     */
    mapLocationInfo() {
        if (!this.isDataLoaded || !this.data.property) return;

        const property = this.data.property;
        const heroData = this.safeGet(this.data, 'homepage.customFields.pages.directions.sections.0.hero');

        // 타이틀 매핑 - customFields hero.title 사용
        const titleElement = this.safeSelect('[data-directions-title]');
        if (titleElement) {
            titleElement.textContent = this.sanitizeText(heroData?.title, '오시는길 히어로 타이틀');
        }

        // 주소 매핑 - 새로운 구조 (property.location.address)
        const addressElement = this.safeSelect('[data-directions-address]');
        if (addressElement) {
            const location = this.safeGet(property, 'location');
            const address = location?.address || property?.address; // 하위 호환성 유지
            addressElement.textContent = this.sanitizeText(address, '숙소 주소');
        }
    }

    /**
     * Notes 섹션 매핑 (안내사항) - location-note-section 요소 처리
     */
    mapNotesSection() {
        if (!this.isDataLoaded) return;

        const directionsData = this.safeGet(this.data, 'homepage.customFields.pages.directions.sections.0');
        const notesElement = this.safeSelect('[data-directions-notes]');

        if (!notesElement) return;

        // notice 데이터가 있으면 제목과 설명을 분리해서 표시
        if (directionsData?.notice?.title && directionsData?.notice?.description) {
            const title = this.sanitizeText(directionsData.notice.title);
            const description = this.sanitizeText(directionsData.notice.description).replace(/\n/g, '<br>');

            notesElement.innerHTML = `
                <div class="note-title">${title}</div>
                <div class="note-content">${description}</div>
            `;
            notesElement.style.display = 'flex';
        } else {
            // 데이터가 없으면 숨김
            notesElement.style.display = 'none';
        }
    }

    /**
     * Full Banner 섹션 매핑 (customFields 우선)
     * customFields.property.images (category: property_exterior) 첫 번째 이미지 사용
     */
    mapFullBanner() {
        if (!this.isDataLoaded) return;

        const banner = this.safeSelect('[data-main-banner]');
        if (!banner) return;

        const isDemo = this.dataSource === 'demo-filled.json';

        // customFields에서 property_exterior 카테고리 이미지 가져오기
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
     * 카카오맵 초기화 및 표시
     */
    initKakaoMap() {
        if (!this.isDataLoaded || !this.data.property) {
            return;
        }

        const property = this.data.property;
        const mapContainer = document.getElementById('kakao-map');
        const location = this.safeGet(property, 'location');

        // 새로운 구조 (property.location.latitude/longitude) 또는 기존 구조 지원
        const latitude = location?.latitude || property.latitude;
        const longitude = location?.longitude || property.longitude;

        if (!mapContainer || !latitude || !longitude) {
            return;
        }

        // 지도 생성 함수
        const createMap = () => {
            try {
                // 검색 쿼리 및 URL 생성 (한 번만) - 새로운 구조 지원
                const address = location?.address || property.address;
                const searchQuery = address || this.getPropertyName() || '선택한 위치';
                const kakaoMapUrl = `https://map.kakao.com/?q=${encodeURIComponent(searchQuery)}`;
                const openKakaoMap = () => window.open(kakaoMapUrl, '_blank');

                // 지도 중심 좌표
                const mapCenter = new kakao.maps.LatLng(latitude, longitude);

                // 지도 옵션
                const mapOptions = {
                    center: mapCenter,
                    level: DirectionsMapper.KAKAO_MAP_ZOOM_LEVEL,
                    draggable: false,
                    scrollwheel: false,
                    disableDoubleClick: true,
                    disableDoubleClickZoom: true
                };

                // 지도 생성
                const map = new kakao.maps.Map(mapContainer, mapOptions);
                map.setZoomable(false);

                // 마커 생성 및 클릭 이벤트
                const marker = new kakao.maps.Marker({
                    position: mapCenter,
                    map: map
                });
                kakao.maps.event.addListener(marker, 'click', openKakaoMap);

                // 인포윈도우 콘텐츠 DOM 생성 및 이벤트 핸들러 연결
                const infowindowContent = document.createElement('div');
                infowindowContent.style.cssText = 'padding:5px; font-size:14px; cursor:pointer;';
                infowindowContent.innerHTML = `${this.getPropertyName()}<br/><small style="color:#666;">클릭하면 카카오맵으로 이동</small>`;
                infowindowContent.addEventListener('click', openKakaoMap);

                const infowindow = new kakao.maps.InfoWindow({
                    content: infowindowContent
                });
                infowindow.open(map, marker);
            } catch (error) {
                console.error('DirectionsMapper: 카카오맵 생성 오류:', error);
            }
        };

        // SDK 로드 확인 및 지도 생성
        const checkSdkAndLoad = (retryCount = 0) => {
            const MAX_RETRIES = 20; // 20 * 100ms = 2초
            if (window.kakao && window.kakao.maps && window.kakao.maps.load) {
                // kakao.maps.load() 공식 API 사용
                window.kakao.maps.load(createMap);
            } else if (retryCount < MAX_RETRIES) {
                // SDK가 아직 로드되지 않았으면 대기
                setTimeout(() => checkSdkAndLoad(retryCount + 1), DirectionsMapper.SDK_WAIT_INTERVAL);
            } else {
                console.error('DirectionsMapper: 카카오맵 SDK 로드 실패 (timeout)');
            }
        };

        checkSdkAndLoad();
    }

    // ============================================================================
    // 🔄 TEMPLATE METHODS IMPLEMENTATION
    // ============================================================================

    /**
     * Directions 페이지 전체 매핑 실행
     */
    async mapPage() {
        if (!this.isDataLoaded) {
            return;
        }

        // 순차적으로 각 섹션 매핑
        this.mapPropertyNameKr();
        this.mapPropertyNameEn();
        this.mapHeroImage();
        this.mapLocationInfo();
        this.mapNotesSection();
        this.mapFullBanner();
        this.initKakaoMap();

        // 메타 태그 업데이트 (customFields 우선)
        const propertyName = this.getPropertyName();
        const directionsData = this.safeGet(this.data, 'homepage.customFields.pages.directions.sections.0.hero');
        this.updateMetaTags({
            title: `오시는길 - ${propertyName}`,
            description: directionsData?.description || this.data.property?.description || 'SEO 설명'
        });

        // OG 이미지 업데이트
        this.updateOGImage(directionsData);

        // E-commerce registration 매핑
        this.mapEcommerceRegistration();

        // 페이지 스크립트 재초기화
        this.reinitializePageScripts();
    }

    /**
     * 페이지 스크립트 재초기화 (directions.js 함수들 호출)
     */
    reinitializePageScripts() {
        // location notes 초기화 (directions.js에서 정의)
        if (typeof window.initializeLocationNotes === 'function') {
            window.initializeLocationNotes();
        }

        // scroll animations 초기화 (directions.js에서 정의)
        if (typeof window.setupScrollAnimations === 'function') {
            window.setupScrollAnimations();
        }
    }

    /**
     * OG 이미지 업데이트 (directions hero 이미지 사용, 없으면 로고)
     * @param {Object} directionsData - directions hero 섹션 데이터
     */
    updateOGImage(directionsData) {
        if (!this.isDataLoaded) return;

        const ogImage = this.safeSelect('meta[property="og:image"]');
        if (!ogImage) return;

        // 우선순위: hero 이미지 > 로고 이미지
        if (directionsData?.images && directionsData.images.length > 0 && directionsData.images[0]?.url) {
            ogImage.setAttribute('content', directionsData.images[0].url);
        } else {
            const defaultImage = this.getDefaultOGImage();
            if (defaultImage) {
                ogImage.setAttribute('content', defaultImage);
            }
        }
    }
}

// ============================================================================
// 🚀 INITIALIZATION
// ============================================================================

// 페이지 로드 시 자동 초기화 (로컬 환경용, iframe 아닐 때만)
if (typeof window !== 'undefined' && window.parent === window) {
    window.addEventListener('DOMContentLoaded', async () => {
        const mapper = new DirectionsMapper();
        await mapper.initialize();
    });
}

// ES6 모듈 및 글로벌 노출
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DirectionsMapper;
} else {
    window.DirectionsMapper = DirectionsMapper;
}
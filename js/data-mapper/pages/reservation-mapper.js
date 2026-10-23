/**
 * Reservation Page Data Mapper
 * reservation.html 전용 매핑 함수들을 포함한 클래스
 * BaseDataMapper를 상속받아 예약 페이지 전용 기능 제공
 */
class ReservationMapper extends BaseDataMapper {
    constructor() {
        super();
    }

    // ============================================================================
    // 📅 RESERVATION PAGE SPECIFIC MAPPINGS
    // ============================================================================

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
     * Hero 이미지 매핑
     * homepage.customFields.pages.reservation.sections[0].hero.images → [data-main-hero-img]
     */
    mapHeroImage() {
        if (!this.isDataLoaded) return;

        const heroData = this.safeGet(this.data, 'homepage.customFields.pages.reservation.sections.0.hero');
        const heroImg = this.safeSelect('[data-main-hero-img]');
        const isDemo = this.dataSource === 'demo-filled.json';

        if (!heroImg) return;

        // isSelected: true인 이미지만 필터링하고 sortOrder로 정렬
        const selectedImages = heroData?.images
            ? heroData.images
                .filter(img => img.isSelected === true)
                .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
            : [];

        if (selectedImages.length > 0) {
            heroImg.src = selectedImages[0].url;
            heroImg.alt = this.sanitizeText(selectedImages[0].description, '예약안내 이미지');
            heroImg.classList.remove('empty-image-placeholder');
        } else if (isDemo) {
            heroImg.src = './images/hero5.jpg';
            heroImg.alt = '예약안내 이미지';
            heroImg.classList.remove('empty-image-placeholder');
        } else {
            heroImg.src = ImageHelpers.EMPTY_IMAGE_WITH_ICON;
            heroImg.alt = '이미지 없음';
            heroImg.classList.add('empty-image-placeholder');
        }
    }

    /**
     * 예약 정보 섹션 매핑
     */
    mapReservationInfoSection() {
        if (!this.isDataLoaded || !this.data.property) return;

        const reservationData = this.safeGet(this.data, 'homepage.customFields.pages.reservation.sections.0');

        // CUSTOM FIELD 제목 매핑 (about.title)
        // 내용 없으면 해당 영역 숨김 (둘 다 없으면 래퍼까지 숨김)
        const title = this.sanitizeText(reservationData?.about?.title);
        const reservationTitle = this.safeSelect('[data-reservation-title]');
        if (reservationTitle) {
            reservationTitle.textContent = title;
            const titleSection = reservationTitle.closest('.reservation-title-section') || reservationTitle;
            titleSection.style.display = title ? '' : 'none';
        }

        // CUSTOM FIELD 설명 매핑 (about.description)
        const description = this.sanitizeText(reservationData?.about?.description);
        const reservationDescription = this.safeSelect('[data-reservation-description]');
        if (reservationDescription) {
            reservationDescription.innerHTML = this._formatTextWithLineBreaks(description);
            const descSection = reservationDescription.closest('.reservation-description-section') || reservationDescription;
            descSection.style.display = description ? '' : 'none';
        }

        const contentWrapper = this.safeSelect('.reservation-content-wrapper');
        if (contentWrapper) {
            contentWrapper.style.display = (title || description) ? '' : 'none';
        }
    }


    /**
     * 텍스트 컨텐츠 매핑 헬퍼 메서드
     * @param {string} selector - DOM 선택자
     * @param {string} propertyKey - property 객체의 키
     * @private
     */
    _mapTextContent(selector, propertyKey) {
        if (!this.isDataLoaded || !this.data.property) return;

        const property = this.data.property;
        const element = this.safeSelect(selector);
        const textContent = property[propertyKey];

        if (element && textContent) {
            element.innerHTML = this._formatTextWithLineBreaks(textContent);
        }
    }

    /**
     * 이용안내 섹션 매핑 (data-usage-guide)
     */
    mapUsageSection() {
        this._mapTextContent('[data-usage-guide]', 'usageGuide');
    }

    /**
     * 예약안내 섹션 매핑 (data-reservation-guide)
     */
    mapReservationGuideSection() {
        this._mapTextContent('[data-reservation-guide]', 'reservationGuide');
    }

    /**
     * 입/퇴실 안내 섹션 매핑
     */
    mapCheckInOutSection() {
        if (!this.isDataLoaded || !this.data.property) return;

        const property = this.data.property;

        // 체크인 시간 매핑
        const checkinTime = this.safeSelect('[data-checkin-time]');
        if (checkinTime && property.checkin) {
            checkinTime.textContent = this.formatTime(property.checkin);
        }

        // 체크아웃 시간 매핑
        const checkoutTime = this.safeSelect('[data-checkout-time]');
        if (checkoutTime && property.checkout) {
            checkoutTime.textContent = this.formatTime(property.checkout);
        }

        // 운영정보 텍스트 매핑
        const operationInfo = this.safeSelect('[data-operation-info]');
        if (operationInfo && property.checkInOutInfo) {
            operationInfo.innerHTML = this._formatTextWithLineBreaks(property.checkInOutInfo);
        }
    }

    /**
     * 환불규정 섹션 매핑 (data-refund-notes)
     */
    mapRefundSection() {
        if (!this.isDataLoaded) return;

        const refundPolicies = this.safeGet(this.data, 'property.refundPolicies');
        const refundNotesElement = this.safeSelect('[data-refund-notes]');
        const refundTextSection = this.safeSelect('.refund-text-section');

        // 기본 환불 안내 텍스트 설정 (refundSettings에서 가져오기)
        const refundSettings = this.safeGet(this.data, 'property.refundSettings');
        if (refundNotesElement && refundSettings?.customerRefundNotice) {
            refundNotesElement.innerHTML = refundSettings.customerRefundNotice;
            if (refundTextSection) refundTextSection.style.display = '';
        }

        // property.refundPolicies를 환불 테이블로 매핑
        if (refundPolicies && Array.isArray(refundPolicies)) {
            this.mapRefundPoliciesTable(refundPolicies);
        }
    }

    /**
     * 환불 정책 테이블 매핑
     * @param {Array} refundPolicies - 환불 정책 배열
     */
    mapRefundPoliciesTable(refundPolicies) {
        const tableBody = this.safeSelect('.refund-table-body');
        if (!tableBody || !refundPolicies) return;

        tableBody.innerHTML = '';

        // 환불 정책 배열을 테이블 행으로 변환
        refundPolicies.forEach(policy => {
            if (policy.refundProcessingDays !== undefined && policy.refundRate !== undefined) {
                const row = document.createElement('tr');

                // 취소 시점 텍스트 생성
                let cancelTimeText = '';
                if (policy.refundProcessingDays === 0) {
                    cancelTimeText = '당일 취소';
                } else {
                    cancelTimeText = `이용일 ${policy.refundProcessingDays}일 전`;
                }

                // 환불율 텍스트 생성
                const refundRateText = policy.refundRate === 0 ? '환불 불가' : `${policy.refundRate}% 환불`;

                row.innerHTML = `
                    <td>${cancelTimeText}</td>
                    <td class="${policy.refundRate === 0 ? 'no-refund' : ''}">${refundRateText}</td>
                `;
                tableBody.appendChild(row);
            }
        });
    }

    /**
     * Full Banner 섹션 매핑 (customFields 우선)
     * customFields.property.images (category: property_exterior) 첫 번째 이미지 사용
     */
    mapFullBanner() {
        if (!this.isDataLoaded) return;

        const isDemo = this.dataSource === 'demo-filled.json';
        const bannerElement = this.safeSelect('[data-main-banner]');

        if (!bannerElement) {
            return;
        }

        // customFields에서 property_exterior 카테고리 이미지 가져오기
        const exteriorImages = this.getPropertyImages('property_exterior');
        const targetImage = exteriorImages[0];

        // 기존 placeholder img 제거
        const existingPlaceholder = bannerElement.querySelector('.banner-placeholder-img');
        if (existingPlaceholder) {
            existingPlaceholder.remove();
        }

        if (targetImage && targetImage.url) {
            // 배경 이미지 설정
            bannerElement.style.backgroundImage = `url('${targetImage.url}')`;
            bannerElement.classList.remove('empty-image-placeholder');
        } else if (isDemo) {
            // demo 모드: fallback 이미지
            bannerElement.style.backgroundImage = `url('./images/exterior.jpg')`;
            bannerElement.classList.remove('empty-image-placeholder');
        } else {
            // standard-template-data.json: empty-image placeholder (img 요소 사용)
            bannerElement.style.backgroundImage = 'none';
            bannerElement.classList.add('empty-image-placeholder');

            const placeholderImg = document.createElement('img');
            placeholderImg.src = ImageHelpers.EMPTY_IMAGE_WITH_ICON;
            placeholderImg.alt = '이미지 없음';
            placeholderImg.className = 'banner-placeholder-img empty-image-placeholder';
            placeholderImg.style.cssText = 'width: 100%; height: 100%; position: absolute; top: 0; left: 0;';
            bannerElement.style.position = 'relative';
            bannerElement.insertBefore(placeholderImg, bannerElement.firstChild);
        }

        // 공통 배경 스타일 (이미지가 있을 때만)
        if (targetImage?.url || isDemo) {
            bannerElement.style.backgroundSize = 'cover';
            bannerElement.style.backgroundPosition = 'center';
            bannerElement.style.backgroundRepeat = 'no-repeat';
        }

        // 애니메이션 클래스 추가 (visible 클래스로 fade-in 효과)
        setTimeout(() => {
            bannerElement.classList.add('visible');
        }, 100);

        // 숙소 영문명 매핑 (customFields 우선, full-banner 내부)
        const propertyNameEn = this.getPropertyNameEn();
        const closingPropertyName = bannerElement.querySelector('[data-closing-property-name]');
        if (closingPropertyName) {
            closingPropertyName.textContent = propertyNameEn;
        }
    }

    // ============================================================================
    // 🔄 TEMPLATE METHODS IMPLEMENTATION
    // ============================================================================

    /**
     * Reservation 페이지 전체 매핑 실행
     */
    async mapPage() {
        if (!this.isDataLoaded) {
            return;
        }

        // 순차적으로 각 섹션 매핑
        this.mapPropertyNameKr();
        this.mapPropertyNameEn();
        this.mapHeroImage();
        this.mapReservationInfoSection();
        this.mapUsageSection();
        this.mapReservationGuideSection();
        this.mapCheckInOutSection();
        this.mapRefundSection();
        this.mapFullBanner();

        // 메타 태그 업데이트 (customFields 우선, 페이지별 SEO 적용)
        const propertyName = this.getPropertyName();
        const reservationData = this.safeGet(this.data, 'homepage.customFields.pages.reservation.sections.0.hero');
        const pageSEO = {
            title: `예약안내 - ${propertyName}`,
            description: reservationData?.description || this.data.property?.description || 'SEO 설명'
        };
        this.updateMetaTags(pageSEO);

        // OG 이미지 업데이트 (hero 이미지 사용)
        this.updateOGImage(reservationData);

        // E-commerce registration 매핑
        this.mapEcommerceRegistration();
    }

    /**
     * OG 이미지 업데이트 (reservation hero 이미지 사용, 없으면 로고)
     * @param {Object} reservationData - reservation hero 섹션 데이터
     */
    updateOGImage(reservationData) {
        if (!this.isDataLoaded) return;

        const ogImage = this.safeSelect('meta[property="og:image"]');
        if (!ogImage) return;

        // 우선순위: hero 이미지 > 로고 이미지
        if (reservationData?.images && reservationData.images.length > 0 && reservationData.images[0]?.url) {
            ogImage.setAttribute('content', reservationData.images[0].url);
        } else {
            const defaultImage = this.getDefaultOGImage();
            if (defaultImage) {
                ogImage.setAttribute('content', defaultImage);
            }
        }
    }
}

// ES6 모듈 및 글로벌 노출
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ReservationMapper;
} else {
    window.ReservationMapper = ReservationMapper;
}

// iframe 내부가 아닌 경우에만 자동 초기화 (preview-handler와 충돌 방지)
if (typeof window !== 'undefined' && window.parent === window) {
    document.addEventListener('DOMContentLoaded', async () => {
        const reservationMapper = new ReservationMapper();
        try {
            await reservationMapper.loadData();
            await reservationMapper.mapPage();
        } catch (error) {
            console.error('ReservationMapper initialization error:', error);
        }
    });
}

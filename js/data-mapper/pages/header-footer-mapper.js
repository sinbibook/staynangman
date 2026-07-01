/**
 * Header & Footer Data Mapper
 * header.html, footer.html 전용 매핑 함수들을 포함한 클래스
 * BaseDataMapper를 상속받아 header/footer 공통 기능 제공
 */
class HeaderFooterMapper extends BaseDataMapper {
    constructor() {
        super();
    }

    // ============================================================================
    // 🏠 HEADER MAPPINGS
    // ============================================================================

    /**
     * 로고 URL 추출 헬퍼 메서드
     * homepage.images[0].logo 또는 property.images[0].logo에서 isSelected인 이미지 URL 반환
     */
    _getLogoUrl() {
        let logoUrl = null;

        // 우선순위 1: homepage.images[0].logo 배열
        const homepageLogo = this.data?.homepage?.images?.[0]?.logo;
        if (homepageLogo && Array.isArray(homepageLogo) && homepageLogo.length > 0) {
            const selectedLogo = homepageLogo.find(img => img.isSelected) || homepageLogo[0];
            logoUrl = selectedLogo?.url;
        }

        // 우선순위 2: property.images[0].logo 배열 (fallback)
        if (!logoUrl) {
            const propertyLogo = this.data?.property?.images?.[0]?.logo;
            if (propertyLogo && Array.isArray(propertyLogo) && propertyLogo.length > 0) {
                const selectedLogo = propertyLogo.find(img => img.isSelected) || propertyLogo[0];
                logoUrl = selectedLogo?.url;
            }
        }

        return logoUrl;
    }

    /**
     * Favicon 매핑 (homepage.images[0].logo 데이터 사용)
     */
    mapFavicon() {
        if (!this.isDataLoaded) return;

        const logoUrl = this._getLogoUrl();

        if (logoUrl) {
            // 기존 favicon 링크 찾기
            let faviconLink = document.querySelector('link[rel="icon"]');

            // 없으면 새로 생성
            if (!faviconLink) {
                faviconLink = document.createElement('link');
                faviconLink.rel = 'icon';
                document.head.appendChild(faviconLink);
            }

            // favicon URL 설정
            faviconLink.href = logoUrl;
        }
    }

    /**
     * Header 로고 매핑 (텍스트 및 이미지)
     */
    mapHeaderLogo() {
        if (!this.isDataLoaded || !this.data.property) return;

        const property = this.data.property;

        // Header 로고 텍스트 매핑 (customFields 우선)
        const propertyNameEn = this.getPropertyNameEn();
        const logoTextElements = this.safeSelectAll('[data-logo-text]');
        logoTextElements.forEach(logoText => {
            if (logoText) {
                logoText.textContent = propertyNameEn;
            }
        });

        // Header 로고 이미지 매핑 (data-logo 속성 사용)
        const logoImage = this.safeSelect('[data-logo]');
        if (logoImage) {
            const logoUrl = this._getLogoUrl();

            if (logoUrl) {
                logoImage.onerror = () => {};
                logoImage.src = logoUrl;
                logoImage.alt = this.getPropertyName();
            }
        }
    }

    /**
     * Header 네비게이션 메뉴 동적 생성 (객실, 시설 메뉴 등)
     */
    mapHeaderNavigation() {
        if (!this.isDataLoaded) return;

        // 메인 메뉴 아이템 클릭 핸들러 설정
        this.mapMainMenuItems();

        // 객실 메뉴 동적 생성
        this.mapRoomMenuItems();

        // 시설 메뉴 동적 생성
        this.mapFacilityMenuItems();

        // 예약 버튼에 realtimeBookingId 매핑
        this.mapReservationButtons();
    }

    /**
     * 예약 버튼에 realtimeBookingId 매핑 및 클릭 이벤트 설정
     */
    mapReservationButtons() {
        if (!this.isDataLoaded || !this.data.property) {
            return;
        }

        // realtimeBookingId 찾기 (전체 URL 형태로 저장됨)
        const realtimeBookingId = this.data.property.realtimeBookingId;

        if (realtimeBookingId) {
            // 모든 BOOK NOW 버튼에 클릭 이벤트 설정
            const reservationButtons = document.querySelectorAll('[data-booking-engine]');
            reservationButtons.forEach(button => {
                button.setAttribute('data-realtime-booking-id', realtimeBookingId);
                button.onclick = () => {
                    window.open(realtimeBookingId, '_blank');
                };
            });
        }

        // ybsId 찾기
        const ybsId = this.data.property.ybsId;
        const ybsButtons = document.querySelectorAll('[data-ybs-booking]');

        if (ybsId && ybsId.trim() !== '') {
            // YBS 예약 URL 생성
            const ybsUrl = `https://rev.yapen.co.kr/external?ypIdx=${ybsId}`;

            // 모든 YBS 버튼에 클릭 이벤트 설정 및 표시
            ybsButtons.forEach(button => {
                button.setAttribute('data-ybs-id', ybsId);
                // 데스크톱/모바일 모두 flex로 표시
                button.style.display = 'flex';
                button.onclick = () => {
                    window.open(ybsUrl, '_blank');
                };
            });
        } else {
            // ybsId가 없거나 빈 문자열이면 YBS 버튼 숨김 (CSS 기본값 유지)
            ybsButtons.forEach(button => {
                button.style.display = 'none';
            });
        }
    }

    /**
     * 메인 메뉴 아이템 클릭 핸들러 설정
     */
    mapMainMenuItems() {
        // Spaces 메뉴 - 첫 번째 객실로 이동
        const spacesMenu = document.querySelector('[data-room-link]');
        if (spacesMenu) {
            const rooms = this.safeGet(this.data, 'rooms');
            if (rooms && rooms.length > 0) {
                spacesMenu.onclick = () => {
                    window.location.href = `room.html?id=${rooms[0].id}`;
                };
            }
        }

        // Specials 메뉴 - 첫 번째 시설로 이동
        const specialsMenu = document.querySelector('[data-facility-link]');
        if (specialsMenu) {
            const facilities = this.safeGet(this.data, 'property.facilities');
            if (facilities && facilities.length > 0) {
                specialsMenu.onclick = () => {
                    window.location.href = `facility.html?id=${facilities[0].id}`;
                };
            }
        }

        // About 섹션에 동적 메뉴 추가 (enabled가 true인 페이지만)
        this.mapAboutMenuItems();
    }

    /**
     * About 메뉴에 layout-map, nearby-attractions 동적 추가
     */
    mapAboutMenuItems() {
        // About 메뉴 찾기 (첫 번째 dropdown-section)
        const dropdownSections = document.querySelectorAll('.dropdown-section');
        let aboutMenuList = null;

        for (const section of dropdownSections) {
            const title = section.querySelector('.dropdown-section-title');
            if (title && title.textContent.includes('About')) {
                aboutMenuList = section.querySelector('.dropdown-section-list');
                break;
            }
        }

        if (!aboutMenuList) return;

        const customPages = [
            {
                name: '주변 관광지',
                id: 'nearby-attractions',
                path: 'nearby-attractions.html',
                enabled: this.safeGet(this.data, 'homepage.customFields.pages.nearbyAttractions.sections.0.enabled')
            },
            {
                name: '숙소 배치도',
                id: 'layout-map',
                path: 'layout-map.html',
                enabled: this.safeGet(this.data, 'homepage.customFields.pages.layoutMap.sections.0.enabled')
            }
        ];

        // enabled가 true인 페이지만 메뉴에 추가
        customPages.forEach(page => {
            if (page.enabled) {
                const existingItem = aboutMenuList.querySelector(`[data-menu-id="${page.id}"]`);
                if (!existingItem) {
                    const li = document.createElement('li');
                    li.setAttribute('data-menu-id', page.id);
                    li.innerHTML = `<a onclick="navigateTo('${page.id}')">${page.name}</a>`;
                    aboutMenuList.appendChild(li);
                }
            }
        });
    }

    /**
     * 헬퍼 메서드: 메뉴 아이템들을 동적으로 생성
     * @param {Array} items - 메뉴 아이템 데이터 배열
     * @param {string} classPrefix - CSS 클래스 접두사 (sub-spaces-, sub-specials- 등)
     * @param {string} mobileContainerId - 모바일 메뉴 컨테이너 ID
     * @param {string} urlTemplate - URL 템플릿 (room.html, facility.html 등)
     * @param {string} defaultNamePrefix - 기본 이름 접두사 (객실, 시설 등)
     * @param {number} maxItems - 최대 표시할 아이템 수 (기본: 무제한)
     * @param {Function} customClickHandler - 커스텀 클릭 핸들러 (선택사항)
     */
    _createMenuItems(items, classPrefix, mobileContainerId, urlTemplate, defaultNamePrefix, maxItems = null, customClickHandler = null) {
        if (!items || !Array.isArray(items)) return;

        // Desktop 서브메뉴 업데이트
        const desktopMenu = document.querySelector('.sub-menus');
        if (desktopMenu) {
            // 기존 메뉴 아이템들 제거
            const existingItems = desktopMenu.querySelectorAll(`[class*="${classPrefix}"]`);
            existingItems.forEach(item => item.remove());

            // 메뉴 카테고리별 left 위치 정의
            const leftPositions = {
                'sub-about-': 15,
                'sub-spaces-': 121,
                'sub-specials-': 228,
                'sub-reservation-': 332
            };

            // 현재 카테고리의 left 위치 가져오기
            const leftPosition = leftPositions[classPrefix] || 0;

            // 새로운 메뉴 아이템들 생성
            const displayItems = maxItems ? items.slice(0, maxItems) : items;
            displayItems.forEach((item, index) => {
                const menuItem = document.createElement('div');
                menuItem.className = `sub-menu-item ${classPrefix}${index + 1}`;
                menuItem.textContent = item.name || `${defaultNamePrefix}${index + 1}`;

                // 동적으로 위치 계산 (첫 번째: 29px, 그 다음부터 34px씩 증가)
                const topPosition = 29 + (index * 34);
                menuItem.style.cssText = `left: ${leftPosition}px; top: ${topPosition}px;`;

                // 클릭 이벤트 추가
                menuItem.addEventListener('click', () => {
                    if (customClickHandler) {
                        customClickHandler(item.id);
                    } else {
                        window.location.href = `${urlTemplate}?id=${item.id}`;
                    }
                });

                desktopMenu.appendChild(menuItem);
            });

            // 서브메뉴 컨테이너 높이 동적 조정
            // 가장 많은 메뉴를 가진 카테고리 기준으로 높이 계산
            const allSubMenuItems = desktopMenu.querySelectorAll('.sub-menu-item');
            if (allSubMenuItems.length > 0) {
                // 각 메뉴 아이템 중 가장 아래에 있는 항목의 bottom 위치 계산
                let maxBottom = 0;
                allSubMenuItems.forEach(item => {
                    // inline style과 CSS로 정의된 top 값 모두 읽기
                    const computedTop = window.getComputedStyle(item).top;
                    const top = parseInt(computedTop) || parseInt(item.style.top) || 0;
                    const itemHeight = 34; // 각 메뉴 아이템 높이 (padding 포함)
                    const bottom = top + itemHeight;
                    if (bottom > maxBottom) {
                        maxBottom = bottom;
                    }
                });

                // 여유 공간 추가 (상단 9px + 하단 여유)
                const containerHeight = maxBottom + 10;
                desktopMenu.style.height = `${containerHeight}px`;
            }
        }

        // Mobile 서브메뉴 업데이트
        const mobileContainer = document.getElementById(mobileContainerId);
        if (mobileContainer) {
            mobileContainer.innerHTML = '';

            items.forEach((item, index) => {
                const menuButton = document.createElement('button');
                menuButton.className = 'mobile-sub-item';
                menuButton.textContent = item.name || `${defaultNamePrefix}${index + 1}`;

                // 클릭 이벤트 추가
                menuButton.addEventListener('click', () => {
                    if (customClickHandler) {
                        customClickHandler(item.id);
                    } else {
                        window.location.href = `${urlTemplate}?id=${item.id}`;
                    }
                });

                mobileContainer.appendChild(menuButton);
            });
        }
    }

    /**
     * 객실 메뉴 아이템 동적 생성 (Side Header용)
     */
    mapRoomMenuItems() {
        const roomData = this.safeGet(this.data, 'rooms');
        if (!roomData || !Array.isArray(roomData)) {
            return;
        }

        // displayOrder로 정렬
        const sortedRooms = [...roomData].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

        // 객실 리스트 컨테이너 찾기
        const roomsList = this.safeSelect('[data-rooms-list]');
        if (!roomsList) {
            return;
        }

        // 기존 내용 초기화
        roomsList.innerHTML = '';

        // 각 객실 아이템 생성
        sortedRooms.forEach((room) => {
            const li = document.createElement('li');
            const a = document.createElement('a');

            a.textContent = this.getRoomName(room);
            a.style.cursor = 'pointer';

            // 클릭 이벤트 추가
            a.addEventListener('click', () => {
                window.location.href = `room.html?id=${room.id}`;
            });

            li.appendChild(a);
            roomsList.appendChild(li);
        });

    }

    /**
     * 시설 메뉴 아이템 동적 생성 (Side Header용)
     */
    mapFacilityMenuItems() {
        const facilityData = this.safeGet(this.data, 'property.facilities');
        if (!facilityData || !Array.isArray(facilityData)) {
            return;
        }

        // displayOrder로 정렬
        const sortedFacilities = [...facilityData].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

        // 편의시설 리스트 컨테이너 찾기
        const facilitiesList = this.safeSelect('[data-facilities-list]');
        if (!facilitiesList) {
            return;
        }

        // 기존 내용 초기화
        facilitiesList.innerHTML = '';

        // 각 편의시설 아이템 생성
        sortedFacilities.forEach((facility) => {
            const li = document.createElement('li');
            const a = document.createElement('a');

            a.textContent = this.sanitizeText(facility.name, '편의시설');
            a.style.cursor = 'pointer';

            // 클릭 이벤트 추가
            a.addEventListener('click', () => {
                window.location.href = `facility.html?id=${facility.id}`;
            });

            li.appendChild(a);
            facilitiesList.appendChild(li);
        });

    }

    /**
     * Side Header 이미지 배너 매핑
     * customFields.property.images (category: property_thumbnail) 중 첫 번째 이미지 사용
     */
    mapSideImageBanner() {
        if (!this.isDataLoaded) return;

        const banner = this.safeSelect('[data-side-banner-img]');
        if (!banner) return;

        // customFields에서 property_thumbnail 카테고리 이미지 가져오기
        const thumbnailImages = this.getPropertyImages('property_thumbnail');
        const selectedThumbnail = thumbnailImages[0];

        if (!selectedThumbnail || !selectedThumbnail.url) return;

        // 배경 이미지 설정
        banner.style.backgroundImage = `url('${selectedThumbnail.url}')`;
        banner.style.backgroundSize = 'cover';
        banner.style.backgroundPosition = 'center';
        banner.style.backgroundRepeat = 'no-repeat';
    }

    // ============================================================================
    // 🦶 FOOTER MAPPINGS
    // ============================================================================

    /**
     * Footer 로고 매핑 (customFields 우선)
     */
    mapFooterLogo() {
        if (!this.isDataLoaded || !this.data.property) return;

        // Footer 로고 이미지 매핑 (data-footer-logo 속성 사용)
        const footerLogoImage = this.safeSelect('[data-footer-logo]');
        if (footerLogoImage) {
            const logoUrl = this._getLogoUrl();

            if (logoUrl) {
                footerLogoImage.onerror = () => {};
                footerLogoImage.src = logoUrl;
                footerLogoImage.alt = this.getPropertyName();
            }
        }

        // Footer 로고 텍스트 매핑 (customFields 우선)
        const footerLogoText = this.safeSelect('[data-footer-logo-text]');
        if (footerLogoText) {
            footerLogoText.textContent = this.getPropertyNameEn();
        }
    }

    /**
     * Footer 사업자 정보 매핑
     */
    mapFooterInfo() {
        if (!this.isDataLoaded || !this.data.property) return;

        const property = this.data.property;
        const businessInfo = property.businessInfo;
        // 전화번호 매핑 - property.contactPhone 사용
        const footerPhone = this.safeSelect('[data-footer-phone]');
        if (footerPhone) {
            const phoneNumber = this.safeGet(this.data, 'property.contactPhone');
            if (phoneNumber) {
                footerPhone.textContent = phoneNumber;
            }
        }

        // 대표자명 매핑 - property.businessInfo.representativeName 사용
        const representativeNameElement = this.safeSelect('[data-footer-representative-name]');
        if (representativeNameElement) {
            const representative = businessInfo && businessInfo.representativeName;
            if (representative) {
                representativeNameElement.textContent = `대표자명 : ${representative}`;
            }
        }

        // 주소 매핑 - property.address 사용
        const addressElement = this.safeSelect('[data-footer-address]');
        if (addressElement) {
            const address = this.safeGet(this.data, 'property.address');
            if (address) {
                addressElement.textContent = `주소 : ${address}`;
            }
        }

        // 사업자번호 매핑 - property.businessInfo.businessNumber 사용
        const businessNumberElement = this.safeSelect('[data-footer-business-number]');
        if (businessNumberElement) {
            const businessNumber = businessInfo && businessInfo.businessNumber;
            if (businessNumber) {
                businessNumberElement.textContent = `사업자번호 : ${businessNumber}`;
            }
        }

        // 통신판매업신고번호 - property.businessInfo.eCommerceRegistrationNumber 사용
        const ecommerceElement = this.safeSelect('[data-footer-ecommerce]');
        if (ecommerceElement) {
            if (businessInfo && businessInfo.eCommerceRegistrationNumber) {
                ecommerceElement.textContent = `통신판매업신고번호 : ${businessInfo.eCommerceRegistrationNumber}`;
            } else {
                // 통신판매업신고번호가 없으면 부모 라인 전체 숨김
                const parentLine = ecommerceElement.closest('.footer-info-line');
                if (parentLine) {
                    parentLine.style.display = 'none';
                }
            }
        }

        // 저작권 정보 매핑 - 자동 생성 (현재년도 + 신비서 하드코딩)
        const copyrightElement = this.safeSelect('[data-footer-copyright]');
        if (copyrightElement) {
            const currentYear = new Date().getFullYear();

            // 링크 요소 생성
            const copyrightLink = document.createElement('a');
            copyrightLink.href = 'https://www.sinbibook.com/';
            copyrightLink.target = '_blank';
            copyrightLink.textContent = `© ${currentYear} 신비서. All rights reserved.`;
            copyrightLink.style.color = 'inherit';
            copyrightLink.style.textDecoration = 'none';

            // 기존 내용을 링크로 교체
            copyrightElement.innerHTML = '';
            copyrightElement.appendChild(copyrightLink);
        }
    }

    /**
     * Footer 소셜 링크 매핑
     * socialLinks가 빈 객체면 전체 섹션 숨김
     * 값이 있는 링크만 표시
     */
    mapSocialLinks() {
        if (!this.isDataLoaded) return;

        const socialLinks = this.safeGet(this.data, 'homepage.socialLinks') || {};
        const socialSection = this.safeSelect('[data-social-links-section]');

        // socialLinks가 빈 객체인지 체크
        const hasSocialLinks = Object.keys(socialLinks).length > 0;

        if (!hasSocialLinks) {
            // 빈 객체면 전체 섹션 숨김
            if (socialSection) {
                socialSection.style.display = 'none';
            }
            return;
        }

        // 소셜 링크가 있으면 섹션 표시
        if (socialSection) {
            socialSection.style.display = 'block';
        }

        // 소셜 링크 설정 객체와 루프를 사용한 매핑 (instagram, facebook, blog 지원)
        const socialLinkConfig = [
            { type: 'instagram', selector: '[data-social-instagram]' },
            { type: 'facebook', selector: '[data-social-facebook]' },
            { type: 'blog', selector: '[data-social-blog]' }
        ];

        socialLinkConfig.forEach(({ type, selector }) => {
            const linkElement = this.safeSelect(selector);
            if (linkElement) {
                if (socialLinks[type]) {
                    linkElement.href = socialLinks[type];
                    linkElement.style.display = 'flex';
                } else {
                    linkElement.style.display = 'none';
                }
            }
        });
    }

    // ============================================================================
    // 🔄 TEMPLATE METHODS IMPLEMENTATION
    // ============================================================================

    /**
     * Header 전체 매핑 실행
     */
    async mapHeader() {
        if (!this.isDataLoaded) {
            return;
        }

        // Favicon 매핑
        this.mapFavicon();

        // Header 매핑
        this.mapHeaderLogo();
        this.mapHeaderNavigation();

        // Side Header 이미지 배너 매핑
        this.mapSideImageBanner();
    }

    /**
     * Footer 전체 매핑 실행
     */
    async mapFooter() {
        if (!this.isDataLoaded) {
            return;
        }

        // Footer 매핑
        this.mapFooterLogo();
        this.mapFooterInfo();
        this.mapSocialLinks();

        // E-commerce registration 매핑
        this.mapEcommerceRegistration();
    }

    /**
     * Header & Footer 전체 매핑 실행
     */
    async mapHeaderFooter() {
        if (!this.isDataLoaded) {
            return;
        }

        // 동시에 실행
        await Promise.all([
            this.mapHeader(),
            this.mapFooter()
        ]);
    }

    /**
     * BaseMapper에서 요구하는 mapPage 메서드 구현
     */
    async mapPage() {
        return this.mapHeaderFooter();
    }
}

// ES6 모듈 및 글로벌 노출
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HeaderFooterMapper;
} else {
    window.HeaderFooterMapper = HeaderFooterMapper;
}
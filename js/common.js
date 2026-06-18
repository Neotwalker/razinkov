document.addEventListener("DOMContentLoaded", () => {

	const video = document.querySelector('.hero-video');

	if (video) {

		const source = document.createElement('source');
		const isMobile = window.matchMedia('(max-width: 768px)').matches;
	
		source.src = isMobile ? video.dataset.srcMobile : video.dataset.srcDesktop;
		source.type = 'video/mp4';
	
		video.appendChild(source);
	
		window.addEventListener('load', function () {
			video.load();
	
			video.play().catch(function () {
				// Если браузер не дал autoplay — ничего страшного, останется poster
			});
		});

	}


	// header burger
	const burger = document.querySelector('.header-burger');
	const headerBlock = document.querySelector('.header-block');

	if (burger && headerBlock) {

		// открытие / закрытие бургер-меню
		burger.addEventListener('click', () => {
			headerBlock.classList.toggle('active');
			burger.classList.toggle('open');
		});

		// закрытие при клике вне menu
		document.addEventListener('click', (e) => {
			if (!headerBlock.classList.contains('active')) return;

			const isClickInsideMenu = headerBlock.contains(e.target);
			const isClickBurger = burger.contains(e.target);

			if (!isClickInsideMenu && !isClickBurger) {
				headerBlock.classList.remove('active');
				burger.classList.remove('open');
			}
		});

		// закрытие при клике на якорную ссылку
		const anchorLinks = headerBlock.querySelectorAll('a[href^="#"]');

		anchorLinks.forEach(link => {
			link.addEventListener('click', () => {
				headerBlock.classList.remove('active');
				burger.classList.remove('open');
			});
		});
	}

	
	if (window.innerWidth > 768) {
		// parallax for hero
		function initHeroParallax() {
			const hero = document.querySelector('.main-hero');
			if (!hero) return;
			const bg = hero.querySelector('.main-hero__bg');
			if (!bg) return;

			if (!hero || !bg) return;

			let ticking = false;

			const updateParallax = () => {
				const rect = hero.getBoundingClientRect();
				const windowHeight = window.innerHeight;

				// Проверяем, что блок хотя бы частично в зоне видимости
				if (rect.bottom > 0 && rect.top < windowHeight) {
					// progress: примерно от -1 до 1 относительно экрана
					const progress = (rect.top + rect.height / 2 - windowHeight / 2) / windowHeight;

					// Сила эффекта, можно менять
					const offset = progress * -700;

					bg.style.transform = `translate3d(0, ${offset}px, 0)`;
				}

				ticking = false;
			};

			const requestTick = () => {
				if (!ticking) {
					requestAnimationFrame(updateParallax);
					ticking = true;
				}
			};

			window.addEventListener('scroll', requestTick, { passive: true });
			window.addEventListener('resize', requestTick);

			updateParallax();
		}
		initHeroParallax();
	}

	// fancybox
	if (window.Fancybox && document.querySelector('[data-fancybox]')) {
		Fancybox.bind("[data-fancybox]", {
			Toolbar: {
				display: {
					left: [],
					middle: [],
					right: ["close"],
				},
			},
		});
	}
	Fancybox.bind('[data-fancybox="main-proof-videos"]', {
		dragToClose: false,
		iframe: {
			preload: false
		}
	});

	// Smooth Height for FAQ
	const smoothHeight = (itemSelector, buttonSelector, contentSelector) => {
		const items = document.querySelectorAll(itemSelector);
		if (!items.length) return;

		const firstItem = items[0];
		const firstButton = firstItem.querySelector(buttonSelector);
		const firstContent = firstItem.querySelector(contentSelector);
		if (firstButton && firstContent) {
			firstItem.classList.add('active');
			firstButton.classList.add('active');
			firstItem.dataset.open = 'true';
			firstContent.style.maxHeight = `${firstContent.scrollHeight}px`;
		}

		// Функция для получения высоты шапки динамически
		const getHeaderHeight = () => {
			const header = document.querySelector('.header');
			return header ? header.offsetHeight : 0;
		};

		items.forEach(item => {
			const button = item.querySelector(buttonSelector);
			const content = item.querySelector(contentSelector);
			if (button && content) {
				button.addEventListener('click', () => {
					const isOpen = item.dataset.open === 'true';
					items.forEach(i => {
						if (i !== item) {
							i.dataset.open = 'false';
							i.classList.remove('active');
							i.querySelector(buttonSelector)?.classList.remove('active');
							const otherContent = i.querySelector(contentSelector);
							if (otherContent) otherContent.style.maxHeight = '';
						}
					});
					item.dataset.open = isOpen ? 'false' : 'true';
					item.classList.toggle('active', !isOpen);
					button.classList.toggle('active', !isOpen);
					content.style.maxHeight = isOpen ? '' : `${content.scrollHeight}px`;

					// Прокрутка к началу активного блока, если он открыт
					if (!isOpen) {
						setTimeout(() => {
							const rect = item.getBoundingClientRect();
							const isFullyVisible =
								rect.top >= 0 &&
								rect.bottom <= (window.innerHeight || document.documentElement.clientHeight);

							if (!isFullyVisible) {
								const headerHeight = getHeaderHeight();
								const scrollPosition = window.scrollY + rect.top - headerHeight - 10; // Добавляем отступ 10px
								window.scrollTo({
									top: scrollPosition,
									behavior: 'smooth',
								});
							}
						}, 300); // Задержка для завершения анимации открытия
					}
				});

				window.addEventListener('resize', () => {
					items.forEach(item => {
						if (item.dataset.open !== 'true') return;

						const content = item.querySelector(contentSelector);
						if (!content) return;

						if (parseInt(content.style.maxHeight) !== content.scrollHeight) {
							content.style.maxHeight = `${content.scrollHeight}px`;
						}
					});
				});
			}
		});
	};
	smoothHeight('.main--faq__item', '.main--faq__item--button', '.main--faq__item--answer');

	// reviews show more
	const reviewsBlocks = document.querySelectorAll('.main-reviews__wrapper');
	const visibleCount = 8;
	reviewsBlocks.forEach((block) => {
		const list = block.querySelector('.main-reviews__list');
		const items = Array.from(list?.querySelectorAll('.image') || []);
		const button = block.querySelector('.main-reviews__toggle');
		const buttonWrapper = button?.closest('.show-all-reviews');

		if (!list || !button || !items.length) return;

		if (items.length <= visibleCount) {
			if (buttonWrapper) buttonWrapper.style.display = 'none';
			return;
		}

		let isExpanded = false;

		const getCollapsedHeight = () => {
			const visibleItems = items.slice(0, visibleCount);
			if (!visibleItems.length) return list.scrollHeight;

			const listTop = list.getBoundingClientRect().top;

			let maxBottom = 0;

			visibleItems.forEach((item) => {
				const itemBottom = item.getBoundingClientRect().bottom - listTop;
				if (itemBottom > maxBottom) {
					maxBottom = itemBottom;
				}
			});

			return Math.ceil(maxBottom);
		};

		const setCollapsed = () => {
			list.style.maxHeight = `${getCollapsedHeight()}px`;
			button.classList.remove('is-open');
		};

		const setExpanded = () => {
			list.style.maxHeight = `${list.scrollHeight}px`;
			button.classList.add('is-open');
		};

		const updateState = () => {
			if (isExpanded) {
				setExpanded();
			} else {
				setCollapsed();
			}
		};

		button.addEventListener('click', () => {
			isExpanded = !isExpanded;
			updateState();
		});

		let resizeTimer;
		window.addEventListener('resize', () => {
			clearTimeout(resizeTimer);
			resizeTimer = setTimeout(updateState, 100);
		});

		const images = list.querySelectorAll('img');
		let loadedCount = 0;

		if (!images.length) {
			updateState();
			return;
		}

		const onReady = () => {
			loadedCount += 1;
			if (loadedCount === images.length) {
				updateState();
			}
		};

		images.forEach((img) => {
			if (img.complete) {
				onReady();
			} else {
				img.addEventListener('load', onReady, { once: true });
				img.addEventListener('error', onReady, { once: true });
			}
		});
	});

	// Phone Input Mask
	const phoneInputs = document.querySelectorAll('.wpcf7-tel');
	if (phoneInputs.length) {
		const applyPhoneMask = (e) => {
			const el = e.target;
			const clearVal = el.dataset.phoneClear;
			const pattern = el.dataset.phonePattern || '+_(___) ___-__-__';
			const def = pattern.replace(/\D/g, '');
			let val = el.value.replace(/\D/g, '');
			const patternLength = (pattern.match(/[_\d]/g) || []).length;
			if (clearVal !== 'false' && e.type === 'blur' && val.length < patternLength) {
				el.value = '';
				return;
			}
			if (def.length >= val.length) val = def;
			let i = 0;
			el.value = pattern.replace(/./g, a => /[_\d]/.test(a) && i < val.length ? val.charAt(i++) : i >= val.length ? '' : a);
		};
		phoneInputs.forEach(input => ['input', 'blur', 'focus'].forEach(ev => input.addEventListener(ev, applyPhoneMask)));
	}

	// Form Checkboxes
	const setupCheckbox = (checkboxId, buttonSelector) => {
		const checkbox = document.getElementById(checkboxId);
		const button = document.querySelector(buttonSelector);

		if (!checkbox || !button) return;

		button.toggleAttribute('disabled', !checkbox.checked);

		checkbox.addEventListener('change', () => {
			button.toggleAttribute('disabled', !checkbox.checked);
		});
	};
	setupCheckbox('check', '.modal--general button[type="submit"]');

	
	const docEl = document.documentElement;
	const body = document.body;
	const hasClass = (el, cls) => el && el.classList.contains(cls);
	const qsa = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

	const modals = qsa('.modal');
	const header = document.querySelector('.header');
	const topButton = document.querySelector('.top');

	// ---------- COOKIES BANNER (6 месяцев) ----------
	(function () {
		const cookiesBanner = document.querySelector('.cookies');
		if (!cookiesBanner) return;

		const cookiesButton = cookiesBanner.querySelector('.cookies--button');
		if (!cookiesButton) return;

		const CONSENT_KEY = 'cookieConsent';
		const CONSENT_TS_KEY = 'cookieConsentTs';
		const SIX_MONTHS = 1000 * 60 * 60 * 24 * 30 * 6; // ~6 месяцев

		function shouldShowBanner() {
			try {
				const consent = localStorage.getItem(CONSENT_KEY);
				if (!consent) return true;

				// Старое согласие без таймстемпа — считаем бессрочным, баннер не показываем.
				const tsRaw = localStorage.getItem(CONSENT_TS_KEY);
				if (!tsRaw) return false;

				const ts = Number(tsRaw) || 0;
				return Date.now() - ts > SIX_MONTHS;
			} catch (e) {
				// если localStorage недоступен — просто показываем
				return true;
			}
		}

		if (shouldShowBanner()) {
			cookiesBanner.classList.add('active');
		}

		cookiesButton.addEventListener('click', () => {
			try {
				localStorage.setItem(CONSENT_KEY, 'true');
				localStorage.setItem(CONSENT_TS_KEY, String(Date.now()));
			} catch (e) {}
			cookiesBanner.classList.remove('active');
		});
	})();

	// ---------- HEADER SCROLL & SCROLL-TO-TOP ----------
	if (topButton) {
		const checkScroll = () => {
			const y = window.scrollY;
			topButton.classList.toggle('scroll', y > 500);
		};

		checkScroll();
		window.addEventListener('scroll', checkScroll);

		topButton.addEventListener('click', () => {
			window.scrollTo({ top: 0, behavior: 'smooth' });
		});
	}

	// Убрать скролл при открытии модалок/меню
	function isAnythingOverlayOpen() {
		return document.querySelector('.modal.active') !== null;
	}

	function lockScroll() {
		if (!isAnythingOverlayOpen()) return;

		const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

		docEl.classList.add('overflow');

		if (scrollbarWidth > 0) {
			body.style.paddingRight = `${scrollbarWidth}px`;

			if (header) {
				header.style.paddingRight = `${scrollbarWidth}px`;
			}
		}
	}

	function unlockScrollIfFree() {
		if (isAnythingOverlayOpen()) return;

		docEl.classList.remove('overflow');

		if (header) {
			header.style.paddingRight = '';
		}

		body.style.paddingRight = '';
	}

	// ---------- MODALS ----------
	function closeAllModals() {
		qsa('.modal.active').forEach(modalItem => {
			modalItem.classList.remove('active');
		});

		unlockScrollIfFree();
	}

	function openModal(selector = '.modal--general') {
		const target = document.querySelector(selector);
		if (!target) return;

		closeAllModals();

		target.classList.add('active');
		lockScroll();
	}

	function closeSingleModal(modalItem) {
		if (!modalItem) return;

		modalItem.classList.remove('active');
		unlockScrollIfFree();
	}

	if (modals.length) {
		// Открытие модалок
		qsa('.modal--open').forEach(button => {
			button.addEventListener('click', e => {
				e.preventDefault();

				const targetSelector = button.getAttribute('data-modal-target') || '.modal--general';
				openModal(targetSelector);
			});
		});

		// Закрытие по клику на фон
		modals.forEach(modalItem => {
			modalItem.addEventListener('click', e => {
				if (e.target === modalItem) {
					closeSingleModal(modalItem);
				}
			});
		});

		// Закрытие по кнопкам
		qsa('.modal-close').forEach(close => {
			close.addEventListener('click', e => {
				e.preventDefault();
				e.stopPropagation();

				const parentModal = close.closest('.modal');
				closeSingleModal(parentModal);
			});
		});
	}

	// ---------- CONTACT FORM 7 RESULT MODALS ----------
	document.addEventListener('wpcf7mailsent', function () {
		openModal('.modal--send');
	}, false);

	document.addEventListener('wpcf7mailfailed', function () {
		openModal('.modal--error');
	}, false);

	document.addEventListener('wpcf7spam', function () {
		openModal('.modal--error');
	}, false);

});

(function () {
    const HEADER_OFFSET = 170; // высота фиксированной шапки + запас

    document.addEventListener('DOMContentLoaded', () => {
        // Устанавливаем max-height для всех toc
        document.querySelectorAll('.toc-wrapper .toc').forEach(toc => {
            toc.style.maxHeight = toc.scrollHeight + 'px';
        });
    });

    document.addEventListener('click', function (e) {
        // сворачивание/разворачивание
        const toggleBtn = e.target.closest('.close_content');
        if (toggleBtn) {
            const wrapper = toggleBtn.closest('.toc-wrapper');
            const toc = wrapper && wrapper.querySelector('.toc');
            if (!toc) return;

            if (toc.classList.contains('hidden')) {
                toc.classList.remove('hidden');
                toggleBtn.classList.remove('active');
                toc.style.maxHeight = toc.scrollHeight + 'px';
            } else {
                toc.style.maxHeight = toc.scrollHeight + 'px';
                setTimeout(() => toc.style.maxHeight = '0px', 10);
                toc.classList.add('hidden');
                toggleBtn.classList.add('active');
            }
            return;
        }

        // плавный скролл с отступом
        const tocLink = e.target.closest('.toc a');
        if (tocLink && tocLink.hash) {
            const id = decodeURIComponent(tocLink.hash.slice(1));
            const target = document.getElementById(id);
            if (target) {
                e.preventDefault();
                const top = target.getBoundingClientRect().top + window.pageYOffset - HEADER_OFFSET;
                window.history.pushState(null, '', '#' + id);
                window.scrollTo({ top, behavior: 'smooth' });
            }
        }
    });

})();

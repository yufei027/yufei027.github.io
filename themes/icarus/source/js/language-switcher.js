/* global document, window */
(function () {
    const DROPDOWN_SELECTOR = '[data-lang-dropdown]';
    const TOGGLE_SELECTOR = '[data-lang-toggle]';
    const OPTION_SELECTOR = '[data-lang-option]';
    const BACKDROP_SELECTOR = '[data-lang-backdrop]';
    const MENU_SELECTOR = '.language-dropdown-menu';
    const DATA_BOUND = 'langSwitcherBound';
    let dropdowns = [];

    function positionDropdown(dropdown) {
        if (!dropdown) {
            return;
        }
        const toggle = dropdown.querySelector(TOGGLE_SELECTOR);
        const menu = dropdown.querySelector(MENU_SELECTOR);
        if (!toggle || !menu) {
            return;
        }

        // Reset position before measuring
        menu.style.left = '0px';
        menu.style.top = '0px';

        const toggleRect = toggle.getBoundingClientRect();
        const menuRect = menu.getBoundingClientRect();
        const viewportWidth = document.documentElement.clientWidth || window.innerWidth;
        const horizontalPadding = 16;
        const menuWidth = menuRect.width;

        let left = toggleRect.left + (toggleRect.width / 2) - (menuWidth / 2);
        left = Math.max(horizontalPadding, Math.min(left, viewportWidth - menuWidth - horizontalPadding));
        let top = toggleRect.bottom + 12;
        if (top < 8) {
            top = 8;
        }

        menu.style.left = `${Math.round(left)}px`;
        menu.style.top = `${Math.round(top)}px`;
    }

    function repositionAll() {
        dropdowns.forEach(dropdown => {
            if (dropdown.classList.contains('is-open')) {
                positionDropdown(dropdown);
            }
        });
    }

    function closeDropdown(dropdown) {
        if (!dropdown) {
            return;
        }
        dropdown.classList.remove('is-open');
        const toggle = dropdown.querySelector(TOGGLE_SELECTOR);
        const backdrop = dropdown.previousElementSibling;
        if (toggle) {
            toggle.setAttribute('aria-expanded', 'false');
        }
        if (backdrop && backdrop.matches(BACKDROP_SELECTOR)) {
            backdrop.classList.remove('is-visible');
        }
    }

    function openDropdown(dropdown) {
        if (!dropdown) {
            return;
        }
        const toggle = dropdown.querySelector(TOGGLE_SELECTOR);
        const backdrop = dropdown.previousElementSibling;
        dropdown.classList.add('is-open');
        if (toggle) {
            toggle.setAttribute('aria-expanded', 'true');
        }
        positionDropdown(dropdown);
        if (backdrop && backdrop.matches(BACKDROP_SELECTOR)) {
            backdrop.classList.add('is-visible');
        }
    }

    function closeAll(except) {
        dropdowns.forEach(dropdown => {
            if (dropdown !== except) {
                closeDropdown(dropdown);
            }
        });
    }

    function handleToggleClick(event) {
        const dropdown = event.currentTarget.closest(DROPDOWN_SELECTOR);
        if (!dropdown) {
            return;
        }
        const isOpen = dropdown.classList.contains('is-open');
        if (isOpen) {
            closeDropdown(dropdown);
        } else {
            closeAll(dropdown);
            openDropdown(dropdown);
        }
    }

    function handleBackdropClick(event) {
        const dropdown = event.currentTarget.nextElementSibling;
        if (dropdown && dropdown.matches(DROPDOWN_SELECTOR)) {
            closeDropdown(dropdown);
        }
    }

    function handleOptionClick(event) {
        const option = event.currentTarget;
        if (!option || option.classList.contains('is-active') || option.disabled) {
            closeAll();
            return;
        }
        const url = option.dataset.langUrl;
        if (url && url !== '#') {
            window.location.href = url;
        }
    }

    function handleDocumentClick(event) {
        dropdowns.forEach(dropdown => {
            if (!dropdown.contains(event.target)) {
                closeDropdown(dropdown);
            }
        });
    }

    function handleKeyDown(event) {
        if (event.key === 'Escape') {
            closeAll();
        }
    }

    function bind(container) {
        if (!container || container.dataset[DATA_BOUND] === 'true') {
            return;
        }
        container.dataset[DATA_BOUND] = 'true';
        const dropdown = container.querySelector(DROPDOWN_SELECTOR);
        const toggle = dropdown ? dropdown.querySelector(TOGGLE_SELECTOR) : null;
        const options = dropdown ? dropdown.querySelectorAll(OPTION_SELECTOR) : [];
        const backdrop = container.querySelector(BACKDROP_SELECTOR);
        if (toggle) {
            toggle.addEventListener('click', handleToggleClick);
        }
        options.forEach(option => {
            option.addEventListener('click', handleOptionClick);
        });
        if (backdrop) {
            backdrop.addEventListener('click', handleBackdropClick);
        }
    }

    function init() {
        dropdowns = Array.from(document.querySelectorAll(DROPDOWN_SELECTOR));
        if (!dropdowns.length) {
            return;
        }
        dropdowns
            .map(dropdown => dropdown.parentElement)
            .filter(Boolean)
            .forEach(bind);
        if (!window.__icarusLangSwitcherDocBound) {
            document.addEventListener('click', handleDocumentClick);
            document.addEventListener('keydown', handleKeyDown);
            window.__icarusLangSwitcherDocBound = true;
        }
        if (!window.__icarusLangSwitcherResizeBound) {
            window.addEventListener('resize', repositionAll, { passive: true });
            window.addEventListener('scroll', repositionAll, { passive: true, capture: true });
            window.__icarusLangSwitcherResizeBound = true;
        }
    }

    document.addEventListener('DOMContentLoaded', init);
    document.addEventListener('pjax:success', init);
})();


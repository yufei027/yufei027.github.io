(function() {
    const STORAGE_KEY = 'icarus-theme';
    const root = document.documentElement;
    const mediaQuery = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

    function getStoredTheme() {
        try {
            return localStorage.getItem(STORAGE_KEY);
        } catch (err) {
            return null;
        }
    }

    function storeTheme(value) {
        try {
            if (value === null) {
                localStorage.removeItem(STORAGE_KEY);
            } else {
                localStorage.setItem(STORAGE_KEY, value);
            }
        } catch (err) {
            // ignore
        }
    }

    function getPreferredTheme() {
        const stored = getStoredTheme();
        if (stored === 'dark' || stored === 'light') {
            return stored;
        }
        if (mediaQuery && typeof mediaQuery.matches === 'boolean') {
            return mediaQuery.matches ? 'dark' : 'light';
        }
        return 'light';
    }

    function setTheme(theme) {
        const normalized = theme === 'dark' ? 'dark' : 'light';
        root.setAttribute('data-theme', normalized);
        root.style.colorScheme = normalized;
        updateToggleIcon(normalized);
    }

    function updateToggleIcon(theme) {
        const toggle = document.querySelector('[data-toggle-theme]');
        if (!toggle) {
            return;
        }
        const icon = toggle.querySelector('i');
        if (!icon) {
            return;
        }
        icon.classList.remove('fa-sun', 'fa-moon');
        if (theme === 'dark') {
            icon.classList.add('fa-sun');
            toggle.setAttribute('aria-label', 'Switch to light theme');
            toggle.setAttribute('title', 'Switch to light theme');
        } else {
            icon.classList.add('fa-moon');
            toggle.setAttribute('aria-label', 'Switch to dark theme');
            toggle.setAttribute('title', 'Switch to dark theme');
        }
    }

    function initToggle() {
        const toggle = document.querySelector('[data-toggle-theme]');
        if (!toggle) {
            return;
        }
        if (toggle.getAttribute('data-theme-toggle-bound') === 'true') {
            return;
        }
        toggle.addEventListener('click', function(event) {
            event.preventDefault();
            const current = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
            const next = current === 'dark' ? 'light' : 'dark';
            setTheme(next);
            storeTheme(next);
        });
        toggle.setAttribute('data-theme-toggle-bound', 'true');
    }

    function handleSystemPreference(event) {
        const stored = getStoredTheme();
        if (stored === 'dark' || stored === 'light') {
            return;
        }
        setTheme(event.matches ? 'dark' : 'light');
    }

    function initialize() {
        setTheme(getPreferredTheme());
        initToggle();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

    document.addEventListener('pjax:success', function() {
        initToggle();
        updateToggleIcon(root.getAttribute('data-theme'));
    });

    document.addEventListener('pjax:complete', function() {
        initToggle();
        updateToggleIcon(root.getAttribute('data-theme'));
    });

    if (mediaQuery) {
        if (typeof mediaQuery.addEventListener === 'function') {
            mediaQuery.addEventListener('change', handleSystemPreference);
        } else if (typeof mediaQuery.addListener === 'function') {
            mediaQuery.addListener(handleSystemPreference);
        }
    }
})();


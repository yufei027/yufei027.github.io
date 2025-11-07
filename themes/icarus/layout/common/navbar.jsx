const { Component, Fragment } = require('inferno');
const { cacheComponent } = require('hexo-component-inferno/lib/util/cache');
const classname = require('hexo-component-inferno/lib/util/classname');

function isSameLink(a, b) {
    function santize(url) {
        let paths = url.replace(/(^\w+:|^)\/\//, '').split('#')[0].split('/').filter(p => p.trim() !== '');
        if (paths.length > 0 && paths[paths.length - 1].trim() === 'index.html') {
            paths = paths.slice(0, paths.length - 1);
        }
        return paths.join('/');
    }
    return santize(a) === santize(b);
}

class Navbar extends Component {
    render() {
        const {
            logo,
            logoUrl,
            siteUrl,
            siteTitle,
            menu,
            links,
            showToc,
            tocTitle,
            showSearch,
            searchTitle,
            languageOptions,
            languageSwitcherLabel,
            currentLanguageLabel
        } = this.props;

        let navbarLogo = '';
        if (logo) {
            if (logo.text) {
                navbarLogo = logo.text;
            } else {
                navbarLogo = <img src={logoUrl} alt={siteTitle} height="28" />;
            }
        } else {
            navbarLogo = siteTitle;
        }

        return <nav class="navbar navbar-main">
            <div class="container navbar-container">
                <div class="navbar-brand justify-content-center">
                    <a class="navbar-item navbar-logo" href={siteUrl}>
                        {navbarLogo}
                    </a>
                </div>
                <div class="navbar-menu">
                    {Object.keys(menu).length ? <div class="navbar-start">
                        {Object.keys(menu).map(name => {
                            const item = menu[name];
                            return <a class={classname({ 'navbar-item': true, 'is-active': item.active })} href={item.url}>{name}</a>;
                        })}
                    </div> : null}
                    <div class="navbar-end">
                        {languageOptions && languageOptions.length > 1 ? <div class="navbar-item language-switcher">
                            <div class="language-overlay-backdrop" data-lang-backdrop></div>
                            <div class="language-dropdown" data-lang-dropdown>
                                <button type="button" class="language-dropdown-toggle" data-lang-toggle aria-haspopup="listbox" aria-expanded="false" aria-label={languageSwitcherLabel}>
                                    <i class="fas fa-globe language-dropdown-icon" aria-hidden="true"></i>
                                    <span class="language-dropdown-label">{currentLanguageLabel}</span>
                                    <i class="fas fa-chevron-down language-dropdown-caret" aria-hidden="true"></i>
                                </button>
                                <ul class="language-dropdown-menu" role="listbox">
                                    {languageOptions.map(option => <li key={option.lang || option.label}>
                                        <button
                                            type="button"
                                            class={`language-dropdown-item${option.active ? ' is-active' : ''}`}
                                            data-lang-option
                                            data-lang-url={option.url}
                                            role="option"
                                            aria-selected={option.active}
                                            disabled={option.active}
                                        >{option.label}</button>
                                    </li>)}
                                </ul>
                            </div>
                        </div> : null}
                        <a class="navbar-item theme-toggle" data-toggle-theme href="javascript:;" role="button" aria-label="Toggle theme" title="Toggle theme">
                            <i class="fas fa-moon"></i>
                        </a>
                        {Object.keys(links).length ? <Fragment>
                            {Object.keys(links).map(name => {
                                const link = links[name];
                                return <a class="navbar-item" target="_blank" rel="noopener" title={name} href={link.url}>
                                    {link.icon ? <i class={link.icon}></i> : name}
                                </a>;
                            })}
                        </Fragment> : null}
                        {showToc ? <a class="navbar-item is-hidden-tablet catalogue" title={tocTitle} href="javascript:;">
                            <i class="fas fa-list-ul"></i>
                        </a> : null}
                        {showSearch ? <a class="navbar-item search" title={searchTitle} href="javascript:;">
                            <i class="fas fa-search"></i>
                        </a> : null}
                    </div>
                </div>
            </div>
        </nav>;
    }
}

module.exports = cacheComponent(Navbar, 'common.navbar', props => {
    const { config, helper, page } = props;
    const { url_for, _p, __ } = helper;
    const { logo, title, navbar, widgets, search } = config;

    const configLanguage = config.language;
    let languageList = [];
    if (Array.isArray(configLanguage)) {
        languageList = configLanguage.filter(lang => typeof lang === 'string' && lang.trim() !== '');
    } else if (typeof configLanguage === 'string' && configLanguage.trim() !== '') {
        languageList = [configLanguage.trim()];
    }

    const rawCurrentLanguage = page.lang || page.language || (languageList[0] || 'default');

    if (!languageList.length) {
        languageList = [rawCurrentLanguage || 'default'];
    } else if (rawCurrentLanguage && rawCurrentLanguage !== 'default' && !languageList.includes(rawCurrentLanguage)) {
        languageList.push(rawCurrentLanguage);
    }

    languageList = Array.from(new Set(languageList.filter(Boolean)));

    const defaultLanguage = languageList[0] || (rawCurrentLanguage && rawCurrentLanguage !== 'default' ? rawCurrentLanguage : 'default');
    const currentLanguage = (!rawCurrentLanguage || rawCurrentLanguage === 'default') ? defaultLanguage : rawCurrentLanguage;

    const i18nDir = typeof config.i18n_dir === 'string' && config.i18n_dir.trim() !== '' ? config.i18n_dir.trim() : ':lang';

    function getLanguagePath(lang) {
        if (!lang || lang === 'default') {
            return '';
        }
        const trimmedLang = String(lang).trim();
        if (!trimmedLang || trimmedLang === defaultLanguage) {
            return '';
        }
        let langPath = i18nDir;
        if (langPath.includes(':lang')) {
            langPath = langPath.replace(':lang', trimmedLang);
        } else if (langPath.length > 0) {
            langPath = `${langPath}/${trimmedLang}`;
        } else {
            langPath = trimmedLang;
        }
        return langPath.replace(/^\/+/, '').replace(/\/+$/, '');
    }

    const languagePaths = languageList
        .map(getLanguagePath)
        .filter(path => !!path);

    function normalizePath(path) {
        if (!path) {
            return '';
        }
        let normalized = typeof path === 'string' ? path : String(path);
        normalized = normalized.trim();
        if (!normalized) {
            return '';
        }
        normalized = normalized.replace(/^\/+/, '');
        normalized = normalized.replace(/index\.html?$/i, '');
        return normalized;
    }

    function stripLanguageFromPath(path) {
        if (!path) {
            return '';
        }
        for (const langPath of languagePaths) {
            if (!langPath) {
                continue;
            }
            if (path === langPath) {
                return '';
            }
            if (path.startsWith(`${langPath}/`)) {
                return path.substring(langPath.length + 1);
            }
        }
        return path;
    }

    const canonicalPath = normalizePath(page.canonical_path || page.path || '');
    const basePath = stripLanguageFromPath(canonicalPath);

    function buildLanguageUrl(lang) {
        const trimmedLang = typeof lang === 'string' ? lang.trim() : '';
        if (!trimmedLang || trimmedLang === defaultLanguage || trimmedLang === 'default') {
            return url_for(basePath || '/');
        }
        const langPath = getLanguagePath(trimmedLang);
        if (!langPath) {
            return url_for(basePath || '/');
        }
        let targetPath = basePath ? `${langPath}/${basePath}` : langPath;
        targetPath = targetPath.replace(/\/{2,}/g, '/');
        if (basePath && basePath.endsWith('/') && !targetPath.endsWith('/')) {
            targetPath += '/';
        }
        return url_for(targetPath || '/');
    }

    const currentLanguagePath = getLanguagePath(currentLanguage);

    function buildLocalizedPath(target) {
        if (!target) {
            return url_for('/');
        }
        if (typeof target !== 'string') {
            return url_for(target);
        }
        const trimmed = target.trim();
        if (!trimmed) {
            return url_for('/');
        }
        if (trimmed.startsWith('#') || /^javascript:/i.test(trimmed)) {
            return trimmed;
        }
        if (/^(?:[a-z]+:)?\/\//i.test(trimmed)) {
            return trimmed;
        }
        let pathPart = trimmed;
        let anchor = '';
        const anchorIndex = pathPart.indexOf('#');
        if (anchorIndex >= 0) {
            anchor = pathPart.substring(anchorIndex);
            pathPart = pathPart.substring(0, anchorIndex);
        }
        pathPart = pathPart.replace(/^\/+/, '').replace(/index\.html?$/i, '');
        let combinedPath = pathPart;
        if (currentLanguagePath) {
            combinedPath = combinedPath ? `${currentLanguagePath}/${combinedPath}` : currentLanguagePath;
        }
        combinedPath = combinedPath.replace(/\/{2,}/g, '/');
        const finalPath = combinedPath ? `/${combinedPath}` : '/';
        let resolved = url_for(finalPath);
        if (anchor) {
            resolved += anchor;
        }
        return resolved;
    }

    function translateLanguage(lang) {
        if (!lang) {
            const fallback = __('navbar.languages.default');
            return fallback !== 'navbar.languages.default' ? fallback : 'default';
        }
        const code = String(lang);
        const fullKey = `navbar.languages.${code}`;
        const fullTranslated = __(fullKey);
        if (fullTranslated && fullTranslated !== fullKey) {
            return fullTranslated;
        }
        const shortCode = code.split(/[-_]/)[0];
        if (shortCode) {
            const shortKey = `navbar.languages.${shortCode}`;
            const shortTranslated = __(shortKey);
            if (shortTranslated && shortTranslated !== shortKey) {
                return shortTranslated;
            }
        }
        return code;
    }

    const languageOptions = languageList
        .filter(lang => lang && lang !== 'default')
        .map(lang => ({
            lang,
            label: translateLanguage(lang),
            url: buildLanguageUrl(lang),
            active: lang === currentLanguage
        }));

    const currentLanguageLabel = translateLanguage(currentLanguage);

    const rawLanguageSwitcherLabel = __('navbar.language_switcher');
    const languageSwitcherLabel = rawLanguageSwitcherLabel && rawLanguageSwitcherLabel !== 'navbar.language_switcher'
        ? rawLanguageSwitcherLabel
        : 'Language';

    const hasTocWidget = Array.isArray(widgets) && widgets.find(widget => widget.type === 'toc');
    const showToc = (config.toc === true || page.toc) && hasTocWidget && ['page', 'post'].includes(page.layout);

    const menu = {};
    if (navbar && navbar.menu) {
        const pageUrl = typeof page.path !== 'undefined' ? url_for(page.path) : '';
        Object.keys(navbar.menu).forEach(name => {
            const url = buildLocalizedPath(navbar.menu[name]);
            const active = isSameLink(url, pageUrl);
            menu[name] = { url, active };
        });
    }

    const links = {};
    if (navbar && navbar.links) {
        Object.keys(navbar.links).forEach(name => {
            const link = navbar.links[name];
            const linkTarget = typeof link === 'string' ? link : link.url;
            links[name] = {
                url: buildLocalizedPath(linkTarget),
                icon: link.icon
            };
        });
    }

    return {
        logo,
        logoUrl: url_for(logo),
        siteUrl: url_for('/'),
        siteTitle: title,
        menu,
        links,
        languageOptions,
        languageSwitcherLabel,
        currentLanguageLabel,
        showToc,
        tocTitle: _p('widget.catalogue', Infinity),
        showSearch: search && search.type,
        searchTitle: __('search.search')
    };
});

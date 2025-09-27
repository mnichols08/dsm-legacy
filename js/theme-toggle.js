/**
 * Handles color theme toggling with system preference support and persistence.
 */
(function () {
  const STORAGE_KEY = 'dsm-theme';
  const THEME_DARK = 'dark';
  const THEME_LIGHT = 'light';

  const toggleButton = document.getElementById('theme-toggle');
  if (!toggleButton) {
    return;
  }

  const icon = toggleButton.querySelector('i');
  const label = toggleButton.querySelector('.theme-toggle__text');

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

  const getStoredTheme = () => {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      console.warn('Unable to read theme from storage', error);
      return null;
    }
  };

  const storeTheme = (theme) => {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (error) {
      console.warn('Unable to store theme preference', error);
    }
  };

  const applyTheme = (theme, { persist = true } = {}) => {
    if (theme === THEME_DARK) {
      document.documentElement.setAttribute('data-theme', THEME_DARK);
    } else {
      document.documentElement.setAttribute('data-theme', THEME_LIGHT);
    }

    if (persist) {
      storeTheme(theme);
    }

    updateToggleUI(theme);
  };

  const updateToggleUI = (theme) => {
    const isDark = theme === THEME_DARK;
    toggleButton.setAttribute('aria-pressed', String(isDark));
    toggleButton.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');

    if (label) {
      label.textContent = isDark ? 'Dark' : 'Light';
    }

    if (icon) {
      icon.classList.remove('fa-moon', 'fa-sun');
      icon.classList.add(isDark ? 'fa-moon' : 'fa-sun');
    }
  };

  const initialTheme = getStoredTheme() || (prefersDark.matches ? THEME_DARK : THEME_LIGHT);
  applyTheme(initialTheme, { persist: false });

  toggleButton.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || initialTheme;
    const nextTheme = currentTheme === THEME_DARK ? THEME_LIGHT : THEME_DARK;
    applyTheme(nextTheme);
  });

  const handlePreferenceChange = (event) => {
    const storedTheme = getStoredTheme();
    if (storedTheme) {
      return;
    }
    applyTheme(event.matches ? THEME_DARK : THEME_LIGHT, { persist: false });
  };

  if (typeof prefersDark.addEventListener === 'function') {
    prefersDark.addEventListener('change', handlePreferenceChange);
  } else if (typeof prefersDark.addListener === 'function') {
    prefersDark.addListener(handlePreferenceChange);
  }
})();

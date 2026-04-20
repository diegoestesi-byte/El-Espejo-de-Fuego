(() => {
  const desktopMedia = window.matchMedia('(min-width: 901px)');
  const mobileMedia = window.matchMedia('(max-width: 900px)');
  const navHeader = document.querySelector('.nav');
  const navElement = navHeader ? navHeader.querySelector('nav') : null;
  const dropdownItems = Array.from(document.querySelectorAll('.has-dropdown'));

  if (!navHeader || !navElement) {
    return;
  }

  const closeTimers = new WeakMap();
  const closeDelayMs = 140;
  const navId = navElement.id || 'site-navigation';

  navElement.id = navId;

  const navToggle = document.createElement('button');
  navToggle.type = 'button';
  navToggle.className = 'nav-toggle';
  navToggle.setAttribute('aria-expanded', 'false');
  navToggle.setAttribute('aria-controls', navId);
  navToggle.setAttribute('aria-label', 'Abrir menú principal');
  navToggle.innerHTML = '<span class="nav-toggle-icon" aria-hidden="true"></span>';
  navHeader.insertBefore(navToggle, navElement);

  const submenuButtons = [];

  const clearCloseTimer = (item) => {
    const timerId = closeTimers.get(item);
    if (timerId) {
      window.clearTimeout(timerId);
      closeTimers.delete(item);
    }
  };

  const openDropdown = (item) => {
    clearCloseTimer(item);
    item.classList.add('is-dropdown-open');
  };

  const closeDropdown = (item) => {
    clearCloseTimer(item);
    item.classList.remove('is-dropdown-open');
  };

  const scheduleClose = (item) => {
    clearCloseTimer(item);
    const timerId = window.setTimeout(() => {
      item.classList.remove('is-dropdown-open');
      closeTimers.delete(item);
    }, closeDelayMs);
    closeTimers.set(item, timerId);
  };

  const setupDesktopBehavior = (item) => {
    item.addEventListener('mouseenter', () => openDropdown(item));
    item.addEventListener('mouseleave', () => scheduleClose(item));

    item.addEventListener('focusin', () => openDropdown(item));
    item.addEventListener('focusout', (event) => {
      if (!item.contains(event.relatedTarget)) {
        scheduleClose(item);
      }
    });
  };

  const closeAllSubmenus = () => {
    dropdownItems.forEach((item) => {
      clearCloseTimer(item);
      closeDropdown(item);
      item.classList.remove('is-submenu-open');
    });
    submenuButtons.forEach((button) => button.setAttribute('aria-expanded', 'false'));
  };

  const closeMainMenu = () => {
    navHeader.classList.remove('is-menu-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Abrir menú principal');
    closeAllSubmenus();
  };

  if (dropdownItems.length) {
    dropdownItems.forEach((item) => {
      setupDesktopBehavior(item);

      const anchor = item.querySelector(':scope > a');
      const submenu = item.querySelector(':scope > .dropdown-menu');

      if (!anchor || !submenu) {
        return;
      }

      const toggleButton = document.createElement('button');
      toggleButton.type = 'button';
      toggleButton.className = 'submenu-toggle';
      toggleButton.setAttribute('aria-expanded', 'false');
      toggleButton.setAttribute('aria-label', `Abrir submenú de ${anchor.textContent?.trim() || 'sección'}`);
      anchor.insertAdjacentElement('afterend', toggleButton);
      submenuButtons.push(toggleButton);

      toggleButton.addEventListener('click', (event) => {
        if (!mobileMedia.matches) {
          return;
        }

        event.preventDefault();
        const isOpen = item.classList.contains('is-submenu-open');

        dropdownItems.forEach((otherItem) => {
          if (otherItem === item) {
            return;
          }
          otherItem.classList.remove('is-submenu-open');
        });

        submenuButtons.forEach((button) => {
          if (button === toggleButton) {
            return;
          }
          button.setAttribute('aria-expanded', 'false');
        });

        item.classList.toggle('is-submenu-open', !isOpen);
        toggleButton.setAttribute('aria-expanded', String(!isOpen));
      });
    });
  }

  navToggle.addEventListener('click', () => {
    const isOpen = navHeader.classList.toggle('is-menu-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.setAttribute('aria-label', isOpen ? 'Cerrar menú principal' : 'Abrir menú principal');

    if (!isOpen) {
      closeAllSubmenus();
    }
  });

  navElement.addEventListener('click', (event) => {
    if (!mobileMedia.matches) {
      return;
    }

    const clickedLink = event.target instanceof Element ? event.target.closest('a') : null;
    if (!clickedLink) {
      return;
    }

    const parentItem = clickedLink.closest('.has-dropdown');
    const isTopLevelDropdownLink = Boolean(parentItem && parentItem.firstElementChild === clickedLink);
    if (!isTopLevelDropdownLink) {
      closeMainMenu();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeMainMenu();
    }
  });

  const syncByViewport = () => {
    if (desktopMedia.matches) {
      navHeader.classList.remove('is-menu-open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', 'Abrir menú principal');
      closeAllSubmenus();
      return;
    }

    closeAllSubmenus();
  };

  if (typeof desktopMedia.addEventListener === 'function') {
    desktopMedia.addEventListener('change', syncByViewport);
  } else {
    desktopMedia.addListener(syncByViewport);
  }

  syncByViewport();
})();

(() => {
  const desktopMedia = window.matchMedia('(min-width: 901px)');
  const dropdownItems = Array.from(document.querySelectorAll('.has-dropdown'));

  if (!dropdownItems.length) {
    return;
  }

  const closeTimers = new WeakMap();
  const closeDelayMs = 140;

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

  dropdownItems.forEach(setupDesktopBehavior);

  const syncByViewport = () => {
    if (desktopMedia.matches) {
      return;
    }

    dropdownItems.forEach((item) => {
      clearCloseTimer(item);
      closeDropdown(item);
    });
  };

  if (typeof desktopMedia.addEventListener === 'function') {
    desktopMedia.addEventListener('change', syncByViewport);
  } else {
    desktopMedia.addListener(syncByViewport);
  }

  syncByViewport();
})();

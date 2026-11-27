(() => {
  const root = document.documentElement;
  root.classList.add('js');
  root.style.setProperty('--motion-duration', `calc(180ms * ${getComputedStyle(root).getPropertyValue('--site-motion').trim() || '1'})`);

  const menuToggle = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('#mobile-nav');

  const closeMenu = () => {
    if (!menuToggle || !mobileNav) return;
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', '打开导航菜单');
    mobileNav.hidden = true;
  };

  menuToggle?.addEventListener('click', () => {
    const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!expanded));
    menuToggle.setAttribute('aria-label', expanded ? '打开导航菜单' : '关闭导航菜单');
    mobileNav.hidden = expanded;
  });

  mobileNav?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 820) closeMenu();
  });

  const tabs = [...document.querySelectorAll('[data-demo-tab]')];
  const panels = [...document.querySelectorAll('[data-demo-panel]')];
  const selectTab = (name) => {
    tabs.forEach((tab) => {
      const selected = tab.dataset.demoTab === name;
      tab.classList.toggle('active', selected);
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
    panels.forEach((panel) => {
      panel.hidden = panel.dataset.demoPanel !== name;
    });
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectTab(tab.dataset.demoTab));
    tab.addEventListener('keydown', (event) => {
      let nextIndex = index;
      if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
      else if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === 'Home') nextIndex = 0;
      else if (event.key === 'End') nextIndex = tabs.length - 1;
      else return;
      event.preventDefault();
      tabs[nextIndex].focus();
      selectTab(tabs[nextIndex].dataset.demoTab);
    });
  });
  selectTab(tabs[0]?.dataset.demoTab || 'status');

  const muteButtons = [...document.querySelectorAll('[data-mute]')];
  const currentMute = document.querySelector('#current-mute');
  const muteAliases = {
    '静音': 'mute',
    '哔声': 'beep',
    '700Hz 哔声': 'beep',
    '白噪': 'noise',
    '白噪声': 'noise',
    'mute': 'mute',
    'beep': 'beep',
    'noise': 'noise'
  };
  const muteLabels = { mute: '静音', beep: '哔声', noise: '白噪' };
  const muteDescriptions = {
    mute: '静音 · −80 dBFS · 命中区间完全静音',
    beep: '哔声 · 700 Hz · 命中区间播放提示音',
    noise: '白噪 · DTX 补齐 · 命中区间播放白噪声'
  };
  const modeDescription = document.querySelector('#mode-description');
  const setMute = (mode) => {
    mode = muteAliases[mode] || mode;
    if (!muteLabels[mode]) return;
    muteButtons.forEach((button) => {
      const selected = muteAliases[button.dataset.mute] === mode;
      button.classList.toggle('active', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
    if (currentMute) currentMute.textContent = muteLabels[mode];
    if (modeDescription) modeDescription.textContent = muteDescriptions[mode];
    document.querySelectorAll('[data-mode-card]').forEach((card) => {
      const selected = muteAliases[card.dataset.modeCard] === mode;
      card.classList.toggle('active', selected);
      card.setAttribute('aria-pressed', String(selected));
    });
    document.querySelectorAll('[data-footer-mute]').forEach((label) => {
      label.textContent = muteLabels[mode];
    });
  };
  muteButtons.forEach((button) => {
    button.addEventListener('click', () => setMute(button.dataset.mute));
  });
  document.querySelectorAll('[data-mode-card]').forEach((card) => {
    card.addEventListener('click', () => {
      setMute(card.dataset.modeCard);
      const demo = document.querySelector('#product-demo');
      if (demo) demo.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  });
  setMute('mute');

  const protectionToggle = document.querySelector('.protection-toggle');
  const demoStatus = document.querySelector('#demo-status');
  protectionToggle?.addEventListener('click', () => {
    const enabled = protectionToggle.getAttribute('aria-checked') !== 'true';
    protectionToggle.setAttribute('aria-checked', String(enabled));
    protectionToggle.classList.toggle('is-on', enabled);
    if (demoStatus) {
      demoStatus.textContent = enabled ? '音频链路已就绪' : '实时防护已暂停';
      demoStatus.parentElement?.classList.toggle('is-off', !enabled);
    }
  });

  const viewToggle = document.querySelector('#view-toggle');
  const heroVisual = document.querySelector('#product-demo');
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  let view3dEnabled = false;
  let tiltFrame = 0;

  const resetTilt = () => {
    window.cancelAnimationFrame(tiltFrame);
    tiltFrame = 0;
    heroVisual?.style.removeProperty('--tilt-x');
    heroVisual?.style.removeProperty('--tilt-y');
    heroVisual?.style.removeProperty('--glare-x');
    heroVisual?.style.removeProperty('--glare-y');
  };

  const setView3d = (enabled) => {
    view3dEnabled = enabled;
    heroVisual?.classList.toggle('is-3d', enabled);
    viewToggle?.setAttribute('aria-pressed', String(enabled));
    if (viewToggle) {
      viewToggle.setAttribute('aria-label', enabled ? '关闭产品界面 3D 视角' : '开启产品界面 3D 视角');
      viewToggle.title = enabled ? '关闭 3D 视角，恢复平面界面' : '开启 3D 视角后可移动鼠标转动界面';
    }
    if (!enabled || motionPreference.matches) resetTilt();
  };

  if (viewToggle && heroVisual) {
    setView3d(finePointer.matches && !motionPreference.matches);
    viewToggle.addEventListener('click', () => setView3d(!view3dEnabled));

    heroVisual.addEventListener('pointermove', (event) => {
      if (!view3dEnabled || motionPreference.matches || event.pointerType !== 'mouse') return;
      const rect = heroVisual.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
      window.cancelAnimationFrame(tiltFrame);
      tiltFrame = window.requestAnimationFrame(() => {
        heroVisual.style.setProperty('--tilt-x', `${((0.5 - y) * 10).toFixed(2)}deg`);
        heroVisual.style.setProperty('--tilt-y', `${((x - 0.5) * 14).toFixed(2)}deg`);
        heroVisual.style.setProperty('--glare-x', `${(x * 100).toFixed(1)}%`);
        heroVisual.style.setProperty('--glare-y', `${(y * 100).toFixed(1)}%`);
      });
    });

    heroVisual.addEventListener('pointerleave', resetTilt);
    heroVisual.addEventListener('pointercancel', resetTilt);
    viewToggle.addEventListener('keydown', (event) => {
      if (!view3dEnabled || !['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home'].includes(event.key)) return;
      event.preventDefault();
      if (event.key === 'Home') return resetTilt();
      const x = parseFloat(heroVisual.style.getPropertyValue('--tilt-x')) || 5;
      const y = parseFloat(heroVisual.style.getPropertyValue('--tilt-y')) || -11;
      const nextX = Math.max(-6, Math.min(6, x + (event.key === 'ArrowUp' ? 1 : event.key === 'ArrowDown' ? -1 : 0)));
      const nextY = Math.max(-10, Math.min(10, y + (event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0)));
      heroVisual.style.setProperty('--tilt-x', `${nextX}deg`);
      heroVisual.style.setProperty('--tilt-y', `${nextY}deg`);
    });
    viewToggle.addEventListener('blur', resetTilt);
    finePointer.addEventListener('change', (event) => {
      if (!event.matches) setView3d(false);
    });
    motionPreference.addEventListener('change', (event) => {
      if (event.matches) setView3d(false);
    });
  }

  let demoTimers = [];
  const runDemo = document.querySelector('#run-demo');
  const transcript = document.querySelector('#demo-transcript');
  const hitNotice = document.querySelector('#hit-notice');
  const waveform = document.querySelector('.waveform');
  const safeTranscript = '欢迎来到直播间，今天和大家分享日常办公效率。';
  const hitTranscript = '欢迎来到直播间，今天分享示例命中词的识别过程。';

  if (waveform && waveform.children.length < 64) {
    waveform.replaceChildren(...Array.from({ length: 64 }, () => document.createElement('i')));
  }
  document.querySelectorAll('.waveform i, .feature-icon span, .signal-track i').forEach((bar, index) => {
    const signal = Math.sin(index * 1.73) * Math.cos(index * .31);
    bar.style.setProperty('--h', `${Math.round(32 + signal * 27)}%`);
    bar.style.setProperty('--n', String(index));
    bar.setAttribute('aria-hidden', 'true');
  });

  const clearDemoTimers = () => {
    demoTimers.forEach(window.clearTimeout);
    demoTimers = [];
  };

  const stopDemo = () => {
    runDemo.disabled = false;
    runDemo.textContent = '播放巡查演示';
    transcript?.classList.remove('is-hit');
    if (hitNotice) hitNotice.hidden = true;
    waveform?.classList.remove('is-playing');
  };

  runDemo?.addEventListener('click', () => {
    if (!transcript) return;
    clearDemoTimers();
    selectTab('status');
    runDemo.disabled = true;
    runDemo.textContent = '正在演示声音处理…';
    waveform?.classList.add('is-playing');
    transcript.textContent = '正在采集麦克风声音，并送入本地识别链路…';
    transcript.classList.remove('is-hit');
    hitNotice.hidden = true;

    demoTimers.push(window.setTimeout(() => {
      transcript.textContent = hitTranscript;
      transcript.classList.add('is-hit');
      if (hitNotice) hitNotice.hidden = false;
    }, 1300));

    demoTimers.push(window.setTimeout(() => {
      transcript.textContent = `${safeTranscript} 命中片段已回溯处理。`;
      transcript.classList.remove('is-hit');
      hitNotice.hidden = true;
    }, 2800));

    demoTimers.push(window.setTimeout(stopDemo, 4100));
  });

  document.querySelectorAll('.word-table button').forEach((button) => {
    button.addEventListener('click', () => {
      showToast('这是界面演示，不会修改实际设备的违规词表。');
    });
  });
  document.querySelectorAll('[data-word-add], [data-word-remove]').forEach((button) => {
    button.addEventListener('click', () => {
      showToast('这是界面演示，不会修改实际设备的违规词表。');
    });
  });
  document.querySelectorAll('[data-theme-demo]').forEach((button) => {
    button.addEventListener('click', () => {
      showToast('官网展示默认的云岭青绿主题，实际主题请在桌面程序中切换。');
    });
  });

  const licenseDialog = document.querySelector('#license-dialog');
  const downloadDialog = document.querySelector('#download-dialog');
  document.querySelectorAll('[data-open-license]').forEach((button) => {
    button.addEventListener('click', () => {
      downloadDialog?.close();
      licenseDialog?.showModal();
      closeMenu();
    });
  });
  document.querySelectorAll('[data-dialog-license]').forEach((button) => {
    button.addEventListener('click', () => {
      downloadDialog?.close();
      licenseDialog?.showModal();
    });
  });
  document.querySelector('#download-button')?.addEventListener('click', () => {
    downloadDialog?.showModal();
    closeMenu();
  });

  document.querySelectorAll('.dialog-close').forEach((button) => {
    button.addEventListener('click', () => button.closest('dialog')?.close());
  });
  document.querySelectorAll('dialog').forEach((dialog) => {
    dialog.addEventListener('click', (event) => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      const outside = event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
      if (outside) dialog.close();
    });
  });

  const toast = document.querySelector('#toast');
  let toastTimer;
  function showToast(message) {
    if (!toast) return;
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.hidden = false;
    toastTimer = window.setTimeout(() => {
      toast.hidden = true;
    }, 4200);
  }

  const pageViewToggle = document.querySelector('#page-view-toggle');
  const pageSections = [...document.querySelectorAll('.section-shell')];
  let savedPageView = '';
  try {
    savedPageView = sessionStorage.getItem('liveguard-page-view') || '';
  } catch {}
  let page3dEnabled = false;
  let pageTiltFrame = 0;
  let pendingPageTilt = null;

  const clearSectionTilt = (section) => {
    section.style.removeProperty('--section-x');
    section.style.removeProperty('--section-y');
  };

  const resetPageTilt = () => {
    window.cancelAnimationFrame(pageTiltFrame);
    pageTiltFrame = 0;
    pendingPageTilt = null;
    pageSections.forEach(clearSectionTilt);
  };

  const setPageView = (enabled, persist = true) => {
    page3dEnabled = enabled;
    document.body.classList.toggle('page-3d', enabled);
    pageViewToggle?.setAttribute('aria-pressed', String(enabled));
    if (pageViewToggle) {
      pageViewToggle.setAttribute('aria-label', enabled ? '关闭整页 3D 空间视角' : '开启整页 3D 空间视角');
      pageViewToggle.title = enabled ? '关闭整页 3D，恢复平面页面' : '开启整页 3D，移动鼠标查看空间层次';
    }
    if (!enabled) resetPageTilt();
    if (persist) {
      try {
        sessionStorage.setItem('liveguard-page-view', enabled ? '3d' : 'flat');
      } catch {}
    }
  };

  if (pageViewToggle) {
    setPageView(savedPageView === '3d' ? true : savedPageView === 'flat' ? false : finePointer.matches && !motionPreference.matches, false);
    pageViewToggle.addEventListener('click', () => {
      setPageView(!page3dEnabled);
      showToast(page3dEnabled
        ? motionPreference.matches ? '整页 3D 空间视角已开启，当前为静态展示。' : '整页 3D 空间视角已开启，移动鼠标查看空间层次。'
        : '已恢复平面页面。');
    });

    pageSections.forEach((section) => {
      section.addEventListener('pointermove', (event) => {
        if (!page3dEnabled || motionPreference.matches || event.pointerType !== 'mouse') return;
        const rect = section.getBoundingClientRect();
        const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
        const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
        pendingPageTilt = { section, x, y };
        if (pageTiltFrame) return;
        pageTiltFrame = window.requestAnimationFrame(() => {
          pageTiltFrame = 0;
          if (!pendingPageTilt) return;
          const { section: target, x: pointerX, y: pointerY } = pendingPageTilt;
          target.style.setProperty('--section-x', `${((0.5 - pointerY) * 2.2).toFixed(2)}deg`);
          target.style.setProperty('--section-y', `${((pointerX - 0.5) * 3).toFixed(2)}deg`);
          pendingPageTilt = null;
        });
      });
      section.addEventListener('pointerleave', (event) => {
        if (event.pointerType !== 'mouse') return;
        clearSectionTilt(section);
        if (pendingPageTilt?.section === section) pendingPageTilt = null;
      });
    });

    window.addEventListener('scroll', () => {
      if (!page3dEnabled) return;
      window.cancelAnimationFrame(pageTiltFrame);
      pageTiltFrame = window.requestAnimationFrame(() => {
        pendingPageTilt = null;
        pageSections.forEach(clearSectionTilt);
        pageTiltFrame = 0;
      });
    }, { passive: true });
    finePointer.addEventListener('change', (event) => {
      if (!event.matches) setPageView(false);
    });
    motionPreference.addEventListener('change', (event) => {
      if (event.matches) setPageView(false);
    });
  }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealElements = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -24px' });
    revealElements.forEach((element) => observer.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add('is-visible'));
  }

  window.addEventListener('pagehide', clearDemoTimers);
})();

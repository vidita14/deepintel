(function (window) {
  const document = window.document;
  const anime = window.anime;
  const scanLine = document.querySelector('.scan-line');
  const specimen = document.querySelector('.url-specimen');
  const investigation = document.querySelector('.investigation');
  const replay = document.getElementById('replay-scan');
  const examples = document.querySelectorAll('[data-example]');
  const preference = typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : null;
  let scanAnimation;
  let investigationAnimation;
  let scanRun = 0;
  let investigationRun = 0;

  if (scanLine) {
    scanLine.style.visibility = 'hidden';
    scanLine.style.opacity = '';
  }

  function finishActiveMotion() {
    scanRun++;
    investigationRun++;
    scanAnimation?.complete?.();
    investigationAnimation?.complete?.();
    scanAnimation = investigationAnimation = null;
    if (scanLine) {
      scanLine.style.visibility = 'hidden';
      scanLine.style.opacity = '';
    }
    if (investigation) {
      investigation.style.opacity = '1';
      investigation.style.transform = 'translateY(0px)';
    }
  }

  function scan() {
    if (!scanLine || !specimen) return;
    if (preference?.matches || typeof anime?.animate !== 'function') {
      scanLine.style.visibility = 'hidden';
      scanLine.style.opacity = '';
      return;
    }
    const run = ++scanRun;
    scanAnimation?.cancel?.();
    scanLine.style.visibility = 'visible';
    scanLine.style.opacity = '1';
    scanAnimation = anime.animate(scanLine, {
      y: [0, specimen.clientHeight],
      duration: 1700,
      ease: 'inOutSine',
      onComplete: () => {
        if (run !== scanRun) return;
        scanAnimation = null;
        scanLine.style.visibility = 'hidden';
        scanLine.style.opacity = '';
      }
    });
  }

  function animateInvestigation() {
    if (!investigation || preference?.matches || typeof anime?.animate !== 'function') return;
    const run = ++investigationRun;
    investigationAnimation?.cancel?.();
    investigationAnimation = anime.animate(investigation, {
      opacity: [0.65, 1],
      y: [5, 0],
      duration: 280,
      ease: 'outQuad',
      onComplete: () => {
        if (run === investigationRun) investigationAnimation = null;
      }
    });
  }

  if (preference?.matches) finishActiveMotion();
  if (replay) replay.addEventListener('click', scan);
  for (const button of examples) button.addEventListener('click', animateInvestigation);
  scan();

  if (preference) {
    const onPreferenceChange = event => {
      if (event.matches) finishActiveMotion();
    };
    if (typeof preference.addEventListener === 'function') {
      preference.addEventListener('change', onPreferenceChange);
    } else {
      preference.addListener?.(onPreferenceChange);
    }
  }
})(window);

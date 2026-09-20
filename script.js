// Manage the clock UI, keyboard handlers, and persisted preferences
const dateEl = document.getElementById('date');
const hmEl = document.getElementById('hours-minutes');
const hoursEl = document.getElementById('hours');
const minutesEl = document.getElementById('minutes');
const secEl = document.getElementById('seconds');
const hintEl = document.getElementById('hint');
const overlayEl = document.getElementById('overlay-ui');
const fullscreenButtonEl = document.getElementById('fullscreen-button');
const controlButtons = document.querySelectorAll('.control-button');
const sizeMenuEl = document.getElementById('size-menu');
const sizeSliders = document.querySelectorAll('.size-slider');
const sizeStepButtons = document.querySelectorAll('.size-step');
const root = document.documentElement;

// Preferences keys
const PREFS_KEY = 'clock:prefs';

// Font size adjustment: each target scales its base font size defined in styles.css
const SIZE_TARGETS = {
  time:    { prefKey: 'timeScale',    cssVar: '--scale-time',    min: 0.4, max: 1.6, step: 0.02 },
  date:    { prefKey: 'dateScale',    cssVar: '--scale-date',    min: 0.4, max: 2.0, step: 0.02 },
  seconds: { prefKey: 'secondsScale', cssVar: '--scale-seconds', min: 0.4, max: 2.0, step: 0.02 }
};

const defaultPrefs = {
  theme: null,
  showSeconds: true,
  outline: false,
  outlineFillMatchesBg: false,
  timeScale: 1,
  dateScale: 1,
  secondsScale: 1
};
let prefs = { ...defaultPrefs };
let sizeMenuOpen = false;

function clampScale(target, value){
  const config = SIZE_TARGETS[target];
  if(!config) return 1;
  // null/undefined/empty values fall back to the unscaled default instead of the minimum
  if(value === null || value === undefined || value === '') return 1;
  const num = Number(value);
  if(!Number.isFinite(num)) return 1;
  // Snap to the configured step so stored values stay aligned with the sliders
  const snapped = Math.round(num / config.step) * config.step;
  return Math.min(config.max, Math.max(config.min, Number(snapped.toFixed(4))));
}

function getScale(target){
  return clampScale(target, prefs[SIZE_TARGETS[target].prefKey]);
}

function loadPrefs(){
  try{
    const raw = localStorage.getItem(PREFS_KEY);
    if(raw){ prefs = { ...defaultPrefs, ...JSON.parse(raw) } }
  }catch(e){ /* ignore */ }
  // Stored scales may be missing or out of range, so normalize them
  Object.keys(SIZE_TARGETS).forEach((target) => {
    prefs[SIZE_TARGETS[target].prefKey] = clampScale(target, prefs[SIZE_TARGETS[target].prefKey]);
  });
  initSizeMenu();
  applyPrefs();
}

function savePrefs(){
  try{ localStorage.setItem(PREFS_KEY, JSON.stringify(prefs)); }catch(e){}
}

function applyPrefs(){
  // Theme preference: null means follow system, otherwise 'light'/'dark'
  if(prefs.theme === 'dark' || prefs.theme === 'light'){
    document.documentElement.setAttribute('data-theme', prefs.theme);
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
  document.documentElement.setAttribute('data-show-seconds', prefs.showSeconds ? 'true':'false');
  document.documentElement.setAttribute('data-outline', prefs.outline ? 'true':'false');
  document.documentElement.setAttribute('data-outline-fill', prefs.outlineFillMatchesBg ? 'match-bg' : 'transparent');
  if(secEl){ secEl.setAttribute('aria-hidden', String(!prefs.showSeconds)); }
  applySizes();
  updateControlStates();
  // Update hint text to reflect current state
  if(hintEl){
    const themeState = prefs.theme || 'system';
    const secondsState = prefs.showSeconds ? 'on' : 'off';
    const outlineState = prefs.outline ? 'on' : 'off';
    const fillState = prefs.outlineFillMatchesBg ? 'bg' : 'clear';
    const sizeState = formatScale(getScale('time'));
    hintEl.innerHTML = `Press <kbd>d</kbd> theme (${themeState}) • <kbd>s</kbd> seconds (${secondsState}) • <kbd>o</kbd> outline (${outlineState}) • <kbd>i</kbd> fill (${fillState}) • <kbd>m</kbd> size menu • <kbd>-</kbd>/<kbd>+</kbd> size (${sizeState}) • tap buttons on tablet`;
  }
}

function toggleTheme(){
  if(document.documentElement.getAttribute('data-theme') === 'dark'){
    prefs.theme = 'light';
  } else if(document.documentElement.getAttribute('data-theme') === 'light'){
    prefs.theme = null; // follow system
  } else {
    prefs.theme = 'dark';
  }
  applyPrefs(); savePrefs();
}

function toggleSeconds(){
  prefs.showSeconds = !prefs.showSeconds; applyPrefs(); savePrefs();
}

function toggleOutline(){
  prefs.outline = !prefs.outline; applyPrefs(); savePrefs();
}

function toggleOutlineFill(){
  prefs.outlineFillMatchesBg = !prefs.outlineFillMatchesBg; applyPrefs(); savePrefs();
}


function formatScale(value){
  return `${Math.round(value * 100)}%`;
}

function applySizes(){
  Object.keys(SIZE_TARGETS).forEach((target) => {
    const config = SIZE_TARGETS[target];
    document.documentElement.style.setProperty(config.cssVar, String(getScale(target)));
  });
  updateSizeMenuUI();
  // Digit widths changed, so the centered colon offset needs recomputing
  updateHmHalf();
}

function initSizeMenu(){
  sizeSliders.forEach((slider) => {
    const config = SIZE_TARGETS[slider.dataset.sizeTarget];
    if(!config) return;
    slider.min = String(config.min);
    slider.max = String(config.max);
    slider.step = String(config.step);
  });
}

function updateSizeMenuUI(){
  sizeSliders.forEach((slider) => {
    const target = slider.dataset.sizeTarget;
    const config = SIZE_TARGETS[target];
    if(!config) return;
    const value = getScale(target);
    if(slider.value !== String(value)) slider.value = String(value);
    const output = document.getElementById(`size-${target}-value`);
    if(output) output.textContent = formatScale(value);
  });
  sizeStepButtons.forEach((button) => {
    const target = button.dataset.sizeTarget;
    const config = SIZE_TARGETS[target];
    if(!config) return;
    const value = getScale(target);
    const delta = Number(button.dataset.sizeStep);
    button.disabled = delta < 0 ? value <= config.min : value >= config.max;
  });
}

function setScale(target, value){
  const config = SIZE_TARGETS[target];
  if(!config) return;
  const next = clampScale(target, value);
  if(prefs[config.prefKey] === next){ updateSizeMenuUI(); return; }
  prefs[config.prefKey] = next;
  applyPrefs(); savePrefs();
}

function nudgeScale(target, steps){
  const config = SIZE_TARGETS[target];
  if(!config) return;
  setScale(target, getScale(target) + config.step * steps);
}

function resetSizes(){
  Object.keys(SIZE_TARGETS).forEach((target) => {
    prefs[SIZE_TARGETS[target].prefKey] = defaultPrefs[SIZE_TARGETS[target].prefKey];
  });
  applyPrefs(); savePrefs();
}

function setSizeMenu(open){
  sizeMenuOpen = Boolean(open);
  if(sizeMenuEl) sizeMenuEl.hidden = !sizeMenuOpen;
  updateControlStates();
  if(sizeMenuOpen) showHint();
}

function toggleSizeMenu(){
  setSizeMenu(!sizeMenuOpen);
}

function canFullscreen(){
  return Boolean(document.fullscreenEnabled && document.documentElement.requestFullscreen);
}

async function toggleFullscreen(){
  if(!canFullscreen()) return;
  try{
    if(document.fullscreenElement){
      await document.exitFullscreen();
    } else {
      await document.documentElement.requestFullscreen();
    }
  }catch(e){
    // Ignore rejected fullscreen requests.
  }
  updateControlStates();
}

function updateControlStates(){
  controlButtons.forEach((button) => {
    const action = button.dataset.action;
    if(action === 'theme'){
      button.setAttribute('aria-pressed', String(Boolean(prefs.theme)));
      button.textContent = `Theme: ${prefs.theme || 'system'}`;
    }
    if(action === 'seconds'){
      button.setAttribute('aria-pressed', String(prefs.showSeconds));
      button.textContent = `Seconds: ${prefs.showSeconds ? 'on' : 'off'}`;
    }
    if(action === 'outline'){
      button.setAttribute('aria-pressed', String(prefs.outline));
      button.textContent = `Outline: ${prefs.outline ? 'on' : 'off'}`;
    }
    if(action === 'outline-fill'){
      button.setAttribute('aria-pressed', String(prefs.outlineFillMatchesBg));
      button.textContent = `Fill: ${prefs.outlineFillMatchesBg ? 'bg' : 'clear'}`;
    }
    if(action === 'size'){
      button.setAttribute('aria-pressed', String(sizeMenuOpen));
      button.setAttribute('aria-expanded', String(sizeMenuOpen));
      button.textContent = `Size: ${formatScale(getScale('time'))}`;
    }
    if(action === 'fullscreen'){
      const available = canFullscreen();
      button.disabled = !available;
      button.setAttribute('aria-pressed', String(Boolean(document.fullscreenElement)));
      button.textContent = available
        ? `Fullscreen: ${document.fullscreenElement ? 'on' : 'off'}`
        : 'Fullscreen unavailable';
    }
  });
}

function pad(num, len=2){
  return String(num).padStart(len, '0');
}

function renderTime(){
  const now = new Date();
  const hours = pad(now.getHours());
  const minutes = pad(now.getMinutes());
  const seconds = pad(now.getSeconds());
  // yyyy/mm/dd format
  const year = now.getFullYear();
  const month = pad(now.getMonth() + 1);
  const day = pad(now.getDate());
  const formattedDate = `${year}/${month}/${day}`;

  if(hoursEl) hoursEl.textContent = hours;
  if(minutesEl) minutesEl.textContent = minutes;
  secEl.textContent = `:${seconds}`;
  dateEl.textContent = formattedDate;

  // Keep the center colon in the middle of the viewport (responsive to resize)
  updateHmHalf();
}

function updateHmHalf(){
  try{
    const rect = hmEl.getBoundingClientRect();
    const half = rect.width / 2;
    document.documentElement.style.setProperty('--hm-half', `${half}px`);
  }catch(e){}
}

// Keyboard shortcuts: 'd' toggle theme, 's' toggle seconds
window.addEventListener('keydown', (e) => {
  // Ignore when typing in an input or textarea
  const tag = (e.target && e.target.tagName) || '';
  if(['INPUT','TEXTAREA','SELECT'].includes(tag)) return;
  if(e.key === 'd'){
    toggleTheme();
    showHint();
  } else if(e.key === 's'){
    toggleSeconds();
    showHint();
  } else if(e.key === 'o'){
    toggleOutline();
    showHint();
  } else if(e.key === 'i'){
    toggleOutlineFill();
    showHint();
  } else if(e.key === 'f'){
    toggleFullscreen();
    showHint();
  } else if(e.key === 'm'){
    toggleSizeMenu();
    showHint();
  } else if(e.key === '-' || e.key === '_'){
    nudgeScale('time', -1);
    showHint();
  } else if(e.key === '+' || e.key === '='){
    nudgeScale('time', 1);
    showHint();
  } else if(e.key === '0'){
    resetSizes();
    showHint();
  } else if(e.key === 'Escape' && sizeMenuOpen){
    setSizeMenu(false);
  }
});

controlButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const action = button.dataset.action;
    if(action === 'theme') toggleTheme();
    if(action === 'seconds') toggleSeconds();
    if(action === 'outline') toggleOutline();
    if(action === 'outline-fill') toggleOutlineFill();
    if(action === 'size') toggleSizeMenu();
    if(action === 'size-reset') resetSizes();
    if(action === 'fullscreen') toggleFullscreen();
    showHint();
  });
});

sizeSliders.forEach((slider) => {
  slider.addEventListener('input', () => {
    setScale(slider.dataset.sizeTarget, slider.value);
    showHint();
  });
});

sizeStepButtons.forEach((button) => {
  button.addEventListener('click', () => {
    nudgeScale(button.dataset.sizeTarget, Number(button.dataset.sizeStep));
    showHint();
  });
});

// Recalculate HM width on resize
window.addEventListener('resize', updateHmHalf);
document.addEventListener('fullscreenchange', updateControlStates);

// Hint show/hide behavior
let hintTimer = null;
function showHint(){
  if(!hintEl || !overlayEl) return;
  overlayEl.classList.add('visible');
  overlayEl.setAttribute('aria-hidden', 'false');
  hintEl.setAttribute('aria-hidden', 'false');
  if(hintTimer) clearTimeout(hintTimer);
  hintTimer = setTimeout(hideHint, 3000);
}
function hideHint(){
  if(!hintEl || !overlayEl) return;
  // The adjustment menu needs the overlay to stay put while it is in use
  if(sizeMenuOpen) return;
  overlayEl.classList.remove('visible');
  overlayEl.setAttribute('aria-hidden', 'true');
  hintEl.setAttribute('aria-hidden', 'true');
}

['mousemove','mousedown','keydown','touchstart'].forEach(evt => {
  window.addEventListener(evt, showHint, { passive: true });
});

// Start the clock loop
function startClock(){
  renderTime();
  setInterval(renderTime, 1000);
}

// Initial config
loadPrefs(); startClock();
updateHmHalf();
showHint();

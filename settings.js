function initSettingsForOpen() {
  if(localStorage.getItem('del-anim-time') !== null) {
    const val = +localStorage.getItem('del-anim-time') / 1000;
    animationTimeSelect.value = `${val}s`;
  };
  if(localStorage.getItem('disabled-anim') === 'true') disAnimBtn.textContent = '✔️';
  else disAnimBtn.textContent = '✖️';
  if(localStorage.getItem('conf-before-delete') === 'true') confBefDelBtn.textContent = '✔️';
  else confBefDelBtn.textContent = '✖️';
  noteFontSizeSettInput.value = localStorage.getItem('notes-font-size') || 1.2;

  selectMicLang.value = localStorage.getItem('mic-lang') || 'en-US';

  settingsWrap.classList.add('show');
}

// SETTINGS
const settingsWrap = document.querySelector('.settings-wrap'),
animationTimeSelect = settingsWrap.querySelector('.animation-time-select');

const openSettingsWrapBtn = allDashboardItem.querySelector('.open-settings-wrap');
// Open
openSettingsWrapBtn.addEventListener('click', () => {
  closeAllWraps();
  settingsWrap.classList.add('show');
});

animationTimeSelect.addEventListener('change', e => {
  const msNum = parseFloat(e.target.value) * 1000;
  delAnimTime = msNum;
  localStorage.setItem('del-anim-time', msNum);
  document.documentElement.style.setProperty('--del-animation-time', `${delAnimTime / 1000}s`);
})

// Note font-size sett
const noteFontSizeSettInput = settingsWrap.querySelector('.notes-font-size-sett');
noteFontSizeSettInput.addEventListener('input', e => {
  const number = e.target.value;
  if(!e.target.value || !number) return localStorage.setItem('notes-font-size', 1.2);
  localStorage.setItem('notes-font-size', number);
})
noteFontSizeSettInput.addEventListener('blur', () => {
  let value = noteFontSizeSettInput.value;
  if(value.startsWith('.')) value = '0' + value;
  if(value.endsWith('.')) value += '0';
  localStorage.setItem('notes-font-size', value);
})

if(localStorage.getItem('disabled-anim') === 'true') document.documentElement.style.setProperty('--is-comp-anim-transition', 'none');
const disAnimBtn = settingsWrap.querySelector('.disabled-animation-sett');
disAnimBtn.addEventListener('click', e => {
  const isDis = localStorage.getItem('disabled-anim') === 'true';
  if(isDis) {
    e.target.textContent = '✖️';
    document.documentElement.style.setProperty('--is-comp-anim-transition', 'box-shadow 1s')
  }
  else {
    e.target.textContent = '✔️';
    document.documentElement.style.setProperty('--is-comp-anim-transition', 'none');
  };
  localStorage.setItem('disabled-anim', !isDis);
})

// Conf before delete sett
const confBefDelBtn = settingsWrap.querySelector('.conf-before-del-sett');
confBefDelBtn.addEventListener('click', e => {
  const isConfirm = localStorage.getItem('conf-before-delete') === 'true';
  if(isConfirm) e.target.textContent = '✖️';
  else e.target.textContent = '✔️';
  localStorage.setItem('conf-before-delete', !isConfirm);
})

// Microphone language
const selectMicLang = settingsWrap.querySelector('.select-mic-lang');
selectMicLang.addEventListener('change', () => {
  const val = selectMicLang.value;
  localStorage.setItem('mic-lang', val);
  currentMicLang = val;
})
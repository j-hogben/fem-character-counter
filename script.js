// /////////////////////////////////////////////////////////////////////////////////////////////////////
// ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ COLOR THEME SWITCH BUTTON ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~
// /////////////////////////////////////////////////////////////////////////////////////////////////////

const colorThemeButton = document.querySelector('#colorThemeButton');

colorThemeButton.addEventListener('click', handleColorThemeClick);

function handleColorThemeClick() {
  const darkModeButton = document.querySelector('.button-select-dark');
  document.documentElement.setAttribute(
    'data-theme',
    window.getComputedStyle(darkModeButton).display === 'none' ? 'light' : 'dark'
  );
}

// ////////////////////////////////////////////////////////////////////////////////////////////////////
// ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ COUNTER FORM ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~
// ////////////////////////////////////////////////////////////////////////////////////////////////////

const counterForm = document.querySelector('#counterForm');
const textarea = document.querySelector('#textToAnalyse');
const totalChars = document.querySelector('#totalChars');
const totalWords = document.querySelector('#totalWords');
const errorContainer = document.querySelector('.error');
const errorMessage = document.querySelector('#textareaErrorMessage');
const totalSentences = document.querySelector('#totalSentences');
const excludeSpaces = document.querySelector('#excludeSpaces');
const excludeSpacesLabel = document.querySelector('.excludeSpacesText');
const characterLimitButton = document.querySelector('#charLimit');
const characterLimitInput = document.querySelector('#charLimitInput');
const readTime = document.querySelector('#readTime');

// ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ EVENT LISTENERS

textarea.addEventListener('input', () => {
  handleTextareaInput(textarea.value);
});

excludeSpaces.addEventListener('change', () => {
  if (textarea.value) updateTotalChars(textarea.value);
  // If checked, show '(no spaces)' text in totalCharacters countResult box
  excludeSpacesLabel.style.display = excludeSpaces.checked ? 'inline' : 'none';
});

characterLimitButton.addEventListener('click', () => {
  if (!characterLimitButton.checked) {
    errorContainer.textContent = '';
    textarea.classList.remove('form-group__error');
  }

  handleTextareaInput(textarea.value);
});

characterLimitInput.addEventListener('input', () => {
  handleTextareaInput(textarea.value);
});

characterLimitInput.addEventListener('keydown', (e) => {
  // Remove focus from input without default 'submit' behaviour
  if (e.key === 'Enter') {
    e.preventDefault();
    characterLimitInput.blur();
  }
});

// /////////////////////////////////////////////////////////////////////////////////////////////////
// ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ COUNT RESULTS ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~
// /////////////////////////////////////////////////////////////////////////////////////////////////

function handleTextareaInput(text) {
  if (characterLimitButton.checked && characterLimitExceeded(text) === true) {
    return;
  }

  updateTotalChars(text);
  updateTotalWords(text);
  updateTotalSentences(text);
  updateReadingTime(text);
}

function updateReadingTime(string) {
  if (!textarea.value.trim()) return;

  const words = string.split(' ').filter((el) => el !== '').length;
  const averageWordsPerMinute = 238;
  const minutes = Math.floor(words / averageWordsPerMinute);

  if (minutes < 1) {
    readTime.textContent = '<1 minute';
  } else if (minutes === 1) {
    readTime.textContent = '1 minute';
  } else {
    const minTime = Math.floor(minutes * 0.9);
    const maxTime = Math.floor(minutes * 1.1);
    readTime.textContent = `${minTime} - ${maxTime} minutes`;
  }
}

function characterLimitExceeded(string) {
  const characterLimit = Number(characterLimitInput.value);
  const textToAnalyseLength = string.split('').length;

  if (!characterLimitButton.checked) {
    errorMessage.textContent = '';
    errorContainer.classList.remove('error__active');
    textarea.classList.remove('form-group__error');
    return false;
  }

  if (textToAnalyseLength <= characterLimit) {
    errorMessage.textContent = '';
    errorContainer.classList.remove('error__active');
    textarea.classList.remove('form-group__error');
    return false;
  } else {
    errorMessage.textContent = `Limit reached! Your text exceeds ${characterLimit} characters`;
    errorContainer.classList.add('error__active');
    textarea.classList.add('form-group__error');
    return true;
  }
}

function updateTotalChars(string) {
  const textAsArray = string.split('');
  const total = excludeSpaces.checked
    ? textAsArray.filter((el) => el !== ' ').length
    : textAsArray.length;
  total < 10 ? (totalChars.textContent = `0${total}`) : (totalChars.textContent = total);
}

function updateTotalWords(string) {
  const textAsArray = string.split(' ').filter((el) => el !== '');
  const total = textAsArray.length;
  total < 10 ? (totalWords.textContent = `0${total}`) : (totalWords.textContent = total);
}

function updateTotalSentences(string) {
  const textAsArray = string.trim().split(' ');
  const sentenceEnds = ['!', '?', '.'];
  const sentences = textAsArray.filter((el) => sentenceEnds.includes(el.slice(-1)));
  const lastCharOfText = textAsArray.pop().slice(-1);
  const total =
    lastCharOfText && !sentenceEnds.includes(lastCharOfText)
      ? sentences.length + 1
      : sentences.length;
  total < 10 ? (totalSentences.textContent = `0${total}`) : (totalSentences.textContent = total);
}

// ///////////////////////////////////////////////////////////////////////////////////////////////////
// ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ DENSITY RESULTS ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~
// ///////////////////////////////////////////////////////////////////////////////////////////////////

const densityResults = document.querySelector('#densityResults');
const densityItemTemplate = document.querySelector('#densityItemTemplate');
const densityResultsDefaultText = document.querySelector('#densityResultsDefaultText');

// ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ EVENT LISTENERS

textarea.addEventListener('input', () => {
  densityResultsDefaultText.style.display = textarea.value.trim() ? 'none' : 'block';

  if (characterLimitExceeded(textarea.value) === false) {
    updateDensityResults(textarea.value.toUpperCase());
  }
});

characterLimitButton.addEventListener('click', () => {
  if (!characterLimitButton.checked) updateDensityResults(textarea.value.toUpperCase());
});

// ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~

function updateDensityResults(text) {
  const densities = calculateDensityResults(text)
    .sort()
    .sort((a, b) => b[1] - a[1]);
  const totalLetters = densities.reduce((a, b) => a + b[1], 0);

  while (densityResults.firstChild) {
    densityResults.firstChild.remove();
  }

  const toBeSorted = densities.map((char) => {
    return createLetterDensityItems(char, totalLetters);
  });

  toBeSorted.forEach((obj) => {
    densityResults.appendChild(obj);
  });
}

function createLetterDensityItems(array, totalChars) {
  // the array here is each letter and it's frequency - for example ["S",1]
  const letterDensitySkeleton = document.importNode(densityItemTemplate.content, true);
  const densityItem = letterDensitySkeleton.querySelector('[data-density-item]');
  const char = letterDensitySkeleton.querySelector('[data-density-character]');
  const densityBar = letterDensitySkeleton.querySelector('[data-density-bar]');
  const frequency = letterDensitySkeleton.querySelector('[data-density-frequency]');
  const freqAsPercent = ((array[1] / totalChars) * 100).toFixed(2);

  densityItem.id = array[0];
  char.textContent = array[0];
  densityBar.style.width = `${freqAsPercent}%`;
  frequency.dataset.frequency = array[1];
  frequency.textContent = `${array[1]} (${freqAsPercent}%)`;

  return letterDensitySkeleton;
}

function calculateDensityResults(text) {
  const freq = {};

  for (let x of text) {
    if (/[a-zA-Z]/.test(x)) {
      freq[x] = (freq[x] || 0) + 1;
    }
  }
  return Object.entries(freq);
}

self.onmessage = ({ data }) => {
  const text = data.text;
  const textLng = text.length;

  const uniqueSymbols = new Set();
  let noUniqueSymbols = new Set();

  for(const symbol of text) {
    if(uniqueSymbols.has(symbol)) {
      uniqueSymbols.delete(symbol);
      noUniqueSymbols.add(symbol);
    }
    else if(noUniqueSymbols.has(symbol)) continue;
    else uniqueSymbols.add(symbol);
  }

  noUniqueSymbols = null;

  const words = Object.create(null);

  const lastAddedSubstrings = Object.create(null); // substring: j

  for (let i = 0; i < textLng; i++) {
    for(const lastAddedSubstr in lastAddedSubstrings) if(lastAddedSubstrings[lastAddedSubstr] <= i) delete lastAddedSubstrings[lastAddedSubstr];

    self.postMessage({
      type: 'progress',
      value: i+1,
      dataInfo: `${i + 1}/${textLng}`
    });

    const firstSymbol = text[i]; // No ' ' || '\n' for start
    if (
      firstSymbol === ' '
      || firstSymbol === '\n'
      || uniqueSymbols.has(firstSymbol)
    ) continue;

    // Get all substring clones
    const maxJ = Math.min(
      textLng,
      i + Math.ceil(textLng / 2) + 1
    );

    for (let j = i + 2; j <= maxJ; j++) {
      const substring = text.slice(i, j);

      const lastSymbol = text[j - 1]; // No ' ' || '\n' for end

      if(uniqueSymbols.has(lastSymbol)) break;

      if (
        lastSymbol === ' '
        || lastSymbol === '\n'
        || (
          lastAddedSubstrings[substring]
          && lastAddedSubstrings[substring] > i
        )
      ) continue;

      if (
        !words[substring]
        && text.indexOf(substring) === text.lastIndexOf(substring)
      ) break;

      if (substring.length <= text.length / 2) {
        words[substring] = (words[substring] || 0) + 1;
        lastAddedSubstrings[substring] = j;
      }
    }
  }

  const allWords = Object.keys(words);

  self.postMessage({
    type: 'progress',
    max: allWords.length,
    value: 0,
    dataInfo: `0/${allWords.length}`
  });

  let resStr = '';
  for (let i = 0; i < allWords.length; i++) {
    self.postMessage({
      type: 'progress',
      value: i + 1,
      max: allWords.length,
      dataInfo: `${i + 1}/${allWords.length}`,
    });

    const substr = allWords[i];

    if (words[substr] <= 1) continue;

    if (allWords.some(w =>
      w !== substr
      && words[w] === words[substr]
      && w.includes(substr)
    )) {
      delete words[substr];
      const popEl = allWords.pop();
      if(i < allWords.length) allWords[i] = popEl;
      i--;
      continue;
    };

    resStr += `${substr}: ${words[substr]}\n`;
  };

  self.postMessage({
    type: 'result',
    result: resStr.trim() || 'Nothing...'
  });
}
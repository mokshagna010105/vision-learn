const nlp = require('compromise');

// Filter list for common filler words and pronouns
const FILLER_WORDS = new Set([
  'okay', 'actually', 'basically', 'then', 'hmm', 'uh', 'ah', 'like', 'well', 'so',
  'today', 'tomorrow', 'yesterday', 'now', 'here', 'there',
  'just', 'really', 'very', 'this', 'that', 'these', 'those', 'it', 'they', 'them',
  'him', 'her', 'we', 'us', 'you', 'me', 'i', 'the', 'a', 'an', 'and', 'but', 'or',
  'about', 'above', 'after', 'against', 'along', 'among', 'around', 'at', 'before',
  'behind', 'below', 'beneath', 'beside', 'between', 'beyond', 'by', 'down', 'during',
  'except', 'for', 'from', 'in', 'inside', 'into', 'near', 'of', 'off', 'on', 'onto',
  'out', 'outside', 'over', 'past', 'through', 'throughout', 'to', 'toward', 'under',
  'underneath', 'until', 'up', 'upon', 'with', 'within', 'without'
]);

// Simple keyword categorizer dictionary
const CATEGORIES = {
  Science: ['photosynthesis', 'gravity', 'atom', 'molecule', 'cell', 'dna', 'organism', 'planet', 'star', 'galaxy', 'energy', 'force', 'evolution', 'dinosaur', 'volcano', 'earthquake', 'ecosystem', 'climate', 'oxygen', 'water', 'chemical', 'physics', 'biology'],
  Mathematics: ['triangle', 'fraction', 'algebra', 'geometry', 'number', 'equation', 'addition', 'subtraction', 'multiplication', 'division', 'matrix', 'angle', 'percent', 'decimal', 'ratio', 'graph', 'chart'],
  Geography: ['mountain', 'ocean', 'river', 'continent', 'country', 'capital', 'map', 'desert', 'forest', 'island', 'lake', 'glacier', 'valley', 'peninsula', 'equator', 'latitude', 'longitude'],
  Animal: ['lion', 'elephant', 'tiger', 'bear', 'wolf', 'monkey', 'gorilla', 'giraffe', 'zebra', 'kangaroo', 'dolphin', 'whale', 'shark', 'fish', 'bird', 'eagle', 'penguin', 'snake', 'frog', 'butterfly'],
  History: ['pyramid', 'castle', 'king', 'queen', 'empire', 'civilization', 'rome', 'greece', 'egypt', 'war', 'revolution', 'independence', 'colony', 'history', 'ancient']
};

/**
 * Extracts educational keywords from a text transcript
 * @param {string} text - The input text from the teacher's speech
 * @returns {Array<Object>} Array of objects with { keyword, category }
 */
const extractKeywords = (text) => {
  if (!text || typeof text !== 'string') return [];

  // Parse the text with compromise
  const doc = nlp(text);

  // We want to extract nouns and key noun phrases (e.g. "solar system", "blue whale")
  const nounPhrases = doc.match('#Adjective? #Noun+').out('array');
  const nouns = doc.nouns().out('array');
  
  // Combine and deduplicate
  const rawTerms = [...new Set([...nounPhrases, ...nouns])];
  const keywords = [];

  for (let term of rawTerms) {
    // Clean and normalize the term
    let cleanTerm = term.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").trim();

    // Strip leading/trailing filler words from multi-word phrases (e.g. "the tiger" -> "tiger")
    let words = cleanTerm.split(/\s+/).filter(Boolean);
    while (words.length > 1 && FILLER_WORDS.has(words[0])) {
      words.shift();
    }
    while (words.length > 1 && FILLER_WORDS.has(words[words.length - 1])) {
      words.pop();
    }
    cleanTerm = words.join(' ');

    // Skip short or empty terms, numbers, or filler words
    if (cleanTerm.length < 3 || /^\d+$/.test(cleanTerm) || FILLER_WORDS.has(cleanTerm)) {
      continue;
    }

    // Determine category
    let category = 'General';
    let found = false;
    for (const [catName, keywordsList] of Object.entries(CATEGORIES)) {
      for (const word of keywordsList) {
        if (cleanTerm.includes(word) || word.includes(cleanTerm)) {
          category = catName;
          found = true;
          break;
        }
      }
      if (found) break;
    }

    // Capitalize each word in keyword for nice display
    const formattedKeyword = cleanTerm
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    keywords.push({
      keyword: formattedKeyword,
      category
    });
  }

  // Filter out terms that are substrings of longer terms in the same set
  // e.g. If we have "Solar System" and "System", filter out "System"
  return keywords.filter((item, index, self) => {
    return !self.some((otherItem, otherIndex) => {
      return otherIndex !== index && 
             otherItem.keyword.toLowerCase().includes(item.keyword.toLowerCase()) && 
             otherItem.keyword.length > item.keyword.length;
    });
  });
};
module.exports = {
  extractKeywords
};
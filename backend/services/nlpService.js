
const nlp = require('compromise');

// Words that should not become standalone educational keywords.
const STOP_WORDS = new Set([
  'okay', 'actually', 'basically', 'hmm', 'uh', 'um', 'ah',
  'well', 'like', 'just', 'really', 'very', 'please',
  'today', 'tomorrow', 'yesterday', 'now', 'here', 'there',
  'thing', 'things', 'something', 'anything', 'everything',
  'someone', 'people', 'person', 'example', 'examples',
  'class', 'classroom', 'teacher', 'student', 'students',
  'lesson', 'topic', 'subject', 'question', 'answer',
  'way', 'kind', 'type', 'part', 'side', 'time',
  'one', 'two', 'three', 'first', 'second', 'third',
  'also', 'then', 'therefore', 'however', 'because',
  'i', 'me', 'my', 'mine', 'we', 'us', 'our', 'ours',
  'you', 'your', 'yours', 'he', 'him', 'his',
  'she', 'her', 'hers', 'it', 'its', 'they', 'them',
  'their', 'theirs', 'this', 'that', 'these', 'those',
  'who', 'whom', 'whose', 'which', 'what', 'when',
  'where', 'why', 'how', 'is', 'am', 'are', 'was',
  'were', 'be', 'been', 'being', 'do', 'does', 'did',
  'have', 'has', 'had', 'can', 'could', 'will', 'would',
  'shall', 'should', 'may', 'might', 'must',
  'a', 'an', 'the', 'and', 'but', 'or', 'nor',
  'if', 'of', 'at', 'by', 'for', 'from', 'in', 'into',
  'on', 'onto', 'to', 'up', 'down', 'out', 'off',
  'over', 'under', 'with', 'without', 'within',
  'about', 'after', 'before', 'between', 'through',
  'during', 'above', 'below', 'near', 'around',
  'along', 'across', 'behind', 'beside', 'beyond',
  'until', 'upon', 'per', 'as', 'than', 'so'
]);

// Known educational concepts.
// Exact phrase matching prevents accidental matches such as
// "art" inside "earth".
const CATEGORY_TERMS = {
  Science: [
    'photosynthesis', 'chlorophyll', 'sunlight', 'carbon dioxide',
    'oxygen', 'cellular respiration', 'respiration', 'plant cell',
    'animal cell', 'cell membrane', 'cell nucleus', 'cell wall',
    'mitochondria', 'chloroplast', 'DNA', 'genes', 'chromosome',
    'heredity', 'evolution', 'adaptation', 'ecosystem',
    'food chain', 'food web', 'producers', 'consumers',
    'decomposers', 'habitat', 'biodiversity', 'pollination',
    'germination', 'seed dispersal', 'life cycle',
    'water cycle', 'evaporation', 'condensation', 'precipitation',
    'water vapour', 'melting', 'freezing', 'boiling',
    'solid', 'liquid', 'gas', 'matter', 'atoms', 'atom',
    'molecules', 'molecule', 'elements', 'element',
    'chemical reaction', 'mixture', 'solution',
    'gravity', 'friction', 'magnetism', 'magnetic force',
    'force', 'motion', 'speed', 'velocity', 'acceleration',
    'energy', 'kinetic energy', 'potential energy',
    'light energy', 'sound energy', 'heat energy',
    'electricity', 'electric current', 'circuit',
    'reflection', 'refraction', 'sound waves', 'light waves',
    'solar system', 'solar energy', 'sun', 'moon', 'earth',
    'planet', 'planets', 'star', 'stars', 'galaxy', 'universe',
    'orbit', 'rotation', 'revolution', 'axis', 'phases of the moon',
    'day and night', 'seasons', 'eclipse', 'telescope',
    'volcano', 'earthquake', 'rocks', 'minerals',
    'fossils', 'dinosaur', 'dinosaurs', 'climate',
    'weather', 'atmosphere', 'air pressure', 'rainfall',
    'renewable energy', 'nonrenewable energy',
    'water pollution', 'air pollution', 'global warming',
    'greenhouse effect', 'conservation', 'environment',
    'human body', 'digestive system', 'respiratory system',
    'circulatory system', 'nervous system', 'skeleton',
    'muscles', 'heart', 'lungs', 'brain', 'stomach',
    'blood', 'bones', 'teeth', 'senses', 'nutrition',
    'balanced diet', 'vitamins', 'minerals', 'diseases',
    'microorganisms', 'bacteria', 'virus', 'fungi',
    'scientific method', 'experiment', 'observation',
    'hypothesis', 'temperature', 'thermometer'
  ],

  Mathematics: [
    'addition', 'subtraction', 'multiplication', 'division',
    'place value', 'whole numbers', 'natural numbers',
    'integers', 'negative numbers', 'positive numbers',
    'prime numbers', 'composite numbers', 'even numbers',
    'odd numbers', 'factors', 'multiples', 'greatest common divisor',
    'least common multiple', 'fractions', 'fraction',
    'proper fraction', 'improper fraction', 'mixed number',
    'equivalent fractions', 'numerator', 'denominator',
    'decimal', 'decimals', 'decimal point', 'percentage',
    'percentages', 'ratio', 'proportion', 'unitary method',
    'algebra', 'algebraic expression', 'equation',
    'linear equation', 'variable', 'constant', 'coefficient',
    'geometry', 'triangle', 'triangles', 'square', 'rectangle',
    'circle', 'circumference', 'diameter', 'radius',
    'polygon', 'quadrilateral', 'pentagon', 'hexagon',
    'angle', 'acute angle', 'right angle', 'obtuse angle',
    'straight angle', 'parallel lines', 'perpendicular lines',
    'perimeter', 'area', 'volume', 'surface area',
    'symmetry', 'reflection symmetry', 'coordinates',
    'coordinate plane', 'graph', 'bar graph', 'line graph',
    'pie chart', 'data handling', 'statistics', 'probability',
    'mean', 'median', 'mode', 'range', 'average',
    'matrix', 'matrices', 'exponent', 'powers',
    'square root', 'cube root', 'order of operations',
    'bodmas', 'pemdas', 'measurement', 'length',
    'mass', 'weight', 'time', 'distance', 'speed',
    'money', 'patterns', 'sequence', 'series',
    'three-dimensional shapes', 'two-dimensional shapes'
  ],

  Geography: [
    'earth surface', 'continents', 'continent', 'oceans', 'ocean',
    'mountains', 'mountain', 'mountain range', 'river', 'rivers',
    'lake', 'lakes', 'waterfall', 'waterfalls', 'desert', 'deserts',
    'forest', 'forests', 'rainforest', 'island', 'islands',
    'peninsula', 'valley', 'valleys', 'plateau', 'plains',
    'glacier', 'glaciers', 'volcano', 'volcanoes',
    'equator', 'latitude', 'longitude', 'hemisphere',
    'north pole', 'south pole', 'compass', 'directions',
    'map', 'maps', 'map scale', 'map symbols',
    'physical map', 'political map', 'world map',
    'country', 'countries', 'capital city', 'capital',
    'border', 'population', 'climate zone', 'weather',
    'tropical region', 'polar region', 'temperate region',
    'natural resources', 'landforms', 'erosion',
    'deposition', 'soil', 'soil erosion', 'tectonic plates',
    'plate tectonics', 'earthquake', 'earthquakes',
    'rural area', 'urban area', 'village', 'city',
    'transportation', 'agriculture', 'irrigation',
    'renewable resources', 'nonrenewable resources'
  ],

  Animal: [
    'animals', 'animal', 'mammals', 'mammal', 'birds', 'bird',
    'reptiles', 'reptile', 'amphibians', 'amphibian',
    'fish', 'insects', 'insect', 'arachnids',
    'lion', 'lions', 'elephant', 'elephants', 'tiger', 'tigers',
    'bear', 'bears', 'wolf', 'wolves', 'monkey', 'monkeys',
    'gorilla', 'giraffe', 'giraffes', 'zebra', 'zebras',
    'kangaroo', 'dolphin', 'dolphins', 'whale', 'whales',
    'blue whale', 'shark', 'sharks', 'eagle', 'eagles',
    'penguin', 'penguins', 'snake', 'snakes', 'frog', 'frogs',
    'butterfly', 'butterflies', 'honeybee', 'honeybees',
    'spider', 'spiders', 'crocodile', 'crocodiles',
    'turtle', 'turtles', 'tortoise', 'tortoises',
    'octopus', 'jellyfish', 'starfish', 'crab', 'crabs',
    'ant', 'ants', 'mosquito', 'mosquitoes', 'earthworm',
    'snail', 'snails', 'panda', 'pandas', 'fox', 'foxes',
    'deer', 'horse', 'horses', 'cow', 'cows', 'goat', 'goats',
    'sheep', 'dog', 'dogs', 'cat', 'cats', 'camel', 'camels',
    'peacock', 'parrot', 'sparrow', 'owl', 'duck', 'duckling',
    'habitat', 'predator', 'prey', 'omnivore', 'carnivore',
    'herbivore', 'vertebrates', 'invertebrates',
    'endangered species', 'extinct animals', 'migration',
    'hibernation', 'metamorphosis', 'animal adaptations',
    'life cycle of a butterfly', 'life cycle of a frog'
  ],

  History: [
    'history', 'ancient history', 'ancient civilization',
    'civilization', 'civilizations', 'indus valley civilization',
    'egyptian civilization', 'mesopotamia', 'ancient egypt',
    'ancient rome', 'ancient greece', 'roman empire',
    'egypt', 'greece', 'rome', 'pyramids', 'pyramid',
    'pharaoh', 'pharaohs', 'mummy', 'mummies',
    'castle', 'castles', 'king', 'kings', 'queen', 'queens',
    'kingdom', 'dynasty', 'emperor', 'emperor', 'empire',
    'empires', 'monarchy', 'democracy', 'republic',
    'independence', 'freedom struggle', 'revolution',
    'industrial revolution', 'french revolution',
    'world war', 'first world war', 'second world war',
    'colonialism', 'colony', 'colonies', 'trade route',
    'silk road', 'archaeology', 'archaeologist',
    'historical monument', 'monuments', 'heritage',
    'historical sources', 'timeline', 'invention',
    'inventions', 'exploration', 'explorers',
    'mahatma gandhi', 'jawaharlal nehru', 'ashoka',
    'akbar', 'shivaji', 'rani lakshmibai',
    'indus valley', 'harappan civilization',
    'constitution', 'freedom fighters'
  ]
};

// Normalize phrases consistently for comparison and display.
function normalizeTerm(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Match complete phrases, allowing flexible whitespace and punctuation.
// This prevents "art" from matching "earth".
function phraseExists(text, phrase) {
  const normalizedPhrase = normalizeTerm(phrase);
  if (!normalizedPhrase) return false;

  const parts = normalizedPhrase
    .split(' ')
    .map(escapeRegExp);

  const pattern = new RegExp(
    `(^|[^a-z0-9])${parts.join('\\s+')}($|[^a-z0-9])`,
    'i'
  );

  return pattern.test(text);
}

function titleCase(value) {
  return value.replace(/\b[a-z]/g, character =>
    character.toUpperCase()
  );
}

function getCategory(term) {
  const normalized = normalizeTerm(term);
  const words = normalized.split(' ');

  // Prefer exact known concepts and full phrases.
  for (const [category, terms] of Object.entries(CATEGORY_TERMS)) {
    if (terms.some(item => normalizeTerm(item) === normalized)) {
      return category;
    }
  }

  // Then use complete-word matching, never partial substrings.
  const matches = [];

  for (const [category, terms] of Object.entries(CATEGORY_TERMS)) {
    for (const item of terms) {
      const known = normalizeTerm(item);

      if (
        known.length >= 4 &&
        words.some(word => word === known)
      ) {
        matches.push({
          category,
          length: known.length
        });
      }
    }
  }

  if (matches.length) {
    matches.sort((a, b) => b.length - a.length);
    return matches[0].category;
  }

  return 'General';
}

/**
 * Extract educational keywords from a teacher's transcript.
 *
 * @param {string} text - Speech transcript.
 * @returns {Array<{keyword: string, category: string}>}
 */
const extractKeywords = (text) => {
  if (!text || typeof text !== 'string') {
    return [];
  }

  const originalText = text.trim();

  if (!originalText) {
    return [];
  }

  const normalizedText = normalizeTerm(originalText);
  const doc = nlp(originalText);

  // Collect multiple candidate types instead of relying on
  // a single noun phrase pattern.
  const candidates = new Set();

  const addCandidate = (value) => {
    const term = normalizeTerm(value);

    if (!term) return;

    let words = term.split(' ').filter(Boolean);

    // Remove filler words only at the edges of a phrase.
    while (words.length > 1 && STOP_WORDS.has(words[0])) {
      words.shift();
    }

    while (
      words.length > 1 &&
      STOP_WORDS.has(words[words.length - 1])
    ) {
      words.pop();
    }

    const cleaned = words.join(' ');

    if (
      cleaned.length < 3 ||
      /^\d+$/.test(cleaned) ||
      STOP_WORDS.has(cleaned) ||
      words.every(word => STOP_WORDS.has(word))
    ) {
      return;
    }

    candidates.add(cleaned);
  };

  // Multiword concepts: adjectives followed by nouns.
  doc.match('#Adjective #Noun+')
    .out('array')
    .forEach(addCandidate);

  // Noun phrases, including phrases without adjectives.
  doc.match('#Noun+')
    .out('array')
    .forEach(addCandidate);

  // Extract nouns separately as a fallback.
  doc.nouns()
    .out('array')
    .forEach(addCandidate);

  // Add known educational terms even when compromise fails
  // to recognize them as nouns or phrases.
  for (const terms of Object.values(CATEGORY_TERMS)) {
    for (const term of terms) {
      if (phraseExists(normalizedText, term)) {
        addCandidate(term);
      }
    }
  }

  // Rank candidates by phrase specificity and category knowledge.
  const ranked = [...candidates].map(term => {
    const category = getCategory(term);
    const words = term.split(' ');

    const knownConcept = Object.values(CATEGORY_TERMS)
      .some(terms =>
        terms.some(item => normalizeTerm(item) === term)
      );

    return {
      term,
      category,
      knownConcept,
      wordCount: words.length
    };
  });

  // Prefer known concepts and meaningful multiword phrases.
  ranked.sort((a, b) =>
    Number(b.knownConcept) - Number(a.knownConcept) ||
    b.wordCount - a.wordCount ||
    b.term.length - a.term.length
  );

  const selected = [];

  for (const item of ranked) {
    // A phrase should not be returned alongside its redundant
    // shorter component, e.g. "solar system" and "system".
    const redundant = selected.some(existing =>
      existing.term.includes(item.term) &&
      existing.term.length > item.term.length &&
      (
        ` ${existing.term} `
      ).includes(` ${item.term} `)
    );

    if (redundant) continue;

    selected.push(item);
  }

  // Put known educational concepts first, then return a stable
  // array compatible with the existing VisionLearn API.
  return selected.map(item => ({
    keyword: titleCase(item.term),
    category: item.category
  }));
};

module.exports = {
  extractKeywords
};

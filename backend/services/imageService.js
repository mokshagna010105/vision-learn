const axios = require('axios');

// Cache to prevent repeated searches for the same keyword
const imageCache = new Map();

/**
 * Searches Pixabay API for a keyword
 */
const searchPixabay = async (keyword) => {
  const apiKey = process.env.PIXABAY_API_KEY;
  if (!apiKey || apiKey.includes('your_')) {
    return null;
  }
  try {
    const response = await axios.get('https://pixabay.com/api/', {
      params: {
        key: apiKey,
        q: encodeURIComponent(keyword),
        image_type: 'photo',
        safesearch: 'true',
        per_page: 3
      },
      timeout: 2000
    });
    if (response.data && response.data.hits && response.data.hits.length > 0) {
      // Return the webformat URL of the first result
      return {
        url: response.data.hits[0].webformatURL,
        source: 'Pixabay'
      };
    }
  } catch (error) {
    console.error(`Pixabay search failed for "${keyword}":`, error.message);
  }
  return null;
};

/**
 * Searches Unsplash API for a keyword
 */
const searchUnsplash = async (keyword) => {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey || accessKey.includes('your_')) {
    return null;
  }
  try {
    const response = await axios.get('https://api.unsplash.com/search/photos', {
      params: {
        query: keyword,
        per_page: 3,
        orientation: 'landscape',
        content_filter: 'high' // Safe search filter
      },
      headers: {
        Authorization: `Client-ID ${accessKey}`
      },
      timeout: 2000
    });
    if (response.data && response.data.results && response.data.results.length > 0) {
      return {
        url: response.data.results[0].urls.regular,
        source: 'Unsplash'
      };
    }
  } catch (error) {
    console.error(`Unsplash search failed for "${keyword}":`, error.message);
  }
  return null;
};

/**
 * Searches Google Custom Search API for an image
 */
const searchGoogleCustom = async (keyword) => {
  const apiKey = process.env.GOOGLE_CUSTOM_SEARCH_API_KEY;
  const cx = process.env.GOOGLE_SEARCH_CX;
  if (!apiKey || apiKey.includes('your_') || !cx || cx.includes('your_')) {
    return null;
  }
  try {
    const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
      params: {
        key: apiKey,
        cx: cx,
        q: `${keyword} educational illustration`,
        searchType: 'image',
        safe: 'active',
        num: 3
      },
      timeout: 2000
    });
    if (response.data && response.data.items && response.data.items.length > 0) {
      return {
        url: response.data.items[0].link,
        source: 'Google'
      };
    }
  } catch (error) {
    console.error(`Google search failed for "${keyword}":`, error.message);
  }
  return null;
};

/**
 * Generates an image using OpenAI DALL-E API (Fallback)
 */
const generateDALLImage = async (keyword) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey.includes('your_')) {
    console.warn('OpenAI key missing. Skipping DALL-E image generation.');
    return null;
  }
  try {
  const response = await axios.post('https://api.openai.com/v1/images/generations', {
      model: 'gpt-image-1',
      prompt: `A bright, clean, child-friendly educational 3D illustration of "${keyword}", suitable for primary school classroom whiteboard presentation. Realistic, high quality, no text on image, centered focus.`,
      n: 1,
      size: '1024x1024'
    }, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      timeout: 6000
    });
    if (response.data && response.data.data && response.data.data.length > 0) {
      const imgData = response.data.data[0];
      const imageUrl = imgData.url || `data:image/png;base64,${imgData.b64_json}`;
      return {
        url: imageUrl,
        source: 'DALL-E'
      };
    }
  } catch (error) {
    console.error(`DALL-E generation failed for "${keyword}":`, error.response?.data || error.message);
  }
  return null;
};

/**
 * Primary search function that tries APIs simultaneously or sequentially, 
 * with robust public image fallbacks.
 */
const getEducationalImage = async (keyword) => {
  const cacheKey = keyword.toLowerCase().trim();
  if (imageCache.has(cacheKey)) {
    console.log(`Image Cache Hit for "${keyword}"`);
    return imageCache.get(cacheKey);
  }

  console.log(`Searching images for "${keyword}"...`);
  
  // Try parallel searches on the three APIs (handled gracefully if key missing)
  const results = await Promise.all([
    searchUnsplash(keyword),
    searchPixabay(keyword),
    searchGoogleCustom(keyword)
  ]);

  // Retrieve the first non-null result (Rank order: Unsplash, Pixabay, Google)
  let foundImage = results[0] || results[1] || results[2];

  // If no API worked (keys missing or failed), try a DALL-E fallback
  if (!foundImage) {
    console.log(`No search results. Trying AI DALL-E image generation...`);
    foundImage = await generateDALLImage(keyword);
  }

  // If DALL-E also fails (or key missing), use a beautiful, safe public Unsplash placeholder
  if (!foundImage) {
    console.log(`Using beautiful public image fallback for "${keyword}"`);
    // Safe keyword url format utilizing high-quality educational templates
    const searchTerms = encodeURIComponent(`${keyword},education`);
    foundImage = {
      url: `https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=600&auto=format&fit=crop&q=${searchTerms}`, 
      // Custom URL structure fallback
      url: `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop&text=${searchTerms}`,
      // Let's use a dynamic search engine from Unsplash that doesn't require keys for preview
      url: `https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=800&auto=format&fit=crop`, // study desk fallback
      source: 'Unsplash'
    };

    // A better way is to map common educational words to beautiful stock photos or use a dynamic source:
    const keywordsMap = {
      'photosynthesis': 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?q=80&w=800&auto=format&fit=crop', // plant
      'solar system': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop', // earth / space
      'dinosaur': 'https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?q=80&w=800&auto=format&fit=crop', // dinosaur skeleton
      'volcano': 'https://images.unsplash.com/photo-1580250785002-3c8c1e405f63?q=80&w=800&auto=format&fit=crop', // volcano eruption
      'triangle': 'https://images.unsplash.com/photo-1605870445919-838d190e8e1b?q=80&w=800&auto=format&fit=crop', // geometry
      'lion': 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?q=80&w=800&auto=format&fit=crop', // lion
      'elephant': 'https://images.unsplash.com/photo-1557050543-4b5f4e07ea49?q=80&w=800&auto=format&fit=crop', // elephant
      'gravity': 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=800&auto=format&fit=crop', // space gravity
      'pyramid': 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?q=80&w=800&auto=format&fit=crop' // pyramids
    };

    const cleanWord = keyword.toLowerCase().trim();
    if (keywordsMap[cleanWord]) {
      foundImage.url = keywordsMap[cleanWord];
    } else {
      // General fallbacks from high-quality education elements
      const studyImages = [
        'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=800&auto=format&fit=crop', // school
        'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=800&auto=format&fit=crop', // books
        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop', // study desk
        'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800&auto=format&fit=crop' // collaboration
      ];
      // Pick one randomly or deterministic based on keyword length
      const index = cleanWord.length % studyImages.length;
      foundImage.url = studyImages[index];
    }
  }

  
  // Cache and return
  imageCache.set(cacheKey, foundImage);
  return foundImage;
};

module.exports = {
  getEducationalImage,
  generateDALLImage
};

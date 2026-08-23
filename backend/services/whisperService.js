const axios = require('axios');

/**
 * Transcribes audio using OpenAI Whisper API
 * @param {Buffer} audioBuffer - The audio file buffer
 * @param {string} filename - Filename (e.g. 'speech.webm')
 * @returns {Promise<string>} Transcribed text
 */
const transcribeAudio = async (audioBuffer, filename = 'speech.webm') => {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey || apiKey.includes('your_')) {
    console.warn('OpenAI API Key is missing. Whisper transcription fallback active.');
    // Return a mock educational phrase to make the app interactive if keys are missing
    const mockPhrases = [
      "In our science class today, we are going to study the solar system and understand gravity.",
      "Look at the board: we can see a triangle, which is a key shape in mathematics.",
      "The lion is known as the king of the jungle, and it is a majestic animal.",
      "Today we will talk about the ancient pyramid in Egypt, which is a historical place.",
      "Plants create their own food through a process called photosynthesis.",
      "A volcano can erupt when magma rises to the surface of the Earth.",
      "We will explore the geography of mountains and oceans around the world."
    ];
    // Pick a random phrase
    const randomPhrase = mockPhrases[Math.floor(Math.random() * mockPhrases.length)];
    return randomPhrase;
  }

  try {
    // Node.js v18+ supports native Blob and FormData
    const blob = new Blob([audioBuffer], { type: 'audio/webm' });
    const formData = new FormData();
    formData.append('file', blob, filename);
    formData.append('model', 'whisper-1');

    console.log('Sending audio to OpenAI Whisper API...');
    const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', formData, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        // Axios handles multipart headers automatically when passing FormData
      },
      timeout: 10000
    });

    if (response.data && response.data.text) {
      return response.data.text;
    }
    
    throw new Error('No transcript returned from OpenAI');
  } catch (error) {
    console.error('Whisper transcription API failed:', error.response?.data || error.message);
    throw new Error(`Whisper failed: ${error.message}`);
  }
};

module.exports = {
  transcribeAudio
};

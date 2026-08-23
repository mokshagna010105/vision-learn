import { useState, useRef, useEffect } from 'react';
import { api } from '../services/api';

export const useSpeechToText = (sessionId, mode = 'webspeech') => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const [latestKeyword, setLatestKeyword] = useState(null);
  
  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const whisperIntervalRef = useRef(null);

  // Stop listening when unmounting
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, []);

  const startListening = async () => {
    setError('');
    setTranscript('');
    
    if (mode === 'webspeech') {
      // BROWSER-NATIVE WEB SPEECH API MODE
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setError('Browser does not support native speech recognition. Please use Chrome/Edge or switch to Whisper API mode.');
        return;
      }

      try {
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = 'en-US';

        rec.onstart = () => {
          setIsListening(true);
          console.log('WebSpeech API Listening started');
        };

        rec.onresult = async (event) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }

          if (finalTranscript) {
            // Update UI
            setTranscript((prev) => prev + ' ' + finalTranscript);
            
            // Extract keyword on final segments
            try {
              const res = await api.extractKeywords(sessionId, finalTranscript);
              if (res.data && res.data.image) {
                setLatestKeyword(res.data.keyword);
              }
            } catch (err) {
              console.error('NLP keyword extraction failed:', err.message);
            }
          }
        };

        rec.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setError(`Speech error: ${event.error}`);
        };

        rec.onend = () => {
          setIsListening(false);
          console.log('WebSpeech API Listening stopped');
        };

        recognitionRef.current = rec;
        rec.start();
      } catch (err) {
        setError(`Microphone error: ${err.message}`);
      }
    } else {
      // BACKEND OPENAI WHISPER API MODE
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Your browser does not support audio recording permissions.');
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setIsListening(true);
        console.log('Whisper Audio capture started');

        // Setup recorder
        const options = { mimeType: 'audio/webm' };
        let recorder;
        try {
          recorder = new MediaRecorder(stream, options);
        } catch (e) {
          // Fallback mimeType
          recorder = new MediaRecorder(stream);
        }

        mediaRecorderRef.current = recorder;
        audioChunksRef.current = [];

        recorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        recorder.onstop = async () => {
          if (audioChunksRef.current.length === 0) return;

          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const formData = new FormData();
          formData.append('audio', audioBlob, 'speech.webm');
          formData.append('sessionId', sessionId);

          try {
            console.log('Uploading audio chunk for Whisper transcription...');
            const res = await api.uploadSpeech(formData);
            if (res.data) {
              if (res.data.transcript) {
                setTranscript((prev) => prev + ' ' + res.data.transcript);
              }
              if (res.data.keyword) {
                setLatestKeyword(res.data.keyword);
              }
            }
          } catch (err) {
            console.error('Whisper slice upload failed:', err.message);
            setError(`Whisper Error: ${err.response?.data?.message || err.message}`);
          }

          // Reset chunks for the next loop segment
          audioChunksRef.current = [];
        };

        // Start recording
        recorder.start();

        // Slice audio files and send to Whisper every 4 seconds
        whisperIntervalRef.current = setInterval(() => {
          if (recorder.state === 'recording') {
            recorder.stop(); // Stops, triggers onstop (which uploads data), and we restart it immediately
            recorder.start();
          }
        }, 4000);

      } catch (err) {
        setError(`Microphone permission denied: ${err.message}`);
        setIsListening(false);
      }
    }
  };

  const stopListening = () => {
    // Stop WebSpeech
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    // Stop Whisper Interval and Recorder
    if (whisperIntervalRef.current) {
      clearInterval(whisperIntervalRef.current);
      whisperIntervalRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      // Stop all tracks in stream
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      mediaRecorderRef.current = null;
    }

    setIsListening(false);
  };

  return {
    isListening,
    transcript,
    error,
    latestKeyword,
    startListening,
    stopListening
  };
};

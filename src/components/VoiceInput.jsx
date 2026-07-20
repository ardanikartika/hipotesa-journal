import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, MicOff } from 'lucide-react';

export default function VoiceInput({ onTranscript, disabled }) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef('');

  useEffect(() => {
    // Check for Speech Recognition support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'id-ID'; // Indonesian

    recognition.onstart = () => {
      setIsListening(true);
      finalTranscriptRef.current = '';
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        }
      }

      // Combine all final transcripts
      if (finalTranscript) {
        finalTranscriptRef.current += finalTranscript;
        onTranscript(finalTranscriptRef.current);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'no-speech' || event.error === 'aborted') {
        return;
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      // Restart if still supposed to be listening
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          // Already started or not supported
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore
        }
      }
    };
  }, [onTranscript]);

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current || !isSupported) return;

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignore
      }
      setIsListening(false);
    } else {
      try {
        finalTranscriptRef.current = '';
        recognitionRef.current.start();
      } catch (e) {
        console.error('Failed to start recognition:', e);
      }
    }
  }, [isListening, isSupported]);

  if (!isSupported) {
    return (
      <div className="flex items-center gap-2 text-amber-400 text-sm">
        <MicOff className="w-4 h-4" />
        <span>Voice input tidak didukung browser ini</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={toggleListening}
        disabled={disabled}
        className={`relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
          isListening
            ? 'bg-rose-500 hover:bg-rose-600 shadow-lg shadow-rose-500/30'
            : 'bg-accent-500 hover:bg-accent-600 shadow-lg shadow-accent-500/30'
        }`}
      >
        {isListening ? (
          <>
            <Mic className="w-5 h-5 text-white" />
            {/* Waveform Animation */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-end gap-0.5 h-6">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className="waveform-bar w-1 bg-rose-400 rounded-full"
                  style={{ height: '4px' }}
                />
              ))}
            </div>
          </>
        ) : (
          <Mic className="w-5 h-5 text-white" />
        )}

        {/* Pulse ring when recording */}
        {isListening && (
          <span className="absolute inset-0 rounded-full border-2 border-rose-400 pulse-recording" />
        )}
      </button>

      {isListening && (
        <div className="flex items-center gap-2 text-rose-400 animate-fade-in">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
          </span>
          <span className="text-sm font-medium">Merekam...</span>
        </div>
      )}
    </div>
  );
}

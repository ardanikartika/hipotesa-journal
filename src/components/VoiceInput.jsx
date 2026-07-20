import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, MicOff } from 'lucide-react';

export default function VoiceInput({ onTranscript, disabled }) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef('');

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'id-ID';

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
      <div className="flex items-center gap-2 text-amber-400 text-sm bg-amber-500/10 px-3 py-2 rounded-xl">
        <MicOff className="w-4 h-4" />
        <span>Tidak didukung</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={toggleListening}
        disabled={disabled}
        className={`relative flex items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
          isListening
            ? 'bg-rose-600 shadow-lg shadow-rose-500/40 glow-purple'
            : 'bg-gradient-to-br from-purple-600 to-indigo-600 shadow-lg shadow-purple-500/40 hover:shadow-purple-500/60'
        }`}
      >
        {isListening ? (
          <>
            <Mic className="w-6 h-6 text-white" />
            {/* Waveform Animation */}
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-end gap-1 h-8">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="waveform-bar w-1.5 bg-rose-400 rounded-full"
                  style={{ height: '6px' }}
                />
              ))}
            </div>
          </>
        ) : (
          <Mic className="w-6 h-6 text-white" />
        )}

        {/* Pulse ring when recording */}
        {isListening && (
          <span className="absolute inset-0 rounded-2xl border-4 border-rose-400 pulse-recording" />
        )}
      </button>

      {isListening && (
        <div className="flex items-center gap-2 text-rose-400 animate-fade-in">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
          </span>
          <span className="text-sm font-semibold">Merekam...</span>
        </div>
      )}
    </div>
  );
}

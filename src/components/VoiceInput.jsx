import { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, MicOff } from 'lucide-react';

export default function VoiceInput({ onTranscript, disabled }) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef('');
  const isManualStopRef = useRef(false);

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
      isManualStopRef.current = false;
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
      if (event.error === 'no-speech' || event.error === 'aborted') {
        return;
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      if (isManualStopRef.current) {
        setIsListening(false);
        isManualStopRef.current = false;
      } else {
        try {
          recognitionRef.current?.start();
        } catch (e) {
          setIsListening(false);
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      isManualStopRef.current = true;
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
      isManualStopRef.current = true;
      try {
        recognitionRef.current.stop();
      } catch (e) {
        setIsListening(false);
      }
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
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium"
        style={{ background: 'var(--amber-100)', color: '#996633' }}
      >
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
        className={`relative w-12 h-12 rounded-xl flex items-center justify-center transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
          isListening
            ? 'shadow-lg'
            : ''
        }`}
        style={{
          background: isListening ? '#DC2626' : 'var(--emerald-900)',
          boxShadow: isListening ? '0 4px 12px rgba(220, 38, 38, 0.4)' : '0 2px 8px rgba(26, 77, 46, 0.3)'
        }}
      >
        {isListening ? (
          <>
            <Mic className="w-5 h-5 text-white" />
            {/* Waveform Animation */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-end gap-0.5 h-6">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="waveform-bar w-1 bg-white rounded-full"
                  style={{ height: '4px' }}
                />
              ))}
            </div>
          </>
        ) : (
          <Mic className="w-5 h-5 text-white" />
        )}
      </button>

      {isListening && (
        <div className="flex items-center gap-2 animate-fade-in" style={{ color: '#DC2626' }}>
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: '#DC2626' }} />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ backgroundColor: '#DC2626' }} />
          </span>
          <span className="text-sm font-medium">Tekan untuk stop</span>
        </div>
      )}
    </div>
  );
}

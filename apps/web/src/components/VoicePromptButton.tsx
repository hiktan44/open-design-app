import { useState, useRef, useEffect, useCallback } from 'react';
import { RemixIcon } from './RemixIcon';
import { useI18n } from '../i18n';

interface Props {
  onTranscript: (text: string) => void;
  className?: string;
}

// Browser Web Speech Recognition interface declaration
interface IWindow extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

export function VoicePromptButton({ onTranscript, className = '' }: Props) {
  const { locale } = useI18n();
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const win = typeof window !== 'undefined' ? (window as unknown as IWindow) : null;
    const SpeechRecognition = win?.SpeechRecognition || win?.webkitSpeechRecognition;

    if (SpeechRecognition) {
      setIsSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = locale === 'tr' ? 'tr-TR' : 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          onTranscript(finalTranscript);
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [locale, onTranscript]);

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.lang = locale === 'tr' ? 'tr-TR' : 'en-US';
        recognitionRef.current.start();
        setIsListening(true);
      } catch {
        setIsListening(false);
      }
    }
  }, [isListening, locale]);

  if (!isSupported) {
    return null; // Don't render if browser doesn't support Web Speech API
  }

  return (
    <button
      type="button"
      onClick={toggleListening}
      className={`voice-prompt-button ${className}`}
      title={isListening ? (locale === 'tr' ? 'Dinleniyor... (Durdurmak için tıkla)' : 'Listening... (Click to stop)') : (locale === 'tr' ? 'Sesli Komut Ver' : 'Voice Command')}
      aria-label="Sesli Komut"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        border: 'none',
        background: isListening ? '#ef4444' : 'transparent',
        color: isListening ? '#ffffff' : 'var(--text-muted, #6b7280)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: isListening ? '0 0 12px rgba(239, 68, 68, 0.6)' : 'none',
        animation: isListening ? 'pulse 1.5s infinite' : 'none',
      }}
    >
      <RemixIcon name={isListening ? 'mic-fill' : 'mic-line'} size={18} />
    </button>
  );
}

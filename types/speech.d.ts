interface SpeechRecognition {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start: () => void;
    stop: () => void;
    onresult: (event: SpeechRecognitionEvent) => void;
    onerror: (event: SpeechRecognitionErrorEvent) => void;
  }
  
  interface SpeechRecognitionEvent {
    results: {
      isFinal: boolean;
      [index: number]: {
        transcript: string;
        confidence: number;
      };
    }[];
  }
  
  interface SpeechRecognitionErrorEvent {
    error: string;
    message: string;
  }
  
  interface Window {
    SpeechRecognition?: typeof SpeechRecognition;
    webkitSpeechRecognition?: typeof SpeechRecognition;
  }
  
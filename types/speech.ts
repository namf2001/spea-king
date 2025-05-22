export interface PhonemeAssessment {
  phoneme: string;
  accuracyScore: number;
}

export interface SyllableAssessment {
  syllable: string;
  grapheme: string;
  accuracyScore: number;
}

export interface ProsodyFeedback {
  breakFeedback?: {
    errorTypes: string[];
    unexpectedBreak?: {
      confidence: number;
    };
    missingBreak?: {
      confidence: number;
    };
    breakLength: number;
  };
  intonationFeedback?: {
    errorTypes: string[];
    monotone?: {
      syllablePitchDeltaConfidence: number;
    };
  };
}

export interface WordAssessment {
  word: string;
  accuracyScore: number;
  errorType: string;
  duration: number;
  offset: number;
  phonemes: PhonemeAssessment[];
  syllables?: SyllableAssessment[];
  prosodyFeedback?: ProsodyFeedback;
}

export interface PronunciationAssessmentResult {
  accuracyScore: number;
  fluencyScore: number;
  completenessScore: number;
  pronunciationScore: number;
  words: WordAssessment[];
  prosodyScore?: number;
  rawData: Record<string, unknown>;
}

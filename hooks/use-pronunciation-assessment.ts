'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk';
import type { PronunciationAssessmentResult } from '@/types/speech';
import { getSpeechToken } from '@/app/actions/speech';

// Define types for word and syllable objects to avoid implicit 'any'
interface WordData {
  Word?: string;
  PronunciationAssessment?: {
    AccuracyScore?: number;
    ErrorType?: string;
    Feedback?: {
      Prosody?: {
        Break?: {
          ErrorTypes?: string[];
          UnexpectedBreak?: { Confidence?: number };
          MissingBreak?: { Confidence?: number };
          BreakLength?: number;
        };
        Intonation?: {
          ErrorTypes?: string[];
          Monotone?: {
            SyllablePitchDeltaConfidence?: number;
          };
        };
      };
    };
  };
  Duration?: number;
  Offset?: number;
  Syllables?: Array<{
    Syllable?: string;
    Grapheme?: string;
    PronunciationAssessment?: {
      AccuracyScore?: number;
    };
  }>;
  Phonemes?: Array<{
    Phoneme?: string;
    PronunciationAssessment?: {
      AccuracyScore?: number;
    };
  }>;
}

export function usePronunciationAssessment() {
  const [speechConfig, setSpeechConfig] =
    useState<SpeechSDK.SpeechConfig | null>(null);
  const [recognizer, setRecognizer] =
    useState<SpeechSDK.SpeechRecognizer | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [results, setResults] = useState<PronunciationAssessmentResult | null>(
    null,
  );
  const [error, setError] = useState<Error | null>(null);
  const [isProcessingResult, setIsProcessingResult] = useState(false);

  const resultReceivedRef = useRef(false);
  const stopRequestedRef = useRef(false);

  useEffect(() => {
    // Use the server action to get a token instead of using environment variables directly
    const initializeSpeechConfig = async () => {
      try {
        const result = await getSpeechToken();

        if (!result.success || !result.data?.token || !result.data?.region) {
          throw new Error(
            result.error?.message ??
              'Speech SDK credentials are not configured',
          );
        }

        // Create the speech config using the token (not the actual API key)
        const config = SpeechSDK.SpeechConfig.fromAuthorizationToken(
          result.data.token,
          result.data.region,
        );
        config.speechRecognitionLanguage = 'en-US';

        // Enable detailed output format for pronunciation assessment
        config.outputFormat = SpeechSDK.OutputFormat.Detailed;

        setSpeechConfig(config);
        setIsInitialized(true);
      } catch (err) {
        console.error('Failed to initialize Speech SDK:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      }
    };

    initializeSpeechConfig().catch((err) => {
      console.error('Failed to initialize Speech SDK:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    });

    return () => {
      if (recognizer) {
        recognizer.close();
      }
    };
  }, []);

  const resetResults = useCallback(() => {
    setResults(null);
    setError(null);
    resultReceivedRef.current = false;
    stopRequestedRef.current = false;
  }, []);

  // Helper function to safely extract properties - simplified to reduce complexity
  const safelyExtractProperties = (result: any): Record<string, any> => {
    // Default property names we're interested in
    const defaultPropertyNames = [
      'PronunciationAssessment_AccuracyScore',
      'PronunciationAssessment_CompletenessScore',
      'PronunciationAssessment_FluencyScore',
      'PronunciationAssessment_PronScore',
    ];

    // Create an object to store properties
    const propertiesObj: Record<string, any> = {};

    try {
      // If properties doesn't exist, return empty object
      if (!result.properties) {
        return propertiesObj;
      }

      // If it has a getProperty method (as per SDK documentation)
      if (typeof result.properties.getProperty === 'function') {
        // Try to get property names
        let propertyNames = defaultPropertyNames;

        // Only try to use keys if it exists and is a function
        if (
          result.properties.keys &&
          typeof result.properties.keys === 'function'
        ) {
          try {
            propertyNames = Array.from(result.properties.keys());
          } catch (e) {
            console.log('Could not get keys from properties:', e);
            // Fall back to default property names
          }
        }

        // Get each property
        for (const name of propertyNames) {
          try {
            propertiesObj[name] = result.properties.getProperty(name);
          } catch (e) {
            console.log(`Could not get property ${name}:`, e);
          }
        }
        return propertiesObj;
      }

      // If it's a Map-like object with entries method
      if (
        result.properties.entries &&
        typeof result.properties.entries === 'function'
      ) {
        try {
          const entries = Array.from(result.properties.entries());
          // Fix the type error by properly typing the array elements
          entries.forEach((entry) => {
            const [key, value] = entry as [string, any];
            propertiesObj[key] = value;
          });
          return propertiesObj;
        } catch (e) {
          console.log('Could not use entries method:', e);
        }
      }

      // If it's a regular object with keys
      if (Object.keys(result.properties).length > 0) {
        return { ...result.properties };
      }
    } catch (err) {
      console.error('Error extracting properties:', err);
    }

    return propertiesObj;
  };

  // Helper function to safely extract words from the result
  const safelyExtractWords = (result: any, referenceText: string) => {
    try {
      console.log('Extracting words from result:', result);

      // First try to get words from the NBest array
      if (result.json?.NBest?.[0]?.Words?.length > 0) {
        console.log('Found words in NBest array:', result.json.NBest[0].Words);

        return result.json.NBest[0].Words.map((word: WordData) => {
          // Extract prosody feedback if available
          const prosodyFeedback = word.PronunciationAssessment?.Feedback
            ?.Prosody
            ? {
                breakFeedback: {
                  errorTypes:
                    word.PronunciationAssessment.Feedback.Prosody.Break
                      ?.ErrorTypes ?? [],
                  unexpectedBreak: word.PronunciationAssessment.Feedback.Prosody
                    .Break?.UnexpectedBreak
                    ? {
                        confidence:
                          word.PronunciationAssessment.Feedback.Prosody.Break
                            .UnexpectedBreak.Confidence ?? 0,
                      }
                    : undefined,
                  missingBreak: word.PronunciationAssessment.Feedback.Prosody
                    .Break?.MissingBreak
                    ? {
                        confidence:
                          word.PronunciationAssessment.Feedback.Prosody.Break
                            .MissingBreak.Confidence ?? 0,
                      }
                    : undefined,
                  breakLength:
                    word.PronunciationAssessment.Feedback.Prosody.Break
                      ?.BreakLength ?? 0,
                },
                intonationFeedback: {
                  errorTypes:
                    word.PronunciationAssessment.Feedback.Prosody.Intonation
                      ?.ErrorTypes ?? [],
                  monotone: word.PronunciationAssessment.Feedback.Prosody
                    .Intonation?.Monotone
                    ? {
                        syllablePitchDeltaConfidence:
                          word.PronunciationAssessment.Feedback.Prosody
                            .Intonation.Monotone.SyllablePitchDeltaConfidence ??
                          0,
                      }
                    : undefined,
                },
              }
            : undefined;

          // Extract syllables if available
          const syllables = word.Syllables
            ? word.Syllables.map((syllable) => ({
                syllable: syllable.Syllable ?? '',
                grapheme: syllable.Grapheme ?? '',
                accuracyScore:
                  syllable.PronunciationAssessment?.AccuracyScore ?? 0,
              }))
            : [];

          return {
            word: word.Word ?? '',
            accuracyScore: word.PronunciationAssessment?.AccuracyScore ?? 0,
            errorType: word.PronunciationAssessment?.ErrorType ?? 'None',
            duration: word.Duration ?? 0,
            offset: word.Offset ?? 0,
            syllables,
            prosodyFeedback,
            phonemes:
              word.Phonemes?.map((phoneme) => ({
                phoneme: phoneme.Phoneme ?? '',
                accuracyScore:
                  phoneme.PronunciationAssessment?.AccuracyScore ?? 0,
              })) ?? [],
          };
        });
      }

      // If we couldn't find words in NBest, try to extract from the detailed JSON
      if (result.json?.DisplayText) {
        console.log(
          'Trying to extract words from DisplayText:',
          result.json.DisplayText,
        );

        // Split the recognized text into words
        const recognizedWords =
          result.json.DisplayText.split(/\s+/).filter(Boolean);

        // If we have pronunciation assessment results, try to match them with words
        if (recognizedWords.length > 0) {
          console.log(
            'Created fallback words from DisplayText:',
            recognizedWords,
          );

          return recognizedWords.map((word: string) => ({
            word: word,
            accuracyScore: 0, // We don't have word-level scores in this fallback
            errorType: 'None',
            duration: 0,
            offset: 0,
            phonemes: [],
            syllables: [],
          }));
        }
      }

      // Last resort: create words from the reference text
      if (referenceText) {
        console.log(
          'Creating fallback words from reference text:',
          referenceText,
        );

        const referenceWords = referenceText.split(/\s+/).filter(Boolean);
        return referenceWords.map((word: string) => ({
          word: word,
          accuracyScore: 0,
          errorType: 'None',
          duration: 0,
          offset: 0,
          phonemes: [],
        }));
      }

      // If all else fails, return an empty array
      return [];
    } catch (err) {
      console.error('Error extracting words:', err);
      return [];
    }
  };

  // Helper function to extract and process JSON data
  const processResultJson = (result: any): any => {
    if (!result.json) {
      return null;
    }

    // Extract JSON safely
    return typeof result.json === 'string'
      ? JSON.parse(result.json)
      : result.json;
  };

  // Helper function to extract words from raw JSON
  const extractWordsFromRawJson = (rawJson: any, referenceText: string) => {
    if (!rawJson?.NBest?.[0]?.Words) {
      return safelyExtractWords(rawJson, referenceText);
    }

    console.log('Found words in raw NBest array:', rawJson.NBest[0].Words);

    return rawJson.NBest[0].Words.map((word: WordData) => {
      // Extract prosody feedback if available
      const prosodyFeedback = word.PronunciationAssessment?.Feedback?.Prosody
        ? {
            breakFeedback: {
              errorTypes:
                word.PronunciationAssessment.Feedback.Prosody.Break
                  ?.ErrorTypes ?? [],
              unexpectedBreak: word.PronunciationAssessment.Feedback.Prosody
                .Break?.UnexpectedBreak
                ? {
                    confidence:
                      word.PronunciationAssessment.Feedback.Prosody.Break
                        .UnexpectedBreak.Confidence ?? 0,
                  }
                : undefined,
              missingBreak: word.PronunciationAssessment.Feedback.Prosody.Break
                ?.MissingBreak
                ? {
                    confidence:
                      word.PronunciationAssessment.Feedback.Prosody.Break
                        .MissingBreak.Confidence ?? 0,
                  }
                : undefined,
              breakLength:
                word.PronunciationAssessment.Feedback.Prosody.Break
                  ?.BreakLength ?? 0,
            },
            intonationFeedback: {
              errorTypes:
                word.PronunciationAssessment.Feedback.Prosody.Intonation
                  ?.ErrorTypes ?? [],
              monotone: word.PronunciationAssessment.Feedback.Prosody.Intonation
                ?.Monotone
                ? {
                    syllablePitchDeltaConfidence:
                      word.PronunciationAssessment.Feedback.Prosody.Intonation
                        .Monotone.SyllablePitchDeltaConfidence ?? 0,
                  }
                : undefined,
            },
          }
        : undefined;

      // Extract syllables if available
      const syllables = word.Syllables
        ? word.Syllables.map((syllable) => ({
            syllable: syllable.Syllable ?? '',
            grapheme: syllable.Grapheme ?? '',
            accuracyScore: syllable.PronunciationAssessment?.AccuracyScore ?? 0,
          }))
        : [];

      return {
        word: word.Word ?? '',
        accuracyScore: word.PronunciationAssessment?.AccuracyScore ?? 0,
        errorType: word.PronunciationAssessment?.ErrorType ?? 'None',
        duration: word.Duration ?? 0,
        offset: word.Offset ?? 0,
        syllables,
        prosodyFeedback,
        phonemes:
          word.Phonemes?.map((phoneme) => ({
            phoneme: phoneme.Phoneme ?? '',
            accuracyScore: phoneme.PronunciationAssessment?.AccuracyScore ?? 0,
          })) ?? [],
      };
    });
  };

  const startRecognition = useCallback(
    async (referenceText: string) => {
      if (!speechConfig) {
        throw new Error('Speech SDK not initialized');
      }

      try {
        // Reset state
        resetResults();
        setIsProcessingResult(false);

        // Create an audio config using the default microphone
        const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();

        // Create the speech recognizer
        const newRecognizer = new SpeechSDK.SpeechRecognizer(
          speechConfig,
          audioConfig,
        );

        // Create pronunciation assessment config with more detailed settings
        const pronunciationAssessmentConfig =
          new SpeechSDK.PronunciationAssessmentConfig(
            referenceText,
            SpeechSDK.PronunciationAssessmentGradingSystem.HundredMark,
            SpeechSDK.PronunciationAssessmentGranularity.Phoneme,
            true, // Enable miscue (detailed assessment)
          );

        // Set additional parameters for better word-level assessment
        pronunciationAssessmentConfig.enableProsodyAssessment = true;
        pronunciationAssessmentConfig.enableContentAssessmentWithTopic(
          'general',
        );

        // Apply the pronunciation assessment config
        pronunciationAssessmentConfig.applyTo(newRecognizer);

        // Handle recognition results
        newRecognizer.recognized = (s, e) => {
          console.log(
            'Recognition event received:',
            JSON.stringify(e.result, null, 2),
          );

          if (e.result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
            resultReceivedRef.current = true;

            try {
              // Check if we have a valid result with text
              if (!e.result.text || e.result.text.trim() === '') {
                console.log('Empty recognition result, skipping processing');
                return;
              }

              const pronunciationAssessmentResult =
                SpeechSDK.PronunciationAssessmentResult.fromResult(e.result);
              console.log(
                'Pronunciation assessment result:',
                pronunciationAssessmentResult,
              );

              // Safely extract properties
              const properties = safelyExtractProperties(e.result);

              // Get the raw JSON from the result
              const rawJson = processResultJson(e.result);

              console.log('Raw JSON data:', rawJson);

              // Process and extract words
              const extractedWords = extractWordsFromRawJson(
                rawJson,
                referenceText,
              );

              console.log('Final extracted words:', extractedWords);

              // Store all available raw data
              const rawData = {
                resultId: e.result.resultId || '',
                text: e.result.text || '',
                duration: e.result.duration || 0,
                offset: e.result.offset || 0,
                properties: properties,
                json: rawJson ?? e.result.json ?? {},
                pronunciationAssessment: {
                  accuracyScore:
                    pronunciationAssessmentResult.accuracyScore || 0,
                  fluencyScore: pronunciationAssessmentResult.fluencyScore || 0,
                  completenessScore:
                    pronunciationAssessmentResult.completenessScore || 0,
                  pronunciationScore:
                    pronunciationAssessmentResult.pronunciationScore || 0,
                  prosodyScore:
                    rawJson?.NBest?.[0]?.PronunciationAssessment?.ProsodyScore,
                },
              };

              // Process and format the results
              const processedResults: PronunciationAssessmentResult = {
                accuracyScore: pronunciationAssessmentResult.accuracyScore || 0,
                fluencyScore: pronunciationAssessmentResult.fluencyScore || 0,
                completenessScore:
                  pronunciationAssessmentResult.completenessScore || 0,
                pronunciationScore:
                  pronunciationAssessmentResult.pronunciationScore || 0,
                words: extractedWords,
                prosodyScore:
                  rawJson?.NBest?.[0]?.PronunciationAssessment?.ProsodyScore,
                rawData: rawData,
              };

              setResults(processedResults);

              // If stop was requested but we were waiting for results, now we can close
              if (stopRequestedRef.current) {
                console.log(
                  'Results received after stop requested, closing recognizer',
                );
                setTimeout(() => {
                  newRecognizer.close();
                  setRecognizer(null);
                  setIsProcessingResult(false);
                }, 100);
              }
            } catch (err) {
              console.error('Error processing recognition result:', err);
              setError(err instanceof Error ? err : new Error(String(err)));
              setIsProcessingResult(false);
            }
          }
        };

        newRecognizer.canceled = (s, e) => {
          console.log('Recognition canceled:', e);
          if (e.reason === SpeechSDK.CancellationReason.Error) {
            setError(
              new Error(`Speech recognition canceled: ${e.errorDetails}`),
            );
          }
          setIsProcessingResult(false);
        };

        newRecognizer.sessionStopped = (s, e) => {
          console.log('Speech recognition session stopped');
          setIsProcessingResult(false);
        };

        // Start continuous recognition
        console.log('Starting continuous recognition');
        await new Promise<void>((resolve, reject) => {
          newRecognizer.startContinuousRecognitionAsync(
            () => resolve(),
            (error: unknown) =>
              reject(error instanceof Error ? error : new Error(String(error))),
          );
        });
        setRecognizer(newRecognizer);
      } catch (err) {
        console.error('Error starting speech recognition:', err);
        setIsProcessingResult(false);
        throw err;
      }
    },
    [speechConfig, resetResults],
  );

  const stopRecognition = useCallback(async () => {
    if (recognizer) {
      try {
        console.log('Stopping recognition and waiting for results');
        setIsProcessingResult(true);
        stopRequestedRef.current = true;

        // Force a final recognition result by stopping continuous recognition
        await new Promise<void>((resolve, reject) => {
          recognizer.stopContinuousRecognitionAsync(
            () => resolve(),
            (error: unknown) =>
              reject(error instanceof Error ? error : new Error(String(error))),
          );
        });

        // If we haven't received any results yet, wait a bit
        if (!resultReceivedRef.current) {
          console.log('No results received yet, waiting before closing');
          // Wait for a short time to see if results come in
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // If we still don't have results, we need to close anyway
          if (!resultReceivedRef.current) {
            console.log(
              'No results received after waiting, closing recognizer',
            );
            recognizer.close();
            setRecognizer(null);
            setIsProcessingResult(false);

            // Create fallback results with reference text
            const referenceText = recognizer.properties.getProperty(
              'ReferenceText',
              '',
            );
            if (referenceText) {
              const fallbackWords = referenceText
                .split(/\s+/)
                .filter(Boolean)
                .map((word) => ({
                  word,
                  accuracyScore: 0,
                  errorType: 'None',
                  duration: 0,
                  offset: 0,
                  phonemes: [],
                }));

              setResults({
                accuracyScore: 0,
                fluencyScore: 0,
                completenessScore: 0,
                pronunciationScore: 0,
                words: fallbackWords,
                rawData: { fallback: true, message: 'No speech detected' },
              });
            } else {
              setError(
                new Error(
                  'No speech was detected. Please try again and speak clearly.',
                ),
              );
            }
          }
        } else {
          // We already have results, so we can close
          console.log('Results already received, closing recognizer');
          recognizer.close();
          setRecognizer(null);
          setIsProcessingResult(false);
        }
      } catch (err) {
        console.error('Error stopping speech recognition:', err);
        setIsProcessingResult(false);
        throw err;
      }
    }
  }, [recognizer]);

  return {
    startRecognition,
    stopRecognition,
    results,
    error,
    isInitialized,
    resetResults,
    isProcessingResult,
  };
}

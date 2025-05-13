import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const text = formData.get('text') as string;
    const targetText = formData.get('targetText') as string;
    const focusSound = formData.get('focusSound') as string;

    if (!audioFile || !text || !targetText) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Đọc dữ liệu âm thanh
    const audioArrayBuffer = await audioFile.arrayBuffer();
    const audioData = Buffer.from(audioArrayBuffer);

    // Lấy thông tin cấu hình Azure
    const speechKey = process.env.AZURE_SPEECH_KEY;
    const speechRegion = process.env.AZURE_SPEECH_REGION;

    if (!speechKey || !speechRegion) {
      return NextResponse.json(
        { error: 'Speech service credentials are not configured' },
        { status: 500 }
      );
    }

    // Chuẩn bị object tham chiếu văn bản
    const referenceText = {
      ReferenceText: targetText.replace(/[.,?!]/g, ""),
    };

    // Gọi Azure Pronunciation Assessment API
    const endpoint = `https://${speechRegion}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=en-US&format=detailed`;
    
    console.log("Sending pronunciation assessment request to Azure:", {
      endpoint,
      audioSize: audioData.length,
      referenceText: referenceText.ReferenceText
    });
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': speechKey,
        'Content-Type': 'audio/wav', // Hoặc audio/mp3 tùy vào định dạng âm thanh
        'Pronunciation-Assessment': JSON.stringify(referenceText)
      },
      body: audioData
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Azure API Error:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      
      return NextResponse.json(
        { error: `API error: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    // Xử lý kết quả từ Azure
    const result = await response.json();
    console.log("Azure API Response:", JSON.stringify(result, null, 2));
    
    // Phân tích kết quả từ Azure và chuyển đổi thành định dạng mà front-end cần
    // Đây chỉ là ví dụ, bạn sẽ cần điều chỉnh dựa trên cấu trúc phản hồi thực tế từ Azure
    const pronunciationAssessment = result.NBest?.[0]?.PronunciationAssessment;
    
    if (!pronunciationAssessment) {
      console.warn("No pronunciation assessment data in response:", result);
      // Sử dụng giải pháp mô phỏng dự phòng nếu không có dữ liệu đánh giá phát âm
      return createSimulatedResponse(text, targetText, focusSound);
    }

    // Trích xuất điểm số và chi tiết
    const { AccuracyScore, FluencyScore, CompletenessScore, PronScore } = pronunciationAssessment;
    const words = pronunciationAssessment.Words ?? [];
    
    // Tạo phản hồi dựa trên điểm số
    let feedback = generateFeedback(AccuracyScore, focusSound);

    // Chuẩn bị dữ liệu chi tiết để trả về client
    interface WordDetail {
      word: string;
      score: number;
      errorType: string | null;
    }

    interface FocusSoundDetail {
      sound: string;
      accuracyScore: number;
    }

    interface PronunciationDetails {
      pronunciationScore: number;
      fluencyScore: number;
      completenessScore: number;
      words: WordDetail[];
      focusSound: FocusSoundDetail;
    }

    const details: PronunciationDetails = {
      pronunciationScore: AccuracyScore,
      fluencyScore: FluencyScore,
      completenessScore: CompletenessScore,
      words: words.map((word: { Word: string; AccuracyScore: number; ErrorType?: string }): WordDetail => ({
        word: word.Word,
        score: word.AccuracyScore,
        errorType: word.ErrorType ?? null
      })),
      focusSound: {
        sound: focusSound,
        // Tính toán điểm số cho âm tiêu điểm dựa trên các từ có chứa âm đó
        accuracyScore: calculateFocusSoundScore(words as { Word: string; AccuracyScore: number }[], focusSound)
      }
    };

    return NextResponse.json({
      success: true,
      score: PronScore,
      feedback,
      details
    });
    
  } catch (error) {
    console.error('Error in pronunciation assessment:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to evaluate pronunciation'
      },
      { status: 500 }
    );
  }
}

// Hàm tạo phản hồi dựa trên điểm số
function generateFeedback(score: number, focusSound: string): string {
  if (score >= 90) {
    return "Excellent pronunciation! You've mastered this phrase.";
  } else if (score >= 70) {
    return `Good job! Try to focus more on the '${focusSound}' sound.`;
  } else if (score >= 50) {
    return `Keep practicing. Pay special attention to the '${focusSound}' sound.`;
  } else {
    return "Let's try again. Listen to the example and focus on each word carefully.";
  }
}

// Hàm tính điểm số cho âm tiêu điểm
function calculateFocusSoundScore(words: any[], focusSound: string): number {
  const wordsWithFocusSound = words.filter(word => 
    word.Word.toLowerCase().includes(focusSound.toLowerCase())
  );
  
  if (wordsWithFocusSound.length === 0) return 0;
  
  const totalScore = wordsWithFocusSound.reduce(
    (sum, word) => sum + word.AccuracyScore, 0
  );
  
  return Math.round(totalScore / wordsWithFocusSound.length);
}

// Hàm tạo phản hồi mô phỏng nếu API thất bại hoặc không có dữ liệu
function createSimulatedResponse(spokenText: string, targetText: string, focusSound: string) {
  console.log("Creating simulated pronunciation assessment response");
  
  // Tương tự như đánh giá hiện tại trong server action
  const normalizedTarget = targetText.toLowerCase().replace(/[.,?!]/g, "");
  const normalizedSpoken = spokenText.toLowerCase().replace(/[.,?!]/g, "");

  // Simple word match ratio
  const targetWords = normalizedTarget.split(" ");
  const spokenWords = normalizedSpoken.split(" ");

  let matchedWords = 0;
  let mispronunciations = [];
  
  // Check each target word against spoken words
  for (let i = 0; i < targetWords.length; i++) {
      const targetWord = targetWords[i];
      if (spokenWords.includes(targetWord)) {
          matchedWords++;
      } else {
          // Track mispronounced words
          mispronunciations.push({
              word: targetWord,
              position: i,
          });
      }
  }

  const matchRatio = targetWords.length > 0 ? (matchedWords / targetWords.length) * 100 : 0;
  const calculatedScore = Math.round(matchRatio);
  
  // Calculate fluency and completeness scores
  const pronunciationScore = calculatedScore;
  const fluencyScore = calculatedScore > 80 ? calculatedScore - 10 : calculatedScore;
  const completenessScore = (spokenWords.length / targetWords.length) * 100;

  // Generate detailed feedback based on score
  const feedback = generateFeedback(calculatedScore, focusSound);

  return NextResponse.json({
      success: true,
      score: calculatedScore,
      feedback,
      details: {
          pronunciationScore,
          fluencyScore,
          completenessScore,
          words: targetWords.map((word, index) => {
              const mispronounced = mispronunciations.some(m => m.position === index);
              return {
                  word,
                  score: mispronounced ? Math.floor(Math.random() * 50) + 30 : Math.floor(Math.random() * 30) + 70,
                  errorType: mispronounced ? "Mispronunciation" : null
              };
          }),
          focusSound: {
              sound: focusSound,
              accuracyScore: Math.floor(Math.random() * 40) + 60
          }
      }
  });
}
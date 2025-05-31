# Sơ đồ Quan hệ Cơ sở Dữ liệu - Hệ thống Quản lý Người dùng

## Mô tả

Sơ đồ dưới đây mô tả mối quan hệ giữa các bảng trong cơ sở dữ liệu của ứng dụng.

```mermaid
erDiagram
    User {
        string id PK
        string name
        string email UK
        datetime emailVerified
        string image
        enum role
    }

    Account {
        string id PK
        string userId FK
        string type
        string provider
        string providerAccountId UK
        string refresh_token
        string access_token
        int expires_at
        string token_type
        string scope
        string id_token
        string session_state
    }

    Session {
        string id PK
        string sessionToken UK
        string userId FK
        datetime expires
    }

    PronunciationLesson {
        string id PK
        string title
        string userId FK
        datetime createdAt
        datetime updatedAt
    }

    PronunciationWord {
        string id PK
        string word UK
        datetime createdAt
        datetime updatedAt
    }

    PronunciationLessonWord {
        string id PK
        string lessonId FK
        string wordId FK
    }

    ReflexQuestion {
        string id PK
        string question
        string answer
        string userId FK
        datetime createdAt
        datetime updatedAt
    }

    UserSpeakingRecord {
        string id PK
        string userId FK
        string conversationTopicId FK
        string reflexQuestionId FK
        int duration
        datetime createdAt
    }

    ConversationTopic {
        string id PK
        string title
        string description
        string userId FK
        datetime createdAt
        datetime updatedAt
    }

    VocabularyExercise {
        string id PK
        string title
        string description
        string userId FK
        datetime createdAt
        datetime updatedAt
    }

    VocabularyPair {
        string id PK
        string englishWord
        string vietnameseWord
        string exerciseId FK
        datetime createdAt
    }

    ExerciseResult {
        string id PK
        string userId FK
        string exerciseId FK
        int score
        int timeSpent
        int attempts
        datetime completedAt
    }

    User ||--o{ Account : "has"
    User ||--o{ Session : "has"
    User ||--o{ PronunciationLesson : "creates"
    User ||--o{ ReflexQuestion : "creates"
    User ||--o{ UserSpeakingRecord : "records"
    User ||--o{ ConversationTopic : "creates"
    User ||--o{ VocabularyExercise : "creates"
    User ||--o{ ExerciseResult : "has"

    PronunciationLesson ||--o{ PronunciationLessonWord : "contains"
    PronunciationWord ||--o{ PronunciationLessonWord : "used in"

    VocabularyExercise ||--o{ VocabularyPair : "contains"
    VocabularyExercise ||--o{ ExerciseResult : "tracks"

    ReflexQuestion ||--o{ UserSpeakingRecord : "answered in"

    ConversationTopic ||--o{ UserSpeakingRecord : "discussed in"
```

## Giải thích Các Quan hệ

### Người dùng và Xác thực

- Một **User** có thể có nhiều **Account** (xác thực bên thứ 3)
- Một **User** có thể có nhiều **Session** (phiên đăng nhập)

### Người dùng và Nội dung

- Một **User** có thể tạo nhiều **PronunciationLesson** (bài học phát âm)
- Một **User** có thể tạo nhiều **ReflexQuestion** (câu hỏi phản xạ)
- Một **User** có thể tạo nhiều **ConversationTopic** (chủ đề hội thoại)
- Một **User** có thể tạo nhiều **VocabularyExercise** (bài tập từ vựng)

### Người dùng và Tiến độ

- Một **User** có thể có nhiều **ExerciseResult** (kết quả bài tập)
- Một **User** có thể ghi lại nhiều **UserSpeakingRecord** (lịch sử nói)

### Bài tập và Câu hỏi

- Một **VocabularyExercise** chứa nhiều **VocabularyPair** (cặp từ vựng)
- Một **VocabularyExercise** có thể có nhiều **ExerciseResult** (kết quả)

### Phiên học

- Một **ReflexQuestion** có thể được trả lời trong nhiều **UserSpeakingRecord**
- Một **ConversationTopic** có thể được thảo luận trong nhiều **UserSpeakingRecord**

## Các Enum

- **Role**: USER, ADMIN

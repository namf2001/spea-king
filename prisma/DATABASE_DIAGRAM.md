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
        string password
        string image
        enum role
    }
    
    Account {
        string id PK
        string userId FK
        string type
        string provider
        string providerAccountId
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
    
    VerificationToken {
        string identifier
        string token
        datetime expires
    }
    
    UserPreference {
        string id PK
        string userId FK "UK"
        string learningLanguage
        string nativeLanguage
        boolean notificationsEnabled
        boolean speechRecognitionEnabled
    }
    
    ExerciseResult {
        string id PK
        enum exerciseType
        int questionId
        float accuracy
        float responseTime
        datetime date
        string userId FK
        string exerciseId FK
    }
    
    CustomLesson {
        string id PK
        string title
        string description
        json content
        boolean isPublic
        datetime createdAt
        datetime updatedAt
        string userId FK
    }
    
    Exercise {
        string id PK
        string title
        string description
        enum type
        enum difficulty
        json content
        datetime createdAt
        datetime updatedAt
        string createdBy FK
        boolean isPublic
    }
    
    Question {
        string id PK
        string exerciseId FK
        string content
        string answer
        json options
    }
    
    Progress {
        string id PK
        string userId FK
        string exerciseId FK
        datetime completedAt
        float score
        float bestScore
        int completionCount
    }
    
    Achievement {
        string id PK
        string name
        string description
        json criteria
        string image
    }
    
    UserAchievement {
        string id PK
        string userId FK
        string achievementId FK
        datetime unlockedAt
    }
    
    StudySession {
        string id PK
        string userId FK
        datetime startTime
        datetime endTime
        int duration
    }
    
    ActivityLog {
        string id PK
        string sessionId FK
        string activityType
        string entityId
        string entityType
        datetime timestamp
        json metadata
    }
    
    User ||--o{ Account : "has"
    User ||--o{ Session : "has"
    User ||--o{ ExerciseResult : "has"
    User ||--o{ CustomLesson : "creates"
    User ||--o{ Exercise : "creates"
    User ||--o{ Progress : "tracks"
    User ||--o{ UserAchievement : "earns"
    User ||--o{ StudySession : "has"
    User ||--|| UserPreference : "has"
    
    Exercise ||--o{ Question : "contains"
    Exercise ||--o{ ExerciseResult : "has"
    Exercise ||--o{ Progress : "tracks"
    
    Achievement ||--o{ UserAchievement : "awarded as"
    
    StudySession ||--o{ ActivityLog : "records"
```

## Giải thích Các Quan hệ

### Người dùng và Xác thực
- Một **User** có thể có nhiều **Account** (xác thực bên thứ 3)
- Một **User** có thể có nhiều **Session** (phiên đăng nhập)
- Mỗi **User** có chính xác một **UserPreference** (thiết lập người dùng)

### Người dùng và Nội dung
- Một **User** có thể tạo nhiều **CustomLesson** (bài học tùy chỉnh)
- Một **User** có thể tạo nhiều **Exercise** (bài tập)
- Một **User** có thể có nhiều **ExerciseResult** (kết quả bài tập)

### Người dùng và Tiến độ
- Một **User** có thể có nhiều **Progress** (tiến độ học tập)
- Một **User** có thể đạt được nhiều **UserAchievement** (thành tích)
- Một **User** có thể có nhiều **StudySession** (phiên học tập)

### Bài tập và Câu hỏi
- Một **Exercise** chứa nhiều **Question** (câu hỏi)
- Một **Exercise** có thể có nhiều **ExerciseResult** (kết quả)
- Một **Exercise** có thể có nhiều **Progress** (tiến độ học tập)

### Thành tích
- Một **Achievement** có thể được cấp cho nhiều người dùng qua **UserAchievement**

### Phiên học
- Một **StudySession** ghi lại nhiều **ActivityLog** (hoạt động học tập)

## Các Enum
- **Role**: USER, ADMIN
- **ExerciseType**: REFLEX, PRONUNCIATION, VOCABULARY, GRAMMAR, LISTENING, SPEAKING
- **Difficulty**: EASY, MEDIUM, HARD
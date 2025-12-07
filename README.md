## 1. Project setup

### Prerequisites

- Node version:
- DB:
- ## API keys
  -

### Install steps

### How to run everything locally

---

## 2. Tech Stack

- Frontend: React + Vite + Tailwind CSS
- Backend: Express, SQLite
- AI: Open AI
- Key libraries

---

# 3. API documentation

### Base URL

`http://localhost:5000`

### Health Check

| Method | Endpoint  | Description         | Request Body | Response                                         |
| ------ | --------- | ------------------- | ------------ | ------------------------------------------------ |
| `GET`  | `/health` | Server health check | None         | `{ status: "ok", message: "Server is running" }` |

---

### Task Endpoints (`/api/tasks`)

| Method   | Endpoint         | Description     | Request Body                                             | Response                          |
| -------- | ---------------- | --------------- | -------------------------------------------------------- | --------------------------------- |
| `GET`    | `/api/tasks`     | Get all tasks   | None                                                     | `{ success: true, data: Task[] }` |
| `GET`    | `/api/tasks/:id` | Get task by ID  | None                                                     | `{ success: true, data: Task }`   |
| `POST`   | `/api/tasks`     | Create new task | `{ title, description?, priority, status, dueDate? }`    | `{ success: true, data: Task }`   |
| `PUT`    | `/api/tasks/:id` | Update task     | `{ title?, description?, priority?, status?, dueDate? }` | `{ success: true, data: Task }`   |
| `DELETE` | `/api/tasks/:id` | Delete task     | None                                                     | `{ success: true }`               |

### Task Object

```typescript
{
  id: string
  title: string
  description?: string
  status: "To Do" | "In Progress" | "Done"
  priority: "Low" | "Medium" | "High" | "Urgent"
  dueDate?: string (ISO datetime)
  createdAt: string (ISO datetime)
  updatedAt: string (ISO datetime)
}
```

### Voice Endpoints (`/api/voice`)

| Method | Endpoint                | Description                                | Request Body                | Response                                                                    |
| ------ | ----------------------- | ------------------------------------------ | --------------------------- | --------------------------------------------------------------------------- |
| `POST` | `/api/voice/transcribe` | Transcribe audio + parse task fields       | `FormData: { audio: File }` | `{ success: true, data: { transcript: string, parsed: ParsedTaskFields } }` |
| `POST` | `/api/voice/parse`      | Parse transcript into task fields (legacy) | `{ transcript: string }`    | `{ success: true, data: { transcript: string, parsed: ParsedTaskFields } }` |

### ParsedTaskFields

```typescript
{
  title: string
  description?: string
  priority: "Low" | "Medium" | "High" | "Urgent"
  status: "To Do" | "In Progress" | "Done"
  dueDate?: string (ISO datetime)
}
```

### Notes

- `/api/voice/transcribe` is the primary endpoint for voice task creation (combines transcription + parsing)
- `/api/voice/parse` is kept for backward compatibility but not actively used in the current frontend
- All endpoints return errors in format: `{ success: false, error: string, details?: string }`
- Audio files must be uploaded as multipart/form-data with field name `"audio"`

---

# 4. Decisions & Assumptions

### Decisions

- . Open AI platform used for audio transcription (`whisper-1`) and parsing and understanding (`gpt-3.5-turbo`).

### Voice-Based Task Creation Flow

```mermaid
sequenceDiagram
    participant User
    participant VoiceModal
    participant useVoiceRecorder
    participant Frontend API
    participant Backend
    participant Whisper API
    participant GPT API
    participant Database

    User->>VoiceModal: Click "Create with Voice"
    VoiceModal->>VoiceModal: Open modal (Recording step)

    User->>VoiceModal: Click "Start Recording"
    VoiceModal->>useVoiceRecorder: startRecording()
    useVoiceRecorder->>useVoiceRecorder: Access microphone (Web Audio API)
    useVoiceRecorder-->>VoiceModal: Recording...

    User->>VoiceModal: Click "Stop Recording"
    VoiceModal->>useVoiceRecorder: stopRecording()
    useVoiceRecorder-->>VoiceModal: audioBlob (WebM format)

    VoiceModal->>VoiceModal: Set step = "transcribing"
    VoiceModal->>Frontend API: processVoiceRecording(audioBlob)
    Frontend API->>Backend: POST /api/voice/transcribe (multipart/form-data)

    Backend->>Whisper API: Transcribe audio
    Whisper API-->>Backend: transcript (text)

    Backend->>GPT API: Parse transcript (extract task fields)
    GPT API-->>Backend: parsed fields (title, priority, status, dueDate)

    Backend-->>Frontend API: { transcript, parsed }
    Frontend API-->>VoiceModal: { transcript, parsed }

    VoiceModal->>VoiceModal: Set step = "reviewing"
    VoiceModal->>User: Display editable form (transcript + parsed fields)

    alt User edits and creates
        User->>VoiceModal: Edit fields (optional)
        User->>VoiceModal: Click "Create Task"
        VoiceModal->>VoiceModal: Set step = "creating"
        VoiceModal->>Frontend API: createTask(taskData)
        Frontend API->>Backend: POST /api/tasks
        Backend->>Database: Save task
        Database-->>Backend: Task created
        Backend-->>Frontend API: { success: true, data: Task }
        Frontend API-->>VoiceModal: Task created
        VoiceModal->>VoiceModal: Close modal & refresh tasks
    else User wants to re-record
        User->>VoiceModal: Click "Record Again"
        VoiceModal->>VoiceModal: Reset to Recording step
    end
```

### State Flow Diagram

```mermaid
stateDiagram-v2
    [*] --> ModalClosed
    ModalClosed --> Recording: Click "Create with Voice"

    Recording --> Recording: Start Recording
    Recording --> Transcribing: Stop Recording
    Recording --> ModalClosed: Close Modal

    Transcribing --> Reviewing: Success (got transcript + parsed)
    Transcribing --> Recording: Error (retry)

    Reviewing --> Creating: Click "Create Task"
    Reviewing --> Recording: Click "Record Again"
    Reviewing --> ModalClosed: Close Modal

    Creating --> ModalClosed: Success
    Creating --> Reviewing: Error (retry)

    ModalClosed --> [*]

```

### Component Interaction Flow

```mermaid

flowchart TD
    A[User] -->|Click| B[KanbanBoard]
    B -->|Opens| C[VoiceModal]
    C -->|Uses| D[useVoiceRecorder Hook]
    D -->|Captures| E[Audio Blob]

    E -->|Sends to| F[Frontend API<br/>processVoiceRecording]
    F -->|POST /api/voice/transcribe| G[Backend Controller]

    G -->|Transcribe| H[SpeechToTextService<br/>OpenAI Whisper]
    H -->|Returns| I[Transcript Text]

    I -->|Parse| J[LLMService<br/>OpenAI GPT]
    J -->|Returns| K[Parsed Task Fields]

    K -->|Combined Response| F
    F -->|Updates| C

    C -->|Shows| L[Review Form]
    L -->|User confirms| M[Create Task]
    M -->|POST /api/tasks| N[TaskController]
    N -->|Saves| O[Database<br/>SQLite]
    O -->|Success| P[Refresh Task List]
    P -->|Updates| B

```

### Data Flow Architecture

```mermaid

graph LR
    A[Audio Recording] -->|WebM Blob| B[POST /api/voice/transcribe]
    B -->|Audio Buffer| C[Whisper API]
    C -->|Text| D[GPT API]
    D -->|JSON| E{Response}

    E -->|transcript| F[Display to User]
    E -->|parsed.title| F
    E -->|parsed.description| F
    E -->|parsed.priority| F
    E -->|parsed.status| F
    E -->|parsed.dueDate| F

    F -->|User edits| G[Final Task Data]
    G -->|POST /api/tasks| H[Database]
    H -->|Task Object| I[Kanban Board]

    style B fill:#ff6b4a
    style C fill:#10a37f
    style D fill:#10a37f
    style H fill:#4a90e2

```

### Manual Task Creation Flow (Edit Existing)

```mermaid

sequenceDiagram
    participant User
    participant KanbanBoard
    participant TaskCard
    participant TaskModal
    participant Backend
    participant Database

    User->>TaskCard: Click on task
    TaskCard->>KanbanBoard: handleEditTask(task)
    KanbanBoard->>TaskModal: Open with editingTask data
    TaskModal->>User: Display pre-filled form

    User->>TaskModal: Edit fields
    User->>TaskModal: Click "Save"

    TaskModal->>Backend: PUT /api/tasks/:id
    Backend->>Database: Update task
    Database-->>Backend: Updated task
    Backend-->>TaskModal: { success: true, data: Task }

    TaskModal->>KanbanBoard: Refresh tasks
    KanbanBoard->>Backend: GET /api/tasks
    Backend->>Database: Fetch all tasks
    Database-->>Backend: Task list
    Backend-->>KanbanBoard: Tasks
    KanbanBoard->>User: Display updated board

```

---

## 5. AI tools usage

- Claude code was used while building, for boilerplate, logic flow and system design ideas back and forth.

- Prompt Approach

  - 'I think audio should be recorded at the user device first and then sent to backend for transcription and parsing. What do you think of this approach? Any suggestions?'
  - 'I think a single api call to transcribe + parse should be made as it is more efficient? User can review the parsed output in the modal and then create task using another call. Suggestion?'

- A lot of code needs review before accepting. However it can explain the code it is suggesting which makes it easier to review.

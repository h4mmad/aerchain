# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Voice-Enabled Task Tracker - A Linear-inspired task management application with intelligent voice input for creating tasks. The application parses natural language voice commands to extract task details (title, priority, due date, status).

## Tech Stack

**Frontend:**
- React (required)
- Styling: TBD (Tailwind CSS, Material-UI, or CSS Modules recommended)
- State Management: Redux (if needed for complex state)
- Voice Input: Web Speech API or third-party service (e.g., AssemblyAI, Deepgram)

**Backend:**
- Node.js with Express (required)
- Database: TBD (MongoDB, PostgreSQL, or SQLite recommended)
- RESTful API architecture

**AI/NLP:**
- LLM for parsing voice input (OpenAI GPT, Anthropic Claude, or similar)
- Date parsing library (chrono-node recommended for relative dates)

## Project Structure

Expected directory layout:
```
/frontend    - React application
/backend     - Node.js/Express API
```

## Development Commands

### Frontend Setup
```bash
cd frontend
npm install
npm start          # Development server
npm run build      # Production build
npm test           # Run tests (if implemented)
```

### Backend Setup
```bash
cd backend
npm install
npm run dev        # Development with nodemon
npm start          # Production server
npm test           # Run tests (if implemented)
```

### Environment Variables
Both frontend and backend require `.env` files. See `.env.example` in each directory for required variables:
- Speech-to-text API credentials
- LLM API keys for parsing
- Database connection strings
- Port configurations

## Core Architecture

### Task Data Model
Tasks contain:
- `title` (string, required)
- `description` (string, optional)
- `status` (enum: "To Do", "In Progress", "Done")
- `priority` (enum: "Low", "Medium", "High", "Urgent")
- `dueDate` (ISO datetime, optional)
- `createdAt` (ISO datetime)
- `updatedAt` (ISO datetime)

### Voice Input Flow
1. **Capture:** Frontend records audio via microphone
2. **Transcribe:** Convert speech to text using speech-to-text API
3. **Parse:** Send transcript to LLM with structured prompt to extract task fields
4. **Review:** Display parsed fields to user for confirmation/editing
5. **Save:** Create task via backend API

### LLM Parsing Strategy
The LLM prompt should:
- Request JSON output with fields: title, priority, dueDate, status
- Handle relative dates ("tomorrow", "next Monday", "in 3 days")
- Extract priority keywords ("urgent", "high priority", "critical")
- Default status to "To Do" unless specified
- Return null for unparseable fields
- Preserve the raw transcript for user reference

### API Endpoints
```
POST   /api/tasks              - Create task
GET    /api/tasks              - Get all tasks (supports filters)
GET    /api/tasks/:id          - Get single task
PUT    /api/tasks/:id          - Update task
DELETE /api/tasks/:id          - Delete task
POST   /api/tasks/parse-voice  - Parse voice transcript into task fields
```

### Frontend Views
- **Kanban Board:** Three columns (To Do, In Progress, Done) with drag-and-drop
- **List View:** Table/list format with filtering and search
- **Task Modal:** Create/edit form with all task fields
- **Voice Input Modal:** Microphone control, transcript display, parsed fields review

## Key Implementation Notes

### Voice Input Parsing
- Use structured prompts with the LLM to ensure consistent JSON output
- Include example inputs/outputs in the prompt for better accuracy
- Handle date parsing separately with a library like `chrono-node` or rely on LLM
- Always show both raw transcript and parsed fields for transparency
- Validate LLM output before using it

### Date Handling
- Store all dates in UTC in the database
- Parse relative dates based on user's current date/timezone
- Support formats: "tomorrow evening" (6 PM default), "next Monday", "Jan 15", "in 3 days"

### Error Handling
- Validate all API inputs with proper error messages
- Handle speech-to-text failures gracefully
- Provide fallback if LLM parsing fails (allow manual field entry)
- Show clear error states in UI

### Performance Considerations
- Keep LLM prompts concise to reduce latency and cost
- Consider caching parsed results during review phase
- Debounce search/filter operations
- Optimize database queries with proper indexing

## Testing Approach

### Voice Input Test Cases
Test with varying complexity:
1. Simple: "Create a task to review code"
2. Medium: "Remind me to send the report by Friday, high priority"
3. Complex: "Create an urgent task to review the authentication module pull request by tomorrow evening"

### Edge Cases
- Ambiguous dates ("this Friday" when today is Friday)
- Multiple priorities mentioned
- No clear task title
- Very long voice inputs

## Security Considerations
- Validate and sanitize all user inputs on the backend
- Prevent injection attacks (SQL/NoSQL)
- Use environment variables for API keys (never commit secrets)
- Implement rate limiting for API endpoints
- Sanitize LLM outputs before storing in database

## Scope Boundaries

**In Scope:**
- Single-user task management
- Voice-based task creation with NLP parsing
- Manual CRUD operations
- Kanban and list views
- Filter and search functionality
- Responsive design (desktop primary, mobile bonus)

**Out of Scope:**
- User authentication/authorization
- Multi-user support
- Real-time collaboration
- Mobile native apps
- Offline functionality
- Task assignments
- Project/workspace management

## Development Workflow

1. Start with manual task CRUD operations and basic UI
2. Implement Kanban board with drag-and-drop
3. Add search and filtering
4. Integrate speech-to-text for voice capture
5. Implement LLM-based parsing with review flow
6. Polish UX and error handling
7. Write comprehensive README with setup instructions

## Assignment-Specific Requirements

- README must document: setup, tech stack, API endpoints, design decisions, AI tool usage
- Demo video (5-10 min) showing voice input with 3+ examples
- Include `.env.example` with all required variables
- Code must be clean, modular, and well-organized
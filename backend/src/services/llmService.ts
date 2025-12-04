import {
  ParsedTaskFields,
  TaskPriority,
  TaskStatus,
} from "../../../shared/types/task";
import * as chrono from "chrono-node";

export class LLMService {
  private apiKey: string;

  constructor() {
    // Detect which API key is available
    if (process.env.OPENAI_API_KEY) {
      this.apiKey = process.env.OPENAI_API_KEY;
    } else {
      throw new Error(
        "No LLM API key found. Set OPENAI_API_KEY or ANTHROPIC_API_KEY"
      );
    }
  }

  async parseTranscript(transcript: string): Promise<ParsedTaskFields> {
    try {
      return await this.parseWithOpenAI(transcript);
    } catch (error) {
      console.error("LLM parsing error:", error);
      // Fallback to basic parsing
      return this.fallbackParse(transcript);
    }
  }

  // The transcript transcribed by whisper ai is fed to this function
  // The function sends the transcription along with system prompt which state the json structure to return
  // gpt makes sense of text and returns the appropriate json.
  private async parseWithOpenAI(transcript: string): Promise<ParsedTaskFields> {
    // Get current date for context
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

    const systemPrompt = `Today's date is ${today}. Extract task details from the user's input.
Return ONLY valid JSON with this exact structure:
{
  "title": "main task title/summary (string or null)",
  "description": "additional details or context (string or null)",
  "priority": "Low|Medium|High|Urgent (or null)",
  "dueDate": "ISO 8601 datetime (or null)",
  "status": "To Do|In Progress|Done (or null)"
}

Rules:
- Default status to "To Do" if not specified
- Parse relative dates like "tomorrow", "next Monday", "in 3 days" to ISO 8601
- Parse absolute dates like "Jan 15", "15th January" to ISO 8601
- When parsing relative dates, use today's date (${today}) as reference
- Extract priority from keywords: "urgent", "high priority", "critical" → High, "low priority" → Low
- Title should be a concise summary of the main action/task
- Description should capture any additional details, context, or requirements mentioned
- If you cannot determine a field with confidence, use null
- Return ONLY the JSON object, no additional text`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: transcript },
        ],
        temperature: 0.3,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data: any = await response.json();
    const content = data.choices[0].message.content;

    // Parse JSON response
    const parsed = JSON.parse(content);

    return {
      title: parsed.title || null,
      description: parsed.description || null,
      priority: this.validatePriority(parsed.priority),
      dueDate: parsed.dueDate || null,
      status: this.validateStatus(parsed.status) || "To Do",
    };
  }

  private fallbackParse(transcript: string): ParsedTaskFields {
    // Basic keyword-based parsing as fallback
    const lowerTranscript = transcript.toLowerCase();

    // Extract priority
    let priority: TaskPriority | null = null;
    if (
      lowerTranscript.includes("urgent") ||
      lowerTranscript.includes("critical")
    ) {
      priority = "Urgent";
    } else if (
      lowerTranscript.includes("high priority") ||
      lowerTranscript.includes("important")
    ) {
      priority = "High";
    } else if (lowerTranscript.includes("low priority")) {
      priority = "Low";
    }

    // Extract due date using chrono-node
    let dueDate: string | null = null;
    const parsedDate = chrono.parseDate(transcript);
    if (parsedDate) {
      dueDate = parsedDate.toISOString();
    }

    // Title is the transcript with priority/date keywords removed
    let title = transcript
      .replace(
        /\b(urgent|critical|high priority|low priority|important)\b/gi,
        ""
      )
      .replace(/\b(by|due|before|until)\s+\w+\s+\w*/gi, "")
      .trim();

    return {
      title: title || transcript,
      description: null,
      priority,
      dueDate,
      status: "To Do",
    };
  }

  private validatePriority(priority: any): TaskPriority | null {
    const validPriorities: TaskPriority[] = ["Low", "Medium", "High", "Urgent"];
    return validPriorities.includes(priority) ? priority : null;
  }

  private validateStatus(status: any): TaskStatus | null {
    const validStatuses: TaskStatus[] = ["To Do", "In Progress", "Done"];
    return validStatuses.includes(status) ? status : null;
  }
}

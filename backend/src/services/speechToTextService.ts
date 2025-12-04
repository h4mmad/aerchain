import FormData from "form-data";

export class SpeechToTextService {
  private apiKey: string;

  constructor() {
    if (process.env.OPENAI_API_KEY) {
      this.apiKey = process.env.OPENAI_API_KEY;
    } else {
      throw new Error("No speech-to-text API key found. Set OPENAI_API_KEY");
    }
  }

  async transcribe(audioBuffer: Buffer, filename: string): Promise<string> {
    try {
      return await this.transcribeWithWhisper(audioBuffer, filename);
    } catch (error) {
      console.error("Speech-to-text error:", error);
      throw new Error("Failed to transcribe audio");
    }
  }

  private async transcribeWithWhisper(
    audioBuffer: Buffer,
    filename: string
  ): Promise<string> {
    // audio/webm is the default audio format that browsers use when recording audio via MediaRecorder API.

    const formData = new FormData();
    formData.append("file", audioBuffer, {
      filename: filename,
      contentType: "audio/webm",
    });
    formData.append("model", "whisper-1");
    formData.append("language", "en");

    const response = await fetch(
      "https://api.openai.com/v1/audio/transcriptions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          ...formData.getHeaders(),
        },
        body: formData.getBuffer(),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Whisper API error: ${response.statusText} - ${errorText}`
      );
    }

    const data: any = await response.json();
    return data.text;
  }
}

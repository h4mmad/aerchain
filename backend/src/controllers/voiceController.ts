import { Request, Response } from "express";
import { LLMService } from "../services/llmService";
import { SpeechToTextService } from "../services/speechToTextService";

// Lazy initialization - services created on first use after env vars are loaded
let llmService: LLMService;
let speechToTextService: SpeechToTextService;

const getLLMService = () => {
  if (!llmService) {
    llmService = new LLMService();
  }
  return llmService;
};

const getSpeechToTextService = () => {
  if (!speechToTextService) {
    speechToTextService = new SpeechToTextService();
  }
  return speechToTextService;
};

export const processVoiceRecording = async (
  req: Request & { file?: Express.Multer.File },
  res: Response
) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No audio file provided",
      });
    }

    // The audio file is in memory as req.file.buffer
    const audioBuffer = req.file.buffer;
    const filename = req.file.originalname || "audio.webm";

    // Get user's timezone from request body (sent as form data)
    const userTimezone = req.body.timezone || "UTC";

    // Transcribe the audio
    const transcript = await getSpeechToTextService().transcribe(
      audioBuffer,
      filename
    );

    if (!transcript || transcript.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "Failed to transcribe audio",
      });
    }

    // Parse the transcript immediately with user's timezone
    const parsed = await getLLMService().parseTranscript(transcript, userTimezone);

    res.json({
      success: true,
      data: {
        transcript,
        parsed,
      },
    });
  } catch (error) {
    console.error("Error processing voice recording:", error);
    res.status(500).json({
      success: false,
      error: "Failed to process voice recording",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};


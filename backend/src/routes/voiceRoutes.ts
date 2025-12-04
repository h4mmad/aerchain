import { Router } from "express";
import {
  parseVoiceTranscript,
  processVoiceRecording,
} from "../controllers/voiceController";
import { upload } from "../middleware/upload";

const router = Router();

router.post("/parse", parseVoiceTranscript);

router.post("/transcribe", upload.single("audio"), processVoiceRecording);

export default router;

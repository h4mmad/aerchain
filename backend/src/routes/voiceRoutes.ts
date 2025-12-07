import { Router } from "express";
import { processVoiceRecording } from "../controllers/voiceController";
import { upload } from "../middleware/upload";

const router = Router();

router.post("/transcribe", upload.single("audio"), processVoiceRecording);

export default router;

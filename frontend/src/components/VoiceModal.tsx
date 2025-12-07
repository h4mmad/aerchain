import { useState, useEffect } from "react";
import { useVoiceRecorder } from "../hooks/useVoiceRecorder";
import { taskAPI } from "../services/api";
import type { Task } from "@shared/types/task";

interface VoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated: () => void;
}

type Step = "recording" | "transcribing" | "reviewing" | "creating";

export default function VoiceModal({
  isOpen,
  onClose,
  onTaskCreated,
}: VoiceModalProps) {
  const [step, setStep] = useState<Step>("recording");
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState("");
  const [parsedTask, setParsedTask] = useState<Partial<Task>>({
    title: "",
    description: "",
    priority: "Medium",
    status: "To Do",
  });

  const {
    isRecording,
    audioBlob,
    startRecording,
    stopRecording,
    resetRecording,
  } = useVoiceRecorder();

  useEffect(() => {
    if (!isOpen) {
      resetState();
    }
  }, [isOpen]);

  useEffect(() => {
    if (audioBlob && step === "recording") {
      handleTranscribe();
    }
  }, [audioBlob]);

  const resetState = () => {
    setStep("recording");
    setTranscript("");
    setError("");
    setParsedTask({
      title: "",
      description: "",
      priority: "Medium",
      status: "To Do",
    });
    resetRecording();
  };

  const handleStartRecording = async () => {
    try {
      setError("");
      await startRecording();
    } catch (err) {
      setError("Failed to access microphone. Please check permissions.");
    }
  };

  const handleTranscribe = async () => {
    if (!audioBlob) return;

    setStep("transcribing");
    try {
      const result = await taskAPI.processVoiceRecording(audioBlob);

      setTranscript(result.transcript);
      setParsedTask({
        title: result.parsed.title || "",
        description: result.parsed.description || "",
        priority: result.parsed.priority || "Medium",
        status: result.parsed.status || "To Do",
        dueDate: result.parsed.dueDate || undefined,
      });

      setStep("reviewing");
    } catch (err) {
      setError("Failed to process audio. Please try again.");
      setStep("recording");
    }
  };

  const handleCreateTask = async () => {
    if (!parsedTask.title) {
      setError("Task title is required");
      return;
    }

    setStep("creating");
    try {
      await taskAPI.createTask(
        parsedTask as Omit<Task, "id" | "createdAt" | "updatedAt">
      );
      onTaskCreated();
      onClose();
    } catch (err) {
      setError("Failed to create task. Please try again.");
      setStep("reviewing");
    }
  };

  const handleFieldChange = (field: keyof Task, value: string) => {
    setParsedTask((prev) => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full mx-4 border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Create Task with Voice
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Recording Step */}
          {step === "recording" && (
            <div className="flex flex-col items-center">
              <div className="mb-6">
                <div className="relative w-32 h-32 flex items-center justify-center">
                  {/* Pulsing circle when recording */}
                  {isRecording && (
                    <div
                      className="absolute inset-0 bg-purple-600 rounded-full animate-ping opacity-20"
                      style={{ animationDuration: "1.5s" }}
                    />
                  )}

                  {/* Main microphone button */}
                  <div
                    className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all ${
                      isRecording
                        ? "bg-purple-600 scale-110"
                        : "bg-gray-200 hover:bg-gray-300"
                    }`}
                  >
                    <svg
                      className={`w-12 h-12 ${
                        isRecording ? "text-white" : "text-gray-600"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Recording Status */}
              <p className="text-gray-600 text-sm mb-6 mt-6">
                {isRecording
                  ? "Recording... Click stop when done"
                  : "Click the microphone to start"}
              </p>

              {/* Control Buttons */}
              <div className="flex gap-3">
                {!isRecording ? (
                  <button
                    onClick={handleStartRecording}
                    className="px-6 py-2 bg-[#FF6B4A] hover:bg-[#E85A3A] text-white rounded-lg transition-colors font-medium"
                  >
                    Start Recording
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
                  >
                    Stop Recording
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Transcribing Step */}
          {step === "transcribing" && (
            <div className="flex flex-col items-center py-8">
              <div className="w-12 h-12 border-4 border-[#FF6B4A] border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-gray-600">Processing your voice...</p>
            </div>
          )}

          {/* Reviewing Step */}
          {step === "reviewing" && (
            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transcript
                </label>
                <div className="p-3 bg-gray-50 border border-gray-200 rounded text-gray-700 text-sm">
                  {transcript}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={parsedTask.title}
                    onChange={(e) => handleFieldChange("title", e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Task title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={parsedTask.description}
                    onChange={(e) =>
                      handleFieldChange("description", e.target.value)
                    }
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    rows={3}
                    placeholder="Task description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority
                    </label>
                    <select
                      value={parsedTask.priority}
                      onChange={(e) =>
                        handleFieldChange("priority", e.target.value)
                      }
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={parsedTask.status}
                      onChange={(e) =>
                        handleFieldChange("status", e.target.value)
                      }
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="To Do">To Do</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Done">Done</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Due Date
                  </label>
                  <input
                    type="datetime-local"
                    value={
                      parsedTask.dueDate
                        ? new Date(parsedTask.dueDate)
                            .toISOString()
                            .slice(0, 16)
                        : ""
                    }
                    onChange={(e) =>
                      handleFieldChange("dueDate", e.target.value)
                    }
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    resetState();
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors font-medium"
                >
                  Record Again
                </button>
                <button
                  onClick={handleCreateTask}
                  className="flex-1 px-4 py-2 bg-[#FF6B4A] hover:bg-[#E85A3A] text-white rounded-lg transition-colors font-medium shadow-sm"
                >
                  Create Task
                </button>
              </div>
            </div>
          )}

          {/* Creating Step */}
          {step === "creating" && (
            <div className="flex flex-col items-center py-8">
              <div className="w-12 h-12 border-4 border-[#FF6B4A] border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-gray-600">Creating task...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

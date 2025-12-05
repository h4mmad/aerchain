import { useBackendHealth } from "../hooks/useBackendHealth";

export default function BackendStatusIndicator() {
  const { isHealthy, isChecking } = useBackendHealth(5000); // Check every 30 seconds

  if (isChecking) {
    return (
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" />
        <span>Checking...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-xs">
      <div
        className={`w-2 h-2 rounded-full ${
          isHealthy ? "bg-green-500" : "bg-red-500"
        }`}
      />
      <span className={isHealthy ? "text-green-600" : "text-red-600"}>
        {isHealthy ? "Backend Connected" : "Backend Offline"}
      </span>
    </div>
  );
}

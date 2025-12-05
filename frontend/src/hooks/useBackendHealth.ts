import { useState, useEffect } from "react";

interface HealthStatus {
  isHealthy: boolean;
  isChecking: boolean;
  lastChecked: Date | null;
}

export const useBackendHealth = (intervalMs: number = 5000) => {
  const [healthStatus, setHealthStatus] = useState<HealthStatus>({
    isHealthy: false,
    isChecking: true,
    lastChecked: null,
  });

  const checkHealth = async () => {
    try {
      const response = await fetch("http://localhost:5000/health", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const isHealthy = response.ok;
      setHealthStatus({
        isHealthy,
        isChecking: false,
        lastChecked: new Date(),
      });
    } catch (error) {
      setHealthStatus({
        isHealthy: false,
        isChecking: false,
        lastChecked: new Date(),
      });
    }
  };

  useEffect(() => {
    // Initial check
    checkHealth();

    // Set up periodic checks
    const interval = setInterval(checkHealth, intervalMs);

    return () => clearInterval(interval);
  }, [intervalMs]);

  return healthStatus;
};

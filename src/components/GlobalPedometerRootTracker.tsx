import React from "react";
import { useDailyLog } from "@/context/DailyLogContext";
import { usePedometerSensor } from "@/hooks/usePedometerSensor";

/**
 * GlobalPedometerRootTracker
 * Garantiza que el podómetro biomecánico y los sensores de movimiento
 * se mantengan activos y sumando pasos en tiempo real en TODAS las pestañas de la aplicación
 * (Hoy, Programa, Entreno, Escultura, Diario, Nutrición, etc.),
 * garantizando conteo autónomo 24/7 sin depender obligatoriamente de Google Health.
 */
export function GlobalPedometerRootTracker() {
  const { log, addSteps, setSteps } = useDailyLog();
  const currentSteps = log.steps ?? 0;
  const heightCm = log.userMetrics?.heightCm ?? 170;
  const weightKg = log.userMetrics?.weightKg ?? 70;

  // Montar el sensor autoritativo a nivel raíz con métricas personales del usuario
  usePedometerSensor(addSteps, setSteps, currentSteps, heightCm, weightKg);

  return null;
}

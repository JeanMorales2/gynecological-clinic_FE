/** Zona horaria de la clínica (Nicaragua, UTC-6 todo el año, sin horario de verano). */
export const CLINIC_TIMEZONE = "America/Managua";

const todayFormatter = new Intl.DateTimeFormat("en-CA", { timeZone: CLINIC_TIMEZONE, year: "numeric", month: "2-digit", day: "2-digit" });

/** Fecha de hoy (YYYY-MM-DD) en la hora local de la clínica, no en UTC del navegador/servidor. */
export function todayInClinicTimezone(): string {
  return todayFormatter.format(new Date());
}

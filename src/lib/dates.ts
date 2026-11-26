/** Zona horaria de la clínica (Nicaragua, UTC-6 todo el año, sin horario de verano). */
export const CLINIC_TIMEZONE = "America/Managua";

const todayFormatter = new Intl.DateTimeFormat("en-CA", { timeZone: CLINIC_TIMEZONE, year: "numeric", month: "2-digit", day: "2-digit" });
const clinicTimeFormatter = new Intl.DateTimeFormat("en-GB", { timeZone: CLINIC_TIMEZONE, hour: "2-digit", minute: "2-digit", hour12: false });

/** Fecha de hoy (YYYY-MM-DD) en la hora local de la clínica, no en UTC del navegador/servidor. */
export function todayInClinicTimezone(): string {
  return todayFormatter.format(new Date());
}

/** Hora actual (HH:mm, 24h) en la hora local de la clínica. Sirve para comparar contra horarios en formato HH:mm. */
export function nowTimeInClinicTimezone(): string {
  return clinicTimeFormatter.format(new Date());
}

/** Descompone un instante (ISO) en fecha y hora locales de la clínica. */
export function toClinicDateAndTime(isoValue: string): { fecha: string; hora: string } {
  const date = new Date(isoValue);
  return { fecha: todayFormatter.format(date), hora: clinicTimeFormatter.format(date) };
}

/** Arma el instante UTC real a partir de fecha (YYYY-MM-DD) y hora (HH:mm) en la hora local de la clínica (UTC-6 fijo). */
export function clinicDateAndTimeToIso(fecha: string, hora: string): string {
  return new Date(`${fecha}T${hora}:00-06:00`).toISOString();
}

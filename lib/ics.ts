export function buildInterviewIcs(params: {
  company: string;
  role: string;
  start: Date;
  durationMinutes?: number;
  notes?: string;
}): string {
  const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const end = new Date(params.start.getTime() + (params.durationMinutes ?? 45) * 60000);

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//JobFinder AI//Interview Prep//EN",
    "BEGIN:VEVENT",
    `UID:${Date.now()}-${Math.random().toString(36).slice(2)}@jobfinderai`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(params.start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:Interview — ${params.role} at ${params.company}`,
  ];
  if (params.notes) lines.push(`DESCRIPTION:${params.notes.replace(/\r?\n/g, "\\n")}`);
  lines.push("END:VEVENT", "END:VCALENDAR");
  return lines.join("\r\n");
}

import notesData from '@/content/notes.json';

export interface Note {
  date: string;
  header?: string;
  body: string;
  starred: boolean;
}

export function getNotes(): Note[] {
  const data: unknown = notesData;
  if (!Array.isArray(data)) throw new Error('content/notes.json must contain an array.');

  const notes = data.map((value: unknown, index): Note => {
    const note = value as Partial<Note> | null;
    const error = `content/notes.json: note ${index + 1}`;
    if (!note || typeof note !== 'object' || typeof note.date !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}$/.test(note.date) ||
      !Number.isFinite(Date.parse(note.date)) ||
      new Date(note.date).toISOString().slice(0, 10) !== note.date) {
      throw new Error(`${error} needs a valid date in YYYY-MM-DD format.`);
    }
    if (typeof note.body !== 'string' || !note.body.trim() ||
      typeof note.starred !== 'boolean' ||
      (note.header !== undefined && typeof note.header !== 'string')) {
      throw new Error(`${error} needs body (non-empty text), starred (boolean), and optionally header (text).`);
    }
    return { date: note.date, body: note.body, starred: note.starred, header: note.header };
  });

  // ISO dates sort chronologically; notes on the same day keep their file order.
  return notes.sort((a, b) => b.date.localeCompare(a.date));
}

export function formatNoteDate(date: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC',
  }).format(new Date(date));
}

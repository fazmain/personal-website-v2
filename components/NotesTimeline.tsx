import { formatNoteDate, type Note } from '@/lib/notes';

export default function NotesTimeline({ notes }: { notes: Note[] }) {
  return (
    <ol className="m-0 list-none p-0" aria-label="Notes timeline">
      {notes.map((note, index) => (
        <li key={`${note.date}-${index}`} className="relative ml-1 border-l border-[var(--foreground)]/15 pb-8 pl-6 last:border-transparent last:pb-0 sm:pl-8">
          <span aria-hidden="true" className="absolute -left-[4px] top-2 h-[7px] w-[7px] rounded-full bg-[var(--accent)] ring-4 ring-[var(--background)]" />
          <article className="min-w-0">
            <time dateTime={note.date} className="text-sm text-[var(--foreground)]/60">
              {formatNoteDate(note.date)}
            </time>
            {note.header?.trim() && <h3 className="mt-2 text-lg md:text-xl font-medium leading-snug [overflow-wrap:anywhere]">{note.header}</h3>}
            <p className="mt-2 whitespace-pre-wrap text-base md:text-lg leading-relaxed text-[var(--foreground)]/85 [overflow-wrap:anywhere]">{note.body}</p>
          </article>
        </li>
      ))}
    </ol>
  );
}

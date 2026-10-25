import type { Metadata } from 'next';
import NotesTimeline from '@/components/NotesTimeline';
import { getNotes } from '@/lib/notes';

export const metadata: Metadata = {
  title: 'Notes — Faiaz Azmain',
  description: 'Short thoughts, observations, and things on my mind.',
};

export default function NotesPage() {
  const notes = getNotes();

  return (
    <div className="flex flex-col gap-10 py-8 md:py-12">
      <header className="flex flex-col gap-4">
        <h1 className="text-[clamp(1.625rem,0.5rem+4vw,3rem)] font-medium tracking-tight">Notes</h1>
        <p className="text-base md:text-lg text-[var(--foreground)]/70">Short thoughts, observations, and things on my mind.</p>
      </header>
      {notes.length > 0 ? <NotesTimeline notes={notes} /> : <p className="text-base md:text-lg italic text-[var(--foreground)]/60">Quiet here for now.</p>}
    </div>
  );
}

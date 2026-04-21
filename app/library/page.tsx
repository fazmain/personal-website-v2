import Link from 'next/link';
import Image from 'next/image';

const books = [
  // To populate this, place images in /public/books/ and update the covers here
  {
    id: 1,
    title: "Gödel, Escher, Bach: an Eternal Golden Braid",
    author: "Douglas Hofstadter",
    status: "Reading",
    cover: "", // e.g. "/books/geb.jpg"
    year: "1979"
  },
  {
    id: 2,
    title: "Thinking, Fast and Slow",
    author: "Daniel Kahneman",
    status: "Finished",
    cover: "", // e.g. "/books/thinking.jpg"
    year: "2011"
  }
];

export default function Library() {
  return (
    <div className="flex flex-col gap-8 py-8 md:py-12 animate-fade-in">
      <div className="flex flex-col gap-3">
        <Link href="/" className="text-sm font-medium text-[var(--foreground)]/60 hover:text-[var(--foreground)] transition-colors inline-flex items-center gap-2 mb-4 w-fit">
          <span>←</span> Back to home
        </Link>
        <h1 className="text-3xl md:text-5xl font-medium tracking-tight">Library</h1>
        <p className="text-lg text-[var(--foreground)]/80">
          An ongoing archive of texts that shape my thinking.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-12 mt-8">
        {books.map((book) => (
          <div key={book.id} className="flex flex-col gap-3 group">
            <div className="w-full aspect-[2/3] relative bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 overflow-hidden shadow-sm transition-transform duration-500 group-hover:-translate-y-1">
              {book.cover ? (
                <Image 
                  src={book.cover} 
                  alt={book.title} 
                  fill 
                  className="object-cover grayscale opacity-90 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" 
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center p-4 text-center text-[var(--foreground)]/20 text-xs font-mono uppercase tracking-widest break-words select-none">
                  {book.title}
                </div>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="font-medium text-[var(--foreground)]/90 text-sm leading-tight group-hover:underline underline-offset-4 decoration-[var(--foreground)]/30">{book.title}</h3>
              <p className="text-[var(--foreground)]/60 text-xs">{book.author}</p>
              <div className="flex items-center justify-between mt-1 text-[10px] font-mono text-[var(--foreground)]/50 uppercase tracking-wider">
                <span>{book.year}</span>
                <span className={book.status === 'Reading' ? 'text-[#ac4c2e]' : ''}>{book.status}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

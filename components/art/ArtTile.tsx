import Image from 'next/image';
import Link from 'next/link';
import { type Artwork, thumbFor } from '@/lib/art';

/** A still of a piece with its wall label underneath; links to the piece's page. */
export default function ArtTile({ piece }: { piece: Artwork }) {
  return (
    <Link href={`/art/${piece.slug}`} className="group flex flex-col gap-3">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[2px] bg-white/[0.03]">
        <Image
          src={thumbFor(piece.slug)}
          alt={`${piece.title}, ${piece.year}`}
          fill
          sizes="(min-width: 1024px) 460px, (min-width: 640px) 50vw, 100vw"
          className="object-cover opacity-85 transition duration-700 ease-out group-hover:scale-[1.015] group-hover:opacity-100"
        />
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-lg leading-snug group-hover:underline underline-offset-4 decoration-[var(--foreground)]/30">
          {piece.title}
        </span>
        <span className="font-mono text-xs text-[var(--foreground)]/45">
          {piece.year} · {piece.medium}
        </span>
      </div>
    </Link>
  );
}

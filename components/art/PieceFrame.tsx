'use client';

import Image from 'next/image';
import { type Artwork, thumbFor } from '@/lib/art';
import { useArrived } from './arrival';

/**
 * Runs a piece from public/works/ in an isolated frame. Until the portal into
 * /art has finished it shows the piece's still (or nothing), so the two never
 * compete for frames. Camera and microphone are blocked so nobody gets a
 * permission prompt just for visiting; the pieces fall back to cursor or
 * simulated modes.
 */
export default function PieceFrame({
  piece,
  src = piece.src,
  className = '',
  poster = true,
}: {
  piece: Artwork;
  src?: string;
  className?: string;
  poster?: boolean;
}) {
  const arrived = useArrived();
  if (!src) return null;

  if (!arrived) {
    return (
      <div className={`relative w-full overflow-hidden ${className}`}>
        {poster && <Image src={thumbFor(piece.slug)} alt="" fill sizes="(min-width: 1024px) 60vw, 100vw" className="object-cover opacity-70" />}
      </div>
    );
  }
  return (
    <iframe
      src={src}
      title={`${piece.title} (${piece.year}), live`}
      allow="camera 'none'; microphone 'none'; fullscreen"
      className={`block w-full ${className}`}
    />
  );
}

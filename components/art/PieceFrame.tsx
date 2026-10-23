'use client';

import Image from 'next/image';
import { type Artwork, thumbFor } from '@/lib/art';
import { useArrived } from './arrival';

/**
 * Runs a piece from public/works/ in an isolated frame. Until the portal into
 * /art has finished, it shows the piece's still instead, so the two never
 * compete for frames. Camera and microphone are blocked so nobody gets a
 * permission prompt just for visiting; the pieces fall back to cursor or
 * simulated modes.
 */
export default function PieceFrame({ piece, className = '' }: { piece: Artwork; className?: string }) {
  const arrived = useArrived();
  if (!piece.src) return null;

  if (!arrived) {
    return (
      <div className={`relative w-full overflow-hidden bg-black ${className}`}>
        <Image src={thumbFor(piece.slug)} alt="" fill sizes="960px" className="object-cover opacity-70" priority />
      </div>
    );
  }
  return (
    <iframe
      src={piece.src}
      title={`${piece.title} (${piece.year}), live`}
      allow="camera 'none'; microphone 'none'; fullscreen"
      className={`block w-full bg-black ${className}`}
    />
  );
}

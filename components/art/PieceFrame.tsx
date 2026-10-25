import type { Artwork } from '@/lib/art';

/**
 * Runs a piece from public/works/ in an isolated frame. Camera and microphone
 * are blocked so nobody gets a permission prompt just for visiting; the pieces
 * fall back to cursor or simulated modes.
 */
export default function PieceFrame({
  piece,
  src = piece.src,
  className = '',
}: {
  piece: Artwork;
  src?: string;
  className?: string;
}) {
  if (!src) return null;
  return (
    <iframe
      src={src}
      title={`${piece.title} (${piece.year}), live`}
      allow="camera 'none'; microphone 'none'; fullscreen"
      className={`block w-full ${className}`}
    />
  );
}

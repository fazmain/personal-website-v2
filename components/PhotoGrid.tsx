import Image from 'next/image';

export interface Photo {
  src: string;
  alt: string;
  caption: string;
}

interface PhotoGridProps {
  photos: Photo[];
}

export default function PhotoGrid({ photos }: PhotoGridProps) {
  if (photos.length === 0) {
    return <p className="text-[var(--foreground)]/50 italic text-sm border border-[var(--foreground)]/10 border-dashed p-8 rounded-sm text-center">No photos in archive yet. Place images in /public/photos</p>;
  }

  return (
    <div className="columns-1 sm:columns-2 gap-4 space-y-4 mt-4">
      {photos.map((photo, index) => (
        <div key={index} className="break-inside-avoid group flex flex-col gap-2 relative">
          <div className="overflow-hidden bg-[var(--foreground)]/5 rounded-sm">
            <img
              src={photo.src}
              alt={photo.alt}
              loading="lazy"
              className="w-full h-auto object-cover grayscale opacity-90 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 ease-in-out"
            />
          </div>
          <span className="text-xs text-[var(--foreground)]/50 font-mono italic px-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            {photo.caption}
          </span>
        </div>
      ))}
    </div>
  );
}

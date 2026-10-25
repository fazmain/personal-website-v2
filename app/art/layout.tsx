import ArtBar from '@/components/art/ArtBar';
import ArtWorld from '@/components/art/ArtWorld';

/**
 * The art section has its own layout: none of the main site's sidebar, column
 * or footer. Just a small bar (home + Works menu) and full-width rooms.
 */
export default function ArtLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ArtWorld chrome={<ArtBar />}>
        <div className="mx-auto w-full max-w-[1320px] px-5 md:px-10 pt-24 pb-28">{children}</div>
      </ArtWorld>
    </>
  );
}

import ArtWorld from '@/components/art/ArtWorld';

export default function ArtLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Without JavaScript there is no portal: show the page as is. */}
      <noscript>
        <style>{'.art-portal{display:none!important}.opacity-0{opacity:1!important}'}</style>
      </noscript>
      <ArtWorld>{children}</ArtWorld>
    </>
  );
}

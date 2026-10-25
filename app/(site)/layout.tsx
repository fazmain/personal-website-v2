import CityscapeFooter from '@/components/CityscapeFooter';
import SiteNav from '@/components/SiteNav';

/** The main site: left-margin nav, a single reading column, and the skyline footer. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center px-6 py-8 md:px-12 md:py-12 lg:px-24 lg:pt-12 lg:pb-24">
      <main className="relative w-full max-w-2xl flex-grow pb-16">
        <SiteNav />
        {children}
      </main>
      <CityscapeFooter />
    </div>
  );
}

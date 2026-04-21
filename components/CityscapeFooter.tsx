import Link from 'next/link';

export default function CityscapeFooter() {
  return (
    <footer className="w-full mt-auto relative overflow-hidden flex flex-col items-center">
      <style>{`
        @keyframes cloudFloat {
          0% { transform: translateX(-50px); }
          100% { transform: translateX(100vw); }
        }
        .cloud-animation {
          animation: cloudFloat 40s linear infinite;
        }
        @keyframes pulseSlow {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.8; }
        }
        .window-pulse {
          animation: pulseSlow 4s ease-in-out infinite;
        }
        @keyframes planeFloat {
          0% { transform: translateX(-50vw) translateY(5px); }
          100% { transform: translateX(100vw) translateY(-5px); }
        }
        .plane-animation {
          animation: planeFloat 45s linear infinite;
        }
        @keyframes shootingStar {
          0% { transform: translate(10vw, -20px) rotate(225deg); opacity: 1; }
          5% { transform: translate(-30vw, 150px) rotate(225deg); opacity: 0; }
          100% { transform: translate(-30vw, 150px) rotate(225deg); opacity: 0; }
        }
        .star-animation {
          position: absolute;
          width: 1px;
          height: 30px;
          background: linear-gradient(to bottom, transparent, var(--foreground));
          opacity: 0.4;
          animation: shootingStar 12s linear infinite;
        }
        @keyframes beaconBlink {
          0%, 100% { opacity: 0; }
          10%, 90% { opacity: 1; }
        }
        .beacon {
          animation: beaconBlink 1.5s infinite;
        }
        .city-skyline > rect:not(.beacon):not(.window-pulse), 
        .city-skyline > polygon, 
        .city-skyline > path {
          transition: fill 0.2s ease, opacity 0.2s ease;
        }
        .city-skyline > rect:not(.beacon):not(.window-pulse):hover, 
        .city-skyline > polygon:hover, 
        .city-skyline > path:hover {
          fill: var(--foreground);
          opacity: 0.6;
          cursor: crosshair;
        }
      `}</style>

      {/* Cityscape SVG Container */}
      <div className="group relative w-full max-w-2xl h-16 sm:h-20 opacity-80 select-none border-b border-[var(--foreground)]/10">

        {/* Moving Clouds & Aircraft */}
        <div className="absolute top-2 left-0 text-[var(--foreground)]/30 text-[10px] cloud-animation z-0">☁️</div>
        <div className="absolute top-4 left-0 text-[var(--foreground)]/20 text-[10px] cloud-animation z-0" style={{ animationDelay: '-15s', animationDuration: '55s' }}>☁️</div>

        <div className="absolute top-1/3 left-0 text-[var(--foreground)]/20 text-[6px] plane-animation z-0" style={{ animationDelay: '-8s' }}>✈️</div>

        {/* Shooting Stars */}
        <div className="star-animation z-0" style={{ top: '-10px', right: '10%' }}></div>
        <div className="star-animation z-0" style={{ top: '0px', right: '40%', animationDelay: '7s' }}></div>

        {/* City Skyline SVG */}
        <svg
          className="city-skyline absolute bottom-0 w-full h-full text-[var(--foreground)]/15 group-hover:text-[var(--foreground)]/25 transition-colors duration-700 z-10"
          viewBox="0 0 2500 200"
          preserveAspectRatio="none"
          fill="currentColor"
        >
          {/* Background Layer (opacity-50) */}
          <rect x="20" y="150" width="80" height="50" className="opacity-50" />
          <rect x="70" y="80" width="40" height="120" className="opacity-50" />
          <rect x="130" y="110" width="60" height="90" className="opacity-50" />
          <rect x="210" y="60" width="30" height="140" className="opacity-50" />
          <rect x="280" y="100" width="100" height="100" className="opacity-50" />
          <rect x="400" y="140" width="50" height="60" className="opacity-50" />
          <polygon points="450,140 475,100 500,140" className="opacity-50" />
          <rect x="450" y="140" width="50" height="60" className="opacity-50" />
          <rect x="520" y="40" width="40" height="160" className="opacity-50" />
          <rect x="590" y="120" width="80" height="80" className="opacity-50" />
          <rect x="700" y="90" width="50" height="110" className="opacity-50" />
          <rect x="800" y="160" width="120" height="40" className="opacity-50" />
          <rect x="940" y="80" width="60" height="120" className="opacity-50" />
          <rect x="1030" y="50" width="20" height="150" className="opacity-50" />
          <rect x="1080" y="130" width="70" height="70" className="opacity-50" />
          <rect x="1190" y="110" width="50" height="90" className="opacity-50" />
          <rect x="1260" y="70" width="80" height="130" className="opacity-50" />
          <rect x="1370" y="140" width="90" height="60" className="opacity-50" />
          <rect x="1490" y="60" width="30" height="140" className="opacity-50" />
          <rect x="1560" y="110" width="60" height="90" className="opacity-50" />
          <rect x="1650" y="150" width="100" height="50" className="opacity-50" />
          <rect x="1780" y="80" width="50" height="120" className="opacity-50" />
          <rect x="1860" y="130" width="80" height="70" className="opacity-50" />
          <rect x="1960" y="50" width="40" height="150" className="opacity-50" />
          <rect x="2040" y="110" width="70" height="90" className="opacity-50" />
          <rect x="2140" y="90" width="50" height="110" className="opacity-50" />
          <rect x="2220" y="140" width="100" height="60" className="opacity-50" />
          <rect x="2350" y="70" width="60" height="130" className="opacity-50" />
          <rect x="2440" y="120" width="80" height="80" className="opacity-50" />

          {/* Foreground Layer */}

          {/* Low wide building with water tower */}
          <rect x="10" y="160" width="80" height="40" />
          <rect x="30" y="150" width="4" height="10" />
          <rect x="46" y="150" width="4" height="10" />
          <rect x="25" y="140" width="30" height="15" />

          <rect x="100" y="100" width="50" height="100" />

          {/* Tiered Art Deco */}
          <rect x="160" y="80" width="70" height="120" />
          <rect x="175" y="50" width="40" height="30" />
          <rect x="185" y="20" width="20" height="30" />
          <polygon points="185,20 195,0 205,20" />
          <rect x="194" y="-20" width="2" height="20" />

          {/* Ultra Skinny needle */}
          <rect x="250" y="30" width="15" height="170" />
          <rect x="252" y="20" width="11" height="10" />

          {/* Slanted roof */}
          <rect x="280" y="120" width="60" height="80" />
          <polygon points="280,120 340,90 340,120" />

          {/* Bridge suspension arch */}
          <path d="M 360 200 Q 420 50 480 200" fill="none" stroke="currentColor" strokeWidth="4" />
          <rect x="375" y="100" width="10" height="100" />
          <rect x="455" y="100" width="10" height="100" />

          {/* Glassy Box */}
          <rect x="500" y="70" width="80" height="130" />

          {/* Chrysler style pointy arches */}
          <rect x="600" y="80" width="60" height="120" />
          <path d="M 600 80 Q 630 30 660 80" />
          <path d="M 610 80 Q 630 10 650 80" fill="var(--background)" className="opacity-20" />
          <rect x="628" y="-10" width="4" height="40" />

          <rect x="680" y="140" width="90" height="60" />
          <rect x="780" y="110" width="50" height="90" />
          <rect x="795" y="100" width="20" height="10" />

          {/* Asymmetric modern */}
          <rect x="850" y="60" width="50" height="140" />
          <rect x="900" y="90" width="30" height="110" />
          <rect x="850" y="40" width="40" height="20" />

          {/* Twin Peaks */}
          <rect x="960" y="80" width="40" height="120" />
          <polygon points="960,80 980,50 1000,80" />
          <rect x="1010" y="80" width="40" height="120" />
          <polygon points="1010,80 1030,50 1050,80" />

          {/* Factory zig-zag roof */}
          <rect x="1080" y="160" width="100" height="40" />
          <polygon points="1080,160 1100,140 1120,160" />
          <polygon points="1120,160 1140,140 1160,160" />

          <rect x="1200" y="20" width="60" height="180" />

          {/* Step-down block */}
          <rect x="1280" y="130" width="80" height="70" />
          <rect x="1290" y="100" width="60" height="30" />
          <rect x="1300" y="70" width="40" height="30" />
          <rect x="1310" y="40" width="20" height="30" />

          <rect x="1380" y="60" width="25" height="140" />
          <rect x="1390" y="10" width="5" height="50" />

          {/* Arched windows building */}
          <rect x="1430" y="90" width="80" height="110" />
          <path d="M 1440 90 A 20 20 0 0 1 1460 90" fill="var(--background)" className="opacity-20" />
          <path d="M 1480 90 A 20 20 0 0 1 1500 90" fill="var(--background)" className="opacity-20" />

          <rect x="1530" y="150" width="50" height="50" />

          {/* Slanted wedge */}
          <rect x="1600" y="50" width="60" height="150" />
          <polygon points="1600,50 1660,10 1660,50" />

          {/* Second bridge */}
          <path d="M 1680 200 Q 1750 60 1820 200" fill="none" stroke="currentColor" strokeWidth="4" />
          <rect x="1700" y="110" width="10" height="90" />
          <rect x="1800" y="110" width="10" height="90" />

          {/* Stepped residential */}
          <rect x="1840" y="100" width="70" height="100" />
          <rect x="1860" y="70" width="50" height="30" />
          <rect x="1880" y="40" width="30" height="30" />

          {/* Dome / Museum style */}
          <rect x="1940" y="140" width="100" height="60" />
          <path d="M 1970 140 A 20 20 0 0 1 2010 140" />

          <rect x="2060" y="50" width="20" height="150" />
          <rect x="2085" y="80" width="15" height="120" />
          <rect x="2105" y="40" width="25" height="160" />

          {/* Classic small scraper */}
          <rect x="2150" y="70" width="50" height="130" />
          <rect x="2165" y="50" width="20" height="20" />
          <rect x="2173" y="10" width="4" height="40" />

          <rect x="2230" y="130" width="60" height="70" />
          <polygon points="2230,130 2230,100 2290,130" />

          <rect x="2310" y="110" width="90" height="90" />
          <rect x="2320" y="90" width="20" height="20" />
          <rect x="2370" y="80" width="10" height="30" />
          <rect x="2420" y="60" width="50" height="140" />

          {/* Animated Windows (Randomly Placed, varied geometries) */}
          <rect x="110" y="130" width="40" height="2" className="fill-yellow-500/60 window-pulse block" />
          <rect x="175" y="100" width="4" height="40" className="fill-yellow-500/60 window-pulse block" style={{ animationDelay: '1s' }} />
          <rect x="285" y="140" width="10" height="10" className="fill-yellow-500/60 window-pulse block" style={{ animationDelay: '2s' }} />
          <rect x="520" y="90" width="40" height="4" className="fill-yellow-500/60 window-pulse block" style={{ animationDelay: '0.5s' }} />
          <rect x="620" y="120" width="5" height="15" className="fill-yellow-500/60 window-pulse block" style={{ animationDelay: '3s' }} />
          <rect x="860" y="80" width="8" height="8" className="fill-yellow-500/60 window-pulse block" style={{ animationDelay: '1.2s' }} />
          <rect x="880" y="110" width="8" height="8" className="fill-yellow-500/60 window-pulse block" style={{ animationDelay: '1.8s' }} />
          <rect x="1220" y="60" width="20" height="3" className="fill-yellow-500/60 window-pulse block" style={{ animationDelay: '0.2s' }} />
          <rect x="1450" y="120" width="4" height="20" className="fill-yellow-500/60 window-pulse block" style={{ animationDelay: '2.5s' }} />
          <rect x="1620" y="90" width="15" height="5" className="fill-yellow-500/60 window-pulse block" style={{ animationDelay: '1.7s' }} />
          <rect x="1850" y="130" width="50" height="5" className="fill-yellow-500/60 window-pulse block" style={{ animationDelay: '0.9s' }} />
          <rect x="2110" y="70" width="10" height="10" className="fill-yellow-500/60 window-pulse block" style={{ animationDelay: '2.1s' }} />
          <rect x="2160" y="90" width="30" height="2" className="fill-yellow-500/60 window-pulse block" style={{ animationDelay: '1.4s' }} />
          <rect x="2330" y="140" width="20" height="20" className="fill-yellow-500/60 window-pulse block" style={{ animationDelay: '0.6s' }} />

          {/* Aviation Warning Beacons (Red flashing dots on top of spires) */}
          <rect x="193" y="-22" width="4" height="4" className="fill-red-500/70 beacon" />
          <rect x="254" y="15" width="4" height="4" className="fill-red-500/70 beacon" style={{ animationDelay: '0.4s' }} />
          <rect x="628" y="-14" width="4" height="4" className="fill-red-500/70 beacon" style={{ animationDelay: '1s' }} />
          <rect x="1018" y="-24" width="4" height="4" className="fill-red-500/70 beacon" style={{ animationDelay: '0.2s' }} />
          <rect x="1328" y="-19" width="4" height="4" className="fill-red-500/70 beacon" style={{ animationDelay: '0.8s' }} />
          <rect x="2078" y="-34" width="4" height="4" className="fill-red-500/70 beacon" style={{ animationDelay: '0.6s' }} />
          <rect x="2173" y="6" width="4" height="4" className="fill-red-500/70 beacon" style={{ animationDelay: '1.2s' }} />
        </svg>
      </div>

      {/* Actual Footer Content */}
      <div className="w-full max-w-2xl flex items-center justify-between py-6 text-[var(--foreground)]/50 text-sm font-medium z-20 relative px-2">
        <div className="flex items-center gap-2">
          <span>© {new Date().getFullYear()} Faiaz Azmain. I love big cities; can you tell?</span>
        </div>
        {/* <div className="flex items-center gap-4 text-xs font-mono uppercase tracking-widest">
          <Link href="/library" className="hover:text-[var(--foreground)] transition-colors">Archive</Link>
        </div> */}
      </div>
    </footer>
  );
}

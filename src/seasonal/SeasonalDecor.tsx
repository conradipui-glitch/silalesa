const fallingLeaves = [
  { left: "4%", size: 34, duration: 16, delay: -4, drift: "72px", rotate: "-14deg", color: "#b94a25", variant: "maple" },
  { left: "16%", size: 27, duration: 20, delay: -14, drift: "-54px", rotate: "22deg", color: "#d58a2f", variant: "birch" },
  { left: "31%", size: 31, duration: 18, delay: -8, drift: "88px", rotate: "10deg", color: "#8f3a25", variant: "oak" },
  { left: "47%", size: 23, duration: 22, delay: -18, drift: "-66px", rotate: "-28deg", color: "#d4a23a", variant: "birch" },
  { left: "63%", size: 37, duration: 19, delay: -11, drift: "58px", rotate: "18deg", color: "#9f3024", variant: "maple" },
  { left: "78%", size: 29, duration: 17, delay: -6, drift: "-82px", rotate: "33deg", color: "#b96b2e", variant: "oak" },
  { left: "91%", size: 25, duration: 21, delay: -16, drift: "-48px", rotate: "-18deg", color: "#d79027", variant: "maple" },
] as const;

function Leaf({ variant, className = "" }: { variant: "maple" | "oak" | "birch"; className?: string }) {
  const path =
    variant === "maple"
      ? "M50 2 42 22 27 12 31 31 11 27 25 45 4 55 30 57 22 80 43 66 47 98 53 98 57 66 78 80 70 57 96 55 75 45 89 27 69 31 73 12 58 22Z"
      : variant === "oak"
        ? "M51 2C43 14 43 21 33 19c-10-2-16 4-10 13 5 8 1 14-9 16 8 10 17 9 10 21 9 2 12 8 7 17 10-1 15 6 18 15 4-9 9-13 18-10-4-11 5-12 13-15-10-5-13-12-7-21-10-2-14-8-8-17-11 1-17-5-18-15Z"
        : "M50 4C32 18 18 40 22 60c4 21 20 32 28 36 8-4 24-15 28-36 4-20-10-42-28-56Z";

  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <defs>
        <filter id={`leaf-noise-${variant}`} x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="2" seed={variant === "maple" ? 7 : variant === "oak" ? 11 : 17} result="noise" />
          <feColorMatrix in="noise" values="1 0 0 0 0  0 0.68 0 0 0  0 0 0.35 0 0  0 0 0 .24 0" result="grain" />
          <feBlend in="SourceGraphic" in2="grain" mode="multiply" />
        </filter>
      </defs>
      <path d={path} fill="currentColor" filter={`url(#leaf-noise-${variant})`} />
      <path d="M50 10v84M50 43 31 30M50 52 70 35M50 64 31 58M50 72 69 61" fill="none" stroke="rgba(52,28,15,.55)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function Pumpkin() {
  return (
    <svg viewBox="0 0 320 300" className="seasonal-pumpkin" aria-hidden="true">
      <defs>
        <radialGradient id="pumpkin-rind" cx="48%" cy="35%" r="70%">
          <stop offset="0" stopColor="#ef8f32" />
          <stop offset=".48" stopColor="#c65d20" />
          <stop offset="1" stopColor="#713016" />
        </radialGradient>
        <linearGradient id="pumpkin-stem" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#6e5732" />
          <stop offset=".5" stopColor="#302719" />
          <stop offset="1" stopColor="#8c6b3d" />
        </linearGradient>
        <filter id="pumpkin-skin" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency=".035 .42" numOctaves="3" seed="23" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.5" xChannelSelector="R" yChannelSelector="G" result="distorted" />
          <feBlend in="distorted" in2="noise" mode="soft-light" />
        </filter>
        <filter id="pumpkin-glow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      <path d="M150 58c-8-21-2-41 14-54 10 9 20 19 18 33 15-8 28-5 34 5-18 2-31 12-38 27Z" fill="url(#pumpkin-stem)" stroke="#21180f" strokeWidth="4" />
      <g filter="url(#pumpkin-skin)">
        <path d="M160 52C83 50 27 91 28 171c1 73 55 112 132 113 77-1 131-40 132-113 1-80-55-121-132-119Z" fill="url(#pumpkin-rind)" stroke="#4e2111" strokeWidth="5" />
        <path d="M160 55C126 72 112 111 114 170c2 58 18 93 46 111M160 55c34 17 48 56 46 115-2 58-18 93-46 111M95 65c-25 28-34 64-31 106 3 45 18 77 49 100M225 65c25 28 34 64 31 106-3 45-18 77-49 100" fill="none" stroke="rgba(86,32,12,.48)" strokeWidth="6" strokeLinecap="round" />
        <path d="M72 89c30-24 57-30 88-31 31 1 58 7 88 31" fill="none" stroke="rgba(255,183,92,.22)" strokeWidth="5" strokeLinecap="round" />
      </g>

      <g className="seasonal-pumpkin-face" fill="#ffae35" filter="url(#pumpkin-glow)">
        <path d="M73 129 132 112l-16 43-40-5Z" />
        <path d="m247 129-59-17 16 43 40-5Z" />
        <path d="m160 146-15 32h30Z" />
        <path d="M71 190c21 18 42 16 57 5l15 18 17-20 17 20 15-18c15 11 36 13 57-5-9 45-43 66-89 66s-80-21-89-66Z" />
      </g>
      <path d="M86 197c18 9 31 7 42-2l15 18 17-20 17 20 15-18c11 9 24 11 42 2" fill="none" stroke="#6f2d16" strokeWidth="4" opacity=".45" />
    </svg>
  );
}

function CornerWeb() {
  return (
    <svg viewBox="0 0 460 310" className="seasonal-halloween-web" aria-hidden="true">
      <g fill="none" strokeLinecap="round">
        <path d="M455 8c-65 22-83 63-118 85-31 20-57 6-85 38-24 27-22 65-74 74" stroke="#3a2417" strokeWidth="12" />
        <path d="M408 0c-18 28-8 55-31 81M352 74c16-31 47-42 72-43M335 91c-23-12-42-12-63 1" stroke="#6a4026" strokeWidth="4" />
        <g stroke="#b77c4d" strokeWidth="1.3" opacity=".8">
          <path d="M458 6 312 150M458 6 365 181M458 6 423 203M458 6 285 73M458 6 327 28" />
          <path d="M426 38c-34 4-64 16-89 39-25 22-40 47-45 78M394 70c-26 6-48 18-64 36-15 17-23 35-26 54M367 101c-17 6-31 14-42 26-9 10-14 21-17 31" />
        </g>
      </g>
      <g fill="#17110f">
        <path d="M244 70c18-13 33-15 47-5 12-15 27-19 45-10-13 5-21 13-24 25 5 8 7 16 5 25-11-12-23-18-36-18-13 0-24 6-34 18-3-9-2-18 4-26-2-4-4-7-7-9Z" />
        <path d="M330 126c11-8 21-9 30-3 8-9 18-11 28-6-8 4-13 9-14 16 3 5 4 10 3 16-7-7-15-11-23-11s-15 4-22 11c-2-6-1-11 3-16-1-3-3-5-5-7Z" />
      </g>
      <path d="M438 106v72" stroke="#b77c4d" strokeWidth="1.3" />
      <g transform="translate(438 188)" fill="#201411">
        <ellipse rx="8" ry="11" />
        <circle cy="-10" r="5" />
        <path d="M-5-5-18 8M5-5 18 8M-7 0-20 18M7 0 20 18M-5 6-14 27M5 6 14 27" stroke="#201411" strokeWidth="3" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
}

export default function SeasonalDecor() {
  return (
    <div className="seasonal-decor seasonal-halloween" data-seasonal-theme="halloween" aria-hidden="true">
      <CornerWeb />

      <div className="seasonal-halloween-pumpkin-wrap">
        <div className="seasonal-halloween-ground-glow" />
        <Pumpkin />
        <Leaf variant="maple" className="seasonal-ground-leaf seasonal-ground-leaf-a" />
        <Leaf variant="oak" className="seasonal-ground-leaf seasonal-ground-leaf-b" />
        <Leaf variant="birch" className="seasonal-ground-leaf seasonal-ground-leaf-c" />
      </div>

      <div className="seasonal-leaf-field">
        {fallingLeaves.map((leaf, index) => (
          <div
            key={index}
            className="seasonal-falling-leaf"
            style={{
              left: leaf.left,
              width: leaf.size,
              color: leaf.color,
              animationDuration: `${leaf.duration}s`,
              animationDelay: `${leaf.delay}s`,
              ["--leaf-drift" as string]: leaf.drift,
              ["--leaf-rotate" as string]: leaf.rotate,
            }}
          >
            <Leaf variant={leaf.variant} />
          </div>
        ))}
      </div>
    </div>
  );
}

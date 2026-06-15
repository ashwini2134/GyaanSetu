interface CharacterProps {
  skinTone?: string;
  hairColor?: string;
  shirtColor?: string;
  size?: number;
  waving?: boolean;
}

export default function Character({
  skinTone = '#f5d0b8',
  hairColor = '#6b4226',
  shirtColor = '#4a90d9',
  size = 1,
  waving = false,
}: CharacterProps) {
  const w = 80 * size;
  const h = 110 * size;
  return (
    <svg width={w} height={h} viewBox="0 0 80 110">
      <ellipse cx="40" cy="106" rx="18" ry="3" fill="rgba(0,0,0,0.15)" />
      <rect x="26" y="96" width="10" height="7" rx="3" fill="#4a4a4a" />
      <rect x="44" y="96" width="10" height="7" rx="3" fill="#4a4a4a" />
      <rect x="28" y="76" width="6" height="22" rx="3" fill={skinTone} />
      <rect x="46" y="76" width="6" height="22" rx="3" fill={skinTone} />
      <rect x="24" y="40" width="32" height="38" rx="6" fill={shirtColor} />
      <path d="M 24 46 L 14 62" stroke={skinTone} strokeWidth="5" strokeLinecap="round" fill="none" />
      <circle cx="14" cy="62" r="3" fill={skinTone} />
      <g
        style={{ transformOrigin: '56px 46px' }}
        className={waving ? 'sim-arm-wave' : ''}
      >
        <path d="M 56 46 L 68 34" stroke={skinTone} strokeWidth="5" strokeLinecap="round" fill="none" />
        <circle cx="68" cy="34" r="3" fill={skinTone} />
      </g>
      <rect x="37" y="36" width="6" height="7" rx="2" fill={skinTone} />
      <circle cx="40" cy="22" r="16" fill={skinTone} />
      <path d="M 24 20 C 24 4, 56 4, 56 20" fill={hairColor} />
      <path d="M 24 20 Q 22 26 25 30" stroke={hairColor} strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M 56 20 Q 58 26 55 30" stroke={hairColor} strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="35" cy="21" r="2.5" fill="#333" />
      <circle cx="45" cy="21" r="2.5" fill="#333" />
      <circle cx="35.5" cy="21" r="1" fill="#111" />
      <circle cx="45.5" cy="21" r="1" fill="#111" />
      <circle cx="35.8" cy="20.2" r="0.6" fill="white" opacity="0.7" />
      <circle cx="45.8" cy="20.2" r="0.6" fill="white" opacity="0.7" />
      <path d="M 35 27 Q 40 32 45 27" stroke="#333" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <circle cx="29" cy="25" r="3" fill="#ff8a8a" opacity="0.25" />
      <circle cx="51" cy="25" r="3" fill="#ff8a8a" opacity="0.25" />
    </svg>
  );
}

interface Props {
  /** How tall the stand is, in px — this is how much it lifts the pot above the ground. */
  height: number;
  width?: number;
}

/** A little wooden plant stand/table/stool — just a plank and two legs, reused at different heights. */
export default function GardenStand({ height, width = 32 }: Props) {
  const legInset = width * 0.18;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} aria-hidden="true">
      <line x1={legInset} y1="5" x2={legInset + 1.5} y2={height} stroke="#8a5f3c" strokeWidth="3" strokeLinecap="round" />
      <line x1={width - legInset} y1="5" x2={width - legInset - 1.5} y2={height} stroke="#8a5f3c" strokeWidth="3" strokeLinecap="round" />
      <rect x="0" y="0" width={width} height="6" rx="2" fill="#a9784f" />
    </svg>
  );
}

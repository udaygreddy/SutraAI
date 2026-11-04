// Phased roadmap: chevron phase headers, feature cards, gate track.
const RED = '#D0271D', RED_TINT = '#FDF0EF', INK = '#1F1F1F', MUTED = '#5C5C5C', LINE = '#DADADA', SURF = '#F4F5F6', WHITE = '#FFFFFF';
const SLATES = ['#2E3338', '#40464C', '#555B61'];

const X0 = 24, W = 216, GAP = 16, D = 14, HY = 76, HH = 58, CY = 146, CH = 160;
const colX = (i) => X0 + i * (W + GAP);

const PHASES = [
  { eyebrow: 'PHASE 1 · MVP', title: 'Gap → fix → test', items: [['F1', 'Gap mining'], ['F2', 'Diagnose and fix'], ['F3', 'Change drafting (diffs)'], ['F4', 'Test generation']] },
  { eyebrow: 'PHASE 2', title: 'Prove and build', items: [['F5', 'Simulation in sandbox'], ['F6', 'Auto-fix loop'], ['F7', 'Build agent from SOPs']] },
  { eyebrow: 'PHASE 3', title: 'Voice and operations', items: [['F9', 'Voice-specific QA'], ['F10', 'Release monitoring'], ['F11', 'Team approval loop'], ['F12', 'Unmet intent discovery']] },
  { eyebrow: 'PHASE 4', title: 'Edit by request', items: [['F8', 'Natural-language editing']] },
];
const GATES = [
  ['GATE 1', 'New tests fail on today’s agent;', 'reviewers accept the fixes'],
  ['GATE 2', 'Fixes pass in the sandbox', 'with no regressions'],
  ['GATE 3', 'Validation gate trusted', 'by the team'],
];

const chevron = (i, fill) => {
  const l = colX(i), r = l + W, y = HY, h = HH;
  const pts = [[l, y], [r, y], [r + D, y + h / 2], [r, y + h], [l, y + h], [l + (i ? D : 0), y + h / 2]];
  return <polygon points={pts.map((p) => p.join(',')).join(' ')} fill={fill}/>;
};

export default () => (
  <svg viewBox='0 0 960 432' role='img' aria-label='Roadmap: start with F1 to F4, prove and build in Phase 2, then voice and operations, then editing by request' fontSize='13'>
    <defs>
      <filter id='rm-sh' x='-10%' y='-10%' width='120%' height='130%'><feDropShadow dx='0' dy='1.5' stdDeviation='2' floodColor='#000' floodOpacity='0.08'/></filter>
    </defs>
    <text x='24' y='30' fontSize='17' fontWeight='700' fill={INK}>Start with F1–F4, then prove and build in a sandbox before adding more</text>
    <text x='24' y='52' fontSize='12.5' fill={MUTED}>Four phases in order · each gate must pass before the next phase starts · no dates set yet</text>

    {PHASES.map((p, i) => (
      <g>
        {chevron(i, i === 0 ? RED : SLATES.at(Math.min(i - 1, 2)))}
        <text x={colX(i) + (i ? D : 0) + 16} y={HY + 23} fontSize='10.5' fontWeight='700' letterSpacing='1.2' fill={WHITE} fillOpacity='0.85'>{p.eyebrow}</text>
        <text x={colX(i) + (i ? D : 0) + 16} y={HY + 43} fontSize='15' fontWeight='700' fill={WHITE}>{p.title}</text>
        <rect x={colX(i)} y={CY} width={W} height={CH} rx='10' fill={WHITE} stroke={i === 0 ? RED : LINE} strokeWidth={i === 0 ? 1.5 : 1} filter='url(#rm-sh)'/>
        {p.items.map(([id, name], k) => (
          <g>
            <rect x={colX(i) + 14} y={CY + 18 + k * 34} width='40' height='22' rx='11' fill={i === 0 ? RED_TINT : SURF}/>
            <text x={colX(i) + 34} y={CY + 33 + k * 34} textAnchor='middle' fontSize='11' fontWeight='700' fill={i === 0 ? RED : SLATES.at(0)}>{id}</text>
            <text x={colX(i) + 64} y={CY + 33.5 + k * 34} fontSize='13' fill={INK}>{name}</text>
          </g>
        ))}
      </g>
    ))}

    <line x1={X0} x2={X0 + 4 * W + 3 * GAP} y1='342' y2='342' stroke={LINE} strokeWidth='2'/>
    <circle cx={X0} cy='342' r='4' fill={RED}/>
    <circle cx={X0 + 4 * W + 3 * GAP} cy='342' r='4' fill={SLATES.at(2)}/>
    {GATES.map(([name, a, b], i) => {
      const x = colX(i) + W + GAP / 2;
      return (
        <g>
          <line x1={x} x2={x} y1={CY + CH + 6} y2='333' stroke={LINE} strokeWidth='1' strokeDasharray='3 3'/>
          <path d={`M${x} 332l10 10l-10 10l-10 -10z`} fill={WHITE} stroke={SLATES.at(0)} strokeWidth='1.75'/>
          <text x={x} y='374' textAnchor='middle' fontSize='11' fontWeight='700' letterSpacing='1' fill={SLATES.at(0)}>{name}</text>
          <text x={x} y='392' textAnchor='middle' fontSize='12' fill={MUTED}>{a}</text>
          <text x={x} y='408' textAnchor='middle' fontSize='12' fill={MUTED}>{b}</text>
        </g>
      );
    })}
  </svg>
);

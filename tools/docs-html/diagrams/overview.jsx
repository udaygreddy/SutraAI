// System architecture: layered lanes from inputs to platform core.
const RED = '#D0271D', RED_TINT = '#FDF0EF', INK = '#1F1F1F', MUTED = '#5C5C5C', LINE = '#DADADA', SURF = '#F4F5F6', PANEL = '#FAFAFA', WHITE = '#FFFFFF';
const SLATE = '#2E3338', SLATE2 = '#454B51', ARROW = '#8C9196';
const L = 152, R = 936, CW = R - L;

const card = (x, y, w, h, opts = {}) => (
  <rect x={x} y={y} width={w} height={h} rx={opts.rx || 8} fill={opts.fill || WHITE} stroke={opts.stroke || LINE} strokeWidth={opts.sw || 1} filter={opts.flat ? undefined : 'url(#ov-sh)'}/>
);
const down = (x, y1, y2) => <path d={`M${x} ${y1}V${y2 - 1}`} stroke={ARROW} strokeWidth='1.5' fill='none' markerEnd='url(#ov-arrow)'/>;
const pill = (x, cy, id) => (
  <g><rect x={x} y={cy - 11} width='38' height='22' rx='11' fill={SLATE}/><text x={x + 19} y={cy + 4} textAnchor='middle' fontSize='11' fontWeight='700' fill={WHITE}>{id}</text></g>
);
const iconBg = (cx, cy, fill) => <circle cx={cx} cy={cy} r='16' fill={fill || SURF}/>;
const iconVoice = (cx, cy) => <g stroke={SLATE} strokeWidth='2' strokeLinecap='round'>{[[-7, 4], [-3.5, 8], [0, 5], [3.5, 9], [7, 3]].map(([dx, h]) => <line x1={cx + dx} x2={cx + dx} y1={cy - h} y2={cy + h}/>)}</g>;
const iconLayers = (cx, cy) => <g fill='none' stroke={SLATE} strokeWidth='1.6' strokeLinejoin='round'><path d={`M${cx - 8} ${cy - 3}l8 -4l8 4l-8 4z`}/><path d={`M${cx - 8} ${cy + 1}l8 4l8 -4`}/><path d={`M${cx - 8} ${cy + 5}l8 4l8 -4`}/></g>;
const iconDoc = (cx, cy) => <g fill='none' stroke={SLATE} strokeWidth='1.6' strokeLinejoin='round'><path d={`M${cx - 6} ${cy - 8}h8l4 4v12h-12z`}/><path d={`M${cx - 3} ${cy}h6M${cx - 3} ${cy + 4}h6`}/></g>;
const iconPerson = (cx, cy) => <g fill='none' stroke={RED} strokeWidth='1.8'><circle cx={cx} cy={cy - 4} r='3.6'/><path d={`M${cx - 7} ${cy + 8}c1 -5 4 -7 7 -7s6 2 7 7`} strokeLinecap='round'/></g>;
const iconLock = (cx, cy) => <g fill='none' stroke={SLATE} strokeWidth='1.7'><rect x={cx - 6.5} y={cy - 1} width='13' height='10' rx='2'/><path d={`M${cx - 4} ${cy - 1}v-3a4 4 0 0 1 8 0v3`}/></g>;

const LANES = [['INPUTS', 104], ['INGEST', 180], ['PIPELINES', 286], ['SHARED STAGES', 418], ['GOVERNANCE', 520], ['PLATFORM', 600]];
const CORE = ['LLM client', 'Filters', 'Claims', 'Aggregation', 'Verify loop', 'Coverage', 'Diffing'];

const inputs = [
  [L, 'Voice sessions', 'transcripts + traces', iconVoice],
  [L + 270, 'Agent metadata', 'topics, actions, articles', iconLayers],
  [L + 540, 'SOPs', 'documents + SME transcripts', iconDoc],
];

export default () => {
  let cx = L + 132;
  const chips = CORE.map((t) => { const w = t.length * 6.9 + 22, x = cx; cx += w + 8; return [x, w, t]; });
  return (
    <svg viewBox='0 0 960 648' role='img' aria-label='System architecture: two paths feed one drafting and test stage, and a human approves every change' fontSize='13'>
      <defs>
        <filter id='ov-sh' x='-5%' y='-10%' width='110%' height='130%'><feDropShadow dx='0' dy='1.5' stdDeviation='2' floodColor='#000' floodOpacity='0.08'/></filter>
        <marker id='ov-arrow' viewBox='0 0 10 10' refX='8.5' refY='5' markerWidth='7' markerHeight='7' orient='auto-start-reverse'><path d='M0 0L10 5L0 10z' fill={ARROW}/></marker>
      </defs>
      <text x='24' y='30' fontSize='17' fontWeight='700' fill={INK}>Two paths feed one drafting and test stage; a human approves every change</text>
      <text x='24' y='52' fontSize='12.5' fill={MUTED}>SutraAI Ghostwriter · system architecture for the first build (F1–F4, F7)</text>

      <line x1='136' x2='136' y1='76' y2='628' stroke={LINE}/>
      {LANES.map(([name, y]) => <text x='124' y={y + 4} textAnchor='end' fontSize='10.5' fontWeight='700' letterSpacing='1.1' fill={MUTED}>{name}</text>)}

      {inputs.map(([x, t, s, icon]) => (
        <g>
          {card(x, 76, 246, 56)}
          {iconBg(x + 30, 104)}{icon(x + 30, 104)}
          <text x={x + 56} y='100' fontSize='13.5' fontWeight='700' fill={INK}>{t}</text>
          <text x={x + 56} y='118' fontSize='12' fill={MUTED}>{s}</text>
        </g>
      ))}
      {down(L + 123, 132, 158)}{down(L + 393, 132, 158)}{down(L + 663, 132, 158)}

      {card(L, 158, CW, 44, { fill: SURF, flat: true })}
      <text x={L + CW / 2} y='185' textAnchor='middle' fontSize='13' fill={INK}><tspan fontWeight='700'>Adapters</tspan><tspan fill={MUTED}>  ·  parse  ·  scrub PII  ·  write canonical CSVs</tspan></text>
      {down(L + 256, 202, 226)}{down(L + 668, 202, 226)}

      {card(L, 226, 512, 120, { fill: PANEL, rx: 12, flat: true })}
      <text x={L + 16} y='248' fontSize='10.5' fontWeight='700' letterSpacing='1.1' fill={SLATE}>IMPROVE PATH · LIVE SESSIONS</text>
      {card(L + 16, 262, 228, 64)}{pill(L + 30, 294, 'F1')}
      <text x={L + 80} y='290' fontSize='13.5' fontWeight='700' fill={INK}>Gap mining</text>
      <text x={L + 80} y='308' fontSize='12' fill={MUTED}>recurring failures</text>
      <path d={`M${L + 244} 294H${L + 267}`} stroke={ARROW} strokeWidth='1.5' markerEnd='url(#ov-arrow)'/>
      {card(L + 268, 262, 228, 64)}{pill(L + 282, 294, 'F2')}
      <text x={L + 332} y='290' fontSize='13.5' fontWeight='700' fill={INK}>Diagnose + fix</text>
      <text x={L + 332} y='308' fontSize='12' fill={MUTED}>typed fix + evidence</text>

      {card(L + 532, 226, 252, 120, { fill: PANEL, rx: 12, flat: true })}
      <text x={L + 548} y='248' fontSize='10.5' fontWeight='700' letterSpacing='1.1' fill={SLATE}>BUILD PATH · SOPS</text>
      {card(L + 548, 262, 220, 64)}{pill(L + 562, 294, 'F7')}
      <text x={L + 612} y='290' fontSize='13.5' fontWeight='700' fill={INK}>Build agent spec</text>
      <text x={L + 612} y='308' fontSize='12' fill={MUTED}>topics + action stubs</text>
      {down(L + 256, 346, 372)}{down(L + 658, 346, 372)}

      {card(L, 372, CW, 96, { fill: PANEL, rx: 12, flat: true })}
      <text x={L + 16} y='394' fontSize='10.5' fontWeight='700' letterSpacing='1.1' fill={SLATE}>SHARED STAGES · BOTH PATHS</text>
      {card(L + 16, 406, 368, 50)}{pill(L + 30, 431, 'F3')}
      <text x={L + 80} y='427' fontSize='13.5' fontWeight='700' fill={INK}>Change drafting</text>
      <text x={L + 80} y='444' fontSize='12' fill={MUTED}>marked diffs on the exact element</text>
      {card(L + 400, 406, 368, 50)}{pill(L + 414, 431, 'F4')}
      <text x={L + 464} y='427' fontSize='13.5' fontWeight='700' fill={INK}>Test generation</text>
      <text x={L + 464} y='444' fontSize='12' fill={MUTED}>Testing Center specs that fail today</text>
      {down(L + 256, 468, 494)}

      {card(L, 494, 512, 56, { fill: RED_TINT, stroke: RED, sw: 1.5 })}
      {iconBg(L + 30, 522, WHITE)}{iconPerson(L + 30, 522)}
      <text x={L + 56} y='518' fontSize='13.5' fontWeight='700' fill={INK}>Human review</text>
      <text x={L + 56} y='536' fontSize='12' fill={MUTED}>visualizer · AI findings · accept, reject or edit</text>
      <path d={`M${L + 512} 522H${L + 543}`} stroke={ARROW} strokeWidth='1.5' markerEnd='url(#ov-arrow)'/>
      {card(L + 544, 494, 240, 56)}
      {iconBg(L + 574, 522)}{iconLock(L + 574, 522)}
      <text x={L + 600} y='518' fontSize='13.5' fontWeight='700' fill={INK}>PR-ready change set</text>
      <text x={L + 600} y='536' fontSize='12' fill={MUTED}>never deploys to production</text>

      <rect x={L} y='574' width={CW} height='54' rx='10' fill={SLATE}/>
      <text x={L + 18} y='598' fontSize='13.5' fontWeight='700' fill={WHITE}>Shared core</text>
      <text x={L + 18} y='615' fontSize='11' fill={WHITE} fillOpacity='0.7'>used by every stage</text>
      {chips.map(([x, w, t]) => (
        <g><rect x={x} y='590' width={w} height='22' rx='11' fill={SLATE2}/><text x={x + w / 2} y='605' textAnchor='middle' fontSize='11.5' fill={WHITE}>{t}</text></g>
      ))}
    </svg>
  );
};

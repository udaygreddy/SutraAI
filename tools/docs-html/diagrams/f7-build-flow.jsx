// F7 build flow: four numbered steps, a precheck gate, a bounded loop back, the spec output.
const RED = '#D0271D', RED_TINT = '#FDF0EF', INK = '#1F1F1F', MUTED = '#5C5C5C', LINE = '#DADADA', SURF = '#F4F5F6', WHITE = '#FFFFFF';
const SLATE = '#2E3338', ARROW = '#8C9196';

const CY = 88, CH = 76, CWD = 200, GAP = 32, X0 = 32;
const cx = (i) => X0 + i * (CWD + GAP);
const STEPS = [
  ['Load SOPs', 'sections with page refs'],
  ['Extract claims', 'verbatim quote required'],
  ['Cluster topics', 'reuses KGG aggregation'],
  ['Design topics', 'instructions + stubs'],
];
const DX = cx(3) + CWD / 2, DY = 240, DW = 68, DH = 40;

export default () => (
  <svg viewBox='0 0 960 372' role='img' aria-label='F7 build flow: every topic must pass the build prechecks before the spec is written' fontSize='13'>
    <defs>
      <filter id='f7-sh' x='-10%' y='-10%' width='120%' height='130%'><feDropShadow dx='0' dy='1.5' stdDeviation='2' floodColor='#000' floodOpacity='0.08'/></filter>
      <marker id='f7-arrow' viewBox='0 0 10 10' refX='8.5' refY='5' markerWidth='7' markerHeight='7' orient='auto-start-reverse'><path d='M0 0L10 5L0 10z' fill={ARROW}/></marker>
      <marker id='f7-arrow-red' viewBox='0 0 10 10' refX='8.5' refY='5' markerWidth='7' markerHeight='7' orient='auto-start-reverse'><path d='M0 0L10 5L0 10z' fill={RED}/></marker>
    </defs>
    <text x='24' y='30' fontSize='17' fontWeight='700' fill={INK}>Every topic must pass the build prechecks before the spec is written</text>
    <text x='24' y='52' fontSize='12.5' fill={MUTED}>F7 · Build agent from SOPs</text>

    <path d={`M${DX + DW} ${DY}H936V72H${cx(2) + CWD / 2}V${CY - 1}`} fill='none' stroke={RED} strokeWidth='1.5' strokeDasharray='5 4' markerEnd='url(#f7-arrow-red)'/>
    <text x='928' y='66' textAnchor='end' fontSize='11.5' fontWeight='600' fill={RED}>No · major findings send the topic back (max 2 rounds)</text>

    {STEPS.map(([t, s], i) => (
      <g>
        <rect x={cx(i)} y={CY} width={CWD} height={CH} rx='10' fill={WHITE} stroke={LINE} filter='url(#f7-sh)'/>
        <circle cx={cx(i) + 28} cy={CY + 28} r='13' fill={SLATE}/>
        <text x={cx(i) + 28} y={CY + 32.5} textAnchor='middle' fontSize='12.5' fontWeight='700' fill={WHITE}>{i + 1}</text>
        <text x={cx(i) + 50} y={CY + 33} fontSize='14' fontWeight='700' fill={INK}>{t}</text>
        <text x={cx(i) + 18} y={CY + 60} fontSize='12' fill={MUTED}>{s}</text>
        {i < 3 ? <path d={`M${cx(i) + CWD} ${CY + CH / 2}H${cx(i + 1) - 1}`} stroke={ARROW} strokeWidth='1.5' markerEnd='url(#f7-arrow)'/> : null}
      </g>
    ))}

    <path d={`M${DX} ${CY + CH}V${DY - DH - 1}`} stroke={ARROW} strokeWidth='1.5' markerEnd='url(#f7-arrow)'/>
    <polygon points={`${DX - DW},${DY} ${DX},${DY - DH} ${DX + DW},${DY} ${DX},${DY + DH}`} fill={WHITE} stroke={SLATE} strokeWidth='1.75' filter='url(#f7-sh)'/>
    <text x={DX} y={DY - 3} textAnchor='middle' fontSize='12.5' fontWeight='700' fill={INK}>Prechecks</text>
    <text x={DX} y={DY + 13} textAnchor='middle' fontSize='12.5' fontWeight='700' fill={INK}>pass?</text>

    <path d={`M${DX - DW} ${DY}H${729}`} stroke={ARROW} strokeWidth='1.5' markerEnd='url(#f7-arrow)'/>
    <text x={(DX - DW + 728) / 2} y={DY - 8} textAnchor='middle' fontSize='11.5' fontWeight='600' fill={MUTED}>Yes</text>

    <rect x='328' y={DY - 32} width='400' height='64' rx='10' fill={RED_TINT} stroke={RED} strokeWidth='1.5' filter='url(#f7-sh)'/>
    <circle cx='358' cy={DY} r='16' fill={WHITE}/>
    <g fill='none' stroke={RED} strokeWidth='1.6' strokeLinejoin='round'><path d={`M352 ${DY - 8}h8l4 4v12h-12z`}/><path d={`M355 ${DY}h6M355 ${DY + 4}h6`}/></g>
    <text x='384' y={DY - 4} fontSize='14' fontWeight='700' fill={INK}>Agent spec + metadata + seed tests</text>
    <text x='384' y={DY + 15} fontSize='12' fill={MUTED}>written as F3 diffs when the agent already exists</text>

    <rect x={X0} y='306' width={4 * CWD + 3 * GAP} height='42' rx='8' fill={SURF}/>
    <g fill='none' stroke={SLATE} strokeWidth='1.6' strokeLinecap='round'><path d='M53 322a4 4 0 0 1 0 -6l3 -3a4 4 0 0 1 6 6l-1.5 1.5'/><path d='M60 330a4 4 0 0 1 0 6l-3 3a4 4 0 0 1 -6 -6l1.5 -1.5'/><path d='M54 333l7 -9'/></g>
    <text x='76' y='331' fontSize='12.5' fill={INK}><tspan fontWeight='700'>Traceability</tspan><tspan fill={MUTED}>  ·  every spec element links to the SOP section and the verbatim quote it came from</tspan></text>
  </svg>
);

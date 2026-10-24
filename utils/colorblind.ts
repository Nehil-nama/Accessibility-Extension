export type ColorBlindType = 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
export type ColorBlindMode = 'correct' | 'simulate';

type ActiveType = Exclude<ColorBlindType, 'none'>;
type M3 = number[][];

// What each type of color blindness sees (Machado et al. matrices)
const SIM: Record<ActiveType, M3> = {
  protanopia: [
    [0.152286, 1.052583, -0.204868],
    [0.114503, 0.786281, 0.099216],
    [-0.003882, -0.048116, 1.051998],
  ],
  deuteranopia: [
    [0.367322, 0.860646, -0.227968],
    [0.280085, 0.672501, 0.047413],
    [-0.01182, 0.04294, 0.968881],
  ],
  tritanopia: [
    [1.255528, -0.076749, -0.178779],
    [-0.078411, 0.930809, 0.147602],
    [0.004733, 0.691367, 0.3039],
  ],
};

// Where to redirect the color information that gets "lost"
const SHIFT: Record<ActiveType, M3> = {
  protanopia: [[0, 0, 0], [0.7, 1, 0], [0.7, 0, 1]],
  deuteranopia: [[0, 0, 0], [0.7, 1, 0], [0.7, 0, 1]],
  tritanopia: [[1, 0, 0.7], [0, 1, 0.7], [0, 0, 0]],
};

const I: M3 = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];

// One safe place to read a matrix cell (the matrices are always 3x3)
const at = (m: M3, i: number, j: number): number => m[i]![j]!;

function mul(a: M3, b: M3): M3 {
  return [0, 1, 2].map((i) =>
    [0, 1, 2].map(
      (j) => at(a, i, 0) * at(b, 0, j) + at(a, i, 1) * at(b, 1, j) + at(a, i, 2) * at(b, 2, j),
    ),
  );
}

// corrected = original + shift * (original - simulated)  ->  I + S - S*Sim
function correction(type: ActiveType): M3 {
  const S = SHIFT[type];
  const SSim = mul(S, SIM[type]);
  return [0, 1, 2].map((i) =>
    [0, 1, 2].map((j) => at(I, i, j) + at(S, i, j) - at(SSim, i, j)),
  );
}

// feColorMatrix wants 4 rows of 5 values (R, G, B, A, offset)
export function buildMatrixValues(type: ActiveType, mode: ColorBlindMode): string {
  const m = mode === 'simulate' ? SIM[type] : correction(type);
  const rgbRows = m.flatMap((row) => [...row, 0, 0]);
  return [...rgbRows, 0, 0, 0, 1, 0].join(' ');
}
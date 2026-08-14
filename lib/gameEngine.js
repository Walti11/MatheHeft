/* ------------------------------------------------------------------ */
/* Konfiguration                                                       */
/* ------------------------------------------------------------------ */

export const STAGES = [
  { key: "kg", label: "Kindergarten", max: 20,       mulMax: 5,   allowNegative: false, allowRemainder: false, fine: 0.5 },
  { key: "k1", label: "1. Klasse",    max: 100,      mulMax: 10,  allowNegative: false, allowRemainder: false, fine: 0.5 },
  { key: "k2", label: "2. Klasse",    max: 1000,     mulMax: 10,  allowNegative: false, allowRemainder: false, fine: 0.5 },
  { key: "k3", label: "3. Klasse",    max: 10000,    mulMax: 10,  allowNegative: false, allowRemainder: true,  fine: 0.25 },
  { key: "k4", label: "4. Klasse",    max: 100000,   mulMax: 20,  allowNegative: true,  allowRemainder: true,  fine: 0.25 },
  { key: "k5", label: "5. Klasse",    max: 1000000,  mulMax: 50,  allowNegative: true,  allowRemainder: true,  fine: 0.25 },
  { key: "k6", label: "6. Klasse",    max: 10000000, mulMax: 100, allowNegative: true,  allowRemainder: true,  fine: 0.25 },
];

export const DIFFICULTIES = [
  { key: "leicht", label: "Leicht", mult: 0.5 },
  { key: "mittel", label: "Mittel", mult: 1 },
  { key: "schwer", label: "Schwer", mult: 1.35 },
];

export const CATEGORIES = [
  { key: "add", label: "Addition", symbol: "+" },
  { key: "sub", label: "Subtraktion", symbol: "−" },
  { key: "mul", label: "Multiplikation", symbol: "×" },
  { key: "div", label: "Division", symbol: "÷" },
  { key: "mix", label: "Mischform", symbol: "∗" },
];

export const REWARDS = [
  { threshold: 0,    emoji: "⭐", label: "Stern" },
  { threshold: 50,   emoji: "🐣", label: "Küken" },
  { threshold: 150,  emoji: "🦊", label: "Fuchs" },
  { threshold: 300,  emoji: "🦉", label: "Eule" },
  { threshold: 600,  emoji: "🐬", label: "Delfin" },
  { threshold: 1000, emoji: "🦁", label: "Löwe" },
  { threshold: 2000, emoji: "🐉", label: "Drache" },
  { threshold: 3500, emoji: "🦄", label: "Einhorn" },
  { threshold: 5000, emoji: "🚀", label: "Rakete" },
];

export const BLOCK_SIZES = [20, 30];

/* ------------------------------------------------------------------ */
/* Hilfsfunktionen                                                     */
/* ------------------------------------------------------------------ */

export function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function stageIndex(key) {
  return STAGES.findIndex((s) => s.key === key);
}

export function effectiveRanges(stageKey, diffKey, overrideAS, overrideMul) {
  const stage = STAGES.find((s) => s.key === stageKey) || STAGES[0];
  const diff = DIFFICULTIES.find((d) => d.key === diffKey) || DIFFICULTIES[1];
  const idx = stageIndex(stageKey);
  const next = STAGES[idx + 1];
  const cap = diff.key === "schwer" && next ? next.max : Infinity;
  const defaultAS = Math.max(5, Math.min(Math.round(stage.max * diff.mult), cap));
  const defaultMul = Math.max(3, Math.round(stage.mulMax * diff.mult));
  return {
    stage,
    diff,
    maxAS: overrideAS && overrideAS > 0 ? overrideAS : defaultAS,
    maxMul: overrideMul && overrideMul > 0 ? overrideMul : defaultMul,
    defaultAS,
    defaultMul,
  };
}

export function genAdd(maxAS) {
  const a = randInt(1, maxAS);
  const b = randInt(1, maxAS);
  return { op: "add", a, b, answer: a + b };
}

export function genSub(maxAS, allowNegative) {
  let a = randInt(1, maxAS);
  let b = randInt(1, maxAS);
  if (!allowNegative && b > a) [a, b] = [b, a];
  return { op: "sub", a, b, answer: a - b };
}

export function genMul(maxMul, seriesNumber) {
  // Reihen-Modus: eine feste Zahl (die "Reihe"), die andere von 1-10 (klassisches kleines Einmaleins)
  if (seriesNumber) {
    const a = seriesNumber;
    const b = randInt(1, 10);
    return { op: "mul", a, b, answer: a * b };
  }
  // Gemischter Modus: ein Faktor ist immer einstellig (1-10), der andere im Stufen-Zahlenbereich
  const single = randInt(1, 10);
  const other = randInt(1, Math.max(1, maxMul));
  const swap = Math.random() < 0.5;
  const a = swap ? single : other;
  const b = swap ? other : single;
  return { op: "mul", a, b, answer: a * b };
}

export function genDiv(maxMul, allowRemainder) {
  const divisor = randInt(2, Math.max(2, maxMul));
  const quotient = randInt(1, Math.max(1, maxMul));
  let dividend = divisor * quotient;
  let remainder = 0;
  if (allowRemainder && Math.random() < 0.3) {
    remainder = randInt(1, divisor - 1);
    dividend += remainder;
  }
  return { op: "div", a: dividend, b: divisor, answer: quotient, remainder };
}

export function genByOp(op, maxAS, maxMul, allowNegative, allowRemainder, seriesNumber) {
  switch (op) {
    case "add": return genAdd(maxAS);
    case "sub": return genSub(maxAS, allowNegative);
    case "mul": return genMul(maxMul, seriesNumber);
    case "div": return genDiv(maxMul, allowRemainder);
    default: return genAdd(maxAS);
  }
}

export function rotateTask(t) {
  switch (t.op) {
    case "add":
      return { ...t, a: t.b, b: t.a };
    case "mul":
      return { ...t, a: t.b, b: t.a };
    case "sub":
      return { op: "sub", a: t.a, b: t.answer, answer: t.b };
    case "div":
      if (t.remainder) return null;
      return { op: "div", a: t.a, b: t.answer, answer: t.b, remainder: 0 };
    default:
      return null;
  }
}

export function formatTask(t) {
  const sym = { add: "+", sub: "−", mul: "×", div: "÷" }[t.op];
  return `${t.a} ${sym} ${t.b}`;
}

export function generateBlock(category, maxAS, maxMul, allowNegative, allowRemainder, count, seriesNumber) {
  const tasks = [];
  let pending = null;
  const ops = ["add", "sub", "mul", "div"];
  for (let i = 0; i < count; i++) {
    if (pending && i >= pending.dueIndex) {
      tasks.push(pending.task);
      pending = null;
      continue;
    }
    const op = category === "mix" ? ops[randInt(0, 3)] : category;
    // Reihen-Übung gilt nur, wenn gezielt die Kategorie Multiplikation gewählt wurde
    const base = genByOp(op, maxAS, maxMul, allowNegative, allowRemainder, op === "mul" ? seriesNumber : null);
    tasks.push(base);
    if (!pending && i < count - 2 && Math.random() < 0.28) {
      const rotated = rotateTask(base);
      if (rotated) {
        const gap = randInt(1, 2);
        pending = { task: rotated, dueIndex: Math.min(i + gap, count - 1) };
      }
    }
  }
  if (pending) tasks[tasks.length - 1] = pending.task;
  return tasks.map((t) => ({ ...t, id: genId(), text: formatTask(t) }));
}

export function computeNote(correct, total, fine) {
  const pct = total ? correct / total : 0;
  let raw = 1 + pct * 5;
  let rounded = Math.round(raw / fine) * fine;
  rounded = Math.min(6, Math.max(1, rounded));
  return Math.round(rounded * 100) / 100;
}

export function formatNote(n) {
  const r = Math.round(n * 100) / 100;
  return Number.isInteger(r) ? r.toFixed(1) : r.toString();
}

export function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = (totalSeconds % 60).toFixed(1);
  return `${m}:${s.padStart(4, "0")}`;
}

export function comboKey(stageKey, category, diffKey, blockSize, mulSeries) {
  return `${stageKey}|${category}|${diffKey}|${blockSize}|${mulSeries || "x"}`;
}

export function unlockedRewards(points) {
  return REWARDS.filter((r) => points >= r.threshold);
}
export function nextReward(points) {
  return REWARDS.find((r) => points < r.threshold) || null;
}

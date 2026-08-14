"use client";

import { ChevronRight, Plus, Minus, X as XIcon, Divide, Sparkles } from "lucide-react";
import { STAGES, DIFFICULTIES, CATEGORIES, BLOCK_SIZES, effectiveRanges } from "@/lib/gameEngine";

const CATEGORY_ICONS = { add: Plus, sub: Minus, mul: XIcon, div: Divide, mix: Sparkles };

export default function SelectScreen({ config, setConfig, onStart }) {
  const { stage, maxAS, maxMul, defaultAS, defaultMul } = effectiveRanges(
    config.stageKey, config.diffKey, config.overrideAS, config.overrideMul
  );
  const isSeriesMode = config.category === "mul" && config.mulMode === "series";
  const needsMul = (config.category === "mul" || config.category === "div" || config.category === "mix") && !isSeriesMode;

  return (
    <div className="mh-page">
      <h1 className="mh-h1">Was möchtest du üben?</h1>

      <div className="mh-card">
        <div className="mh-label">Stufe</div>
        <div className="mh-chip-row">
          {STAGES.map((s) => (
            <button
              key={s.key}
              className={`mh-chip ${config.stageKey === s.key ? "mh-chip-active" : ""}`}
              onClick={() => setConfig((c) => ({ ...c, stageKey: s.key, overrideAS: null, overrideMul: null }))}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="mh-label">Kategorie</div>
        <div className="mh-chip-row">
          {CATEGORIES.map((c) => {
            const Icon = CATEGORY_ICONS[c.key];
            return (
              <button
                key={c.key}
                className={`mh-chip ${config.category === c.key ? "mh-chip-active" : ""}`}
                onClick={() => setConfig((cf) => ({ ...cf, category: c.key }))}
              >
                <Icon size={16} style={{ marginRight: 6, verticalAlign: -3 }} />
                {c.label}
              </button>
            );
          })}
        </div>

        {config.category === "mul" && (
          <>
            <div className="mh-label">Art</div>
            <div className="mh-chip-row">
              <button
                className={`mh-chip ${config.mulMode === "mixed" ? "mh-chip-active" : ""}`}
                onClick={() => setConfig((c) => ({ ...c, mulMode: "mixed" }))}
              >
                Gemischt (1×1)
              </button>
              <button
                className={`mh-chip ${config.mulMode === "series" ? "mh-chip-active" : ""}`}
                onClick={() => setConfig((c) => ({ ...c, mulMode: "series" }))}
              >
                Reihe üben
              </button>
            </div>
            {config.mulMode === "series" && (
              <>
                <div className="mh-label">Welche Reihe?</div>
                <div className="mh-chip-row">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                    <button
                      key={n}
                      className={`mh-chip ${config.mulSeries === n ? "mh-chip-active" : ""}`}
                      onClick={() => setConfig((c) => ({ ...c, mulSeries: n }))}
                    >
                      {n}er-Reihe
                    </button>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        <div className="mh-label">Schwierigkeit</div>
        <div className="mh-chip-row">
          {DIFFICULTIES.map((d) => (
            <button
              key={d.key}
              className={`mh-chip ${config.diffKey === d.key ? "mh-chip-active" : ""}`}
              onClick={() => setConfig((c) => ({ ...c, diffKey: d.key, overrideAS: null, overrideMul: null }))}
            >
              {d.label}
            </button>
          ))}
        </div>

        <div className="mh-label">Blockgrösse</div>
        <div className="mh-chip-row">
          {BLOCK_SIZES.map((n) => (
            <button
              key={n}
              className={`mh-chip ${config.blockSize === n ? "mh-chip-active" : ""}`}
              onClick={() => setConfig((c) => ({ ...c, blockSize: n }))}
            >
              {n} Aufgaben
            </button>
          ))}
        </div>

        <div className="mh-label">Zahlenbereich (Addition / Subtraktion) bis</div>
        <input
          type="number"
          className="mh-input mh-input-narrow"
          min={5}
          value={config.overrideAS ?? defaultAS}
          onChange={(e) => setConfig((c) => ({ ...c, overrideAS: Number(e.target.value) || defaultAS }))}
        />

        {needsMul && (
          <>
            <div className="mh-label">Zahlenbereich (Mal / Geteilt) bis</div>
            <input
              type="number"
              className="mh-input mh-input-narrow"
              min={3}
              value={config.overrideMul ?? defaultMul}
              onChange={(e) => setConfig((c) => ({ ...c, overrideMul: Number(e.target.value) || defaultMul }))}
            />
          </>
        )}

        <button
          className="mh-btn mh-btn-primary mh-btn-big"
          onClick={() =>
            onStart({
              stageKey: config.stageKey,
              category: config.category,
              diffKey: config.diffKey,
              blockSize: config.blockSize,
              maxAS,
              maxMul,
              mulSeries: isSeriesMode ? config.mulSeries : null,
              allowNegative: stage.allowNegative,
              allowRemainder: stage.allowRemainder,
              fine: stage.fine,
            })
          }
        >
          Los geht&apos;s! <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Timer, ArrowLeft, Delete } from "lucide-react";
import { generateBlock, formatTime } from "@/lib/gameEngine";

export default function PlayScreen({ runConfig, onFinish, onAbort }) {
  const [tasks] = useState(() =>
    generateBlock(
      runConfig.category, runConfig.maxAS, runConfig.maxMul,
      runConfig.allowNegative, runConfig.allowRemainder, runConfig.blockSize,
      runConfig.mulSeries
    )
  );
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null); // 'good' | 'bad'
  const [results, setResults] = useState([]);
  const [startTime] = useState(() => Date.now());
  const [elapsed, setElapsed] = useState(0);
  const lockedRef = useRef(false);

  useEffect(() => {
    const iv = setInterval(() => setElapsed((Date.now() - startTime) / 1000), 100);
    return () => clearInterval(iv);
  }, [startTime]);

  const current = tasks[index];

  const submit = useCallback(() => {
    if (lockedRef.current) return;
    if (answer === "" || answer === "-") return;
    lockedRef.current = true;
    const given = Number(answer);
    const isCorrect = given === current.answer;
    setFeedback(isCorrect ? "good" : "bad");
    setResults((r) => [...r, { text: current.text, given, correctAnswer: current.answer, isCorrect, op: current.op }]);
    setTimeout(() => {
      setFeedback(null);
      setAnswer("");
      lockedRef.current = false;
      if (index + 1 >= tasks.length) {
        onFinish({
          tasks: results.concat([{ text: current.text, given, correctAnswer: current.answer, isCorrect, op: current.op }]),
          timeSeconds: (Date.now() - startTime) / 1000,
        });
      } else {
        setIndex((i) => i + 1);
      }
    }, 550);
  }, [answer, current, index, tasks.length, results, onFinish, startTime]);

  const pressDigit = (d) => setAnswer((a) => (a.length < 8 ? a + d : a));
  const pressBack = () => setAnswer((a) => a.slice(0, -1));
  const pressSign = () => setAnswer((a) => (a.startsWith("-") ? a.slice(1) : "-" + a));

  useEffect(() => {
    const handler = (e) => {
      if (feedback) return;
      if (e.key >= "0" && e.key <= "9") pressDigit(e.key);
      else if (e.key === "Backspace") pressBack();
      else if (e.key === "Enter") submit();
      else if (e.key === "-" && runConfig.allowNegative) pressSign();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [submit, feedback, runConfig.allowNegative]);

  return (
    <div className="mh-page mh-play">
      <div className="mh-play-header">
        <button className="mh-icon-btn" onClick={onAbort} aria-label="Abbrechen">
          <ArrowLeft size={18} /> Abbrechen
        </button>
        <div className="mh-progress-wrap">
          <div className="mh-progress-track">
            <div className="mh-progress-fill" style={{ width: `${(index / tasks.length) * 100}%` }} />
          </div>
          <span className="mh-subtle">Aufgabe {index + 1} / {tasks.length}</span>
        </div>
        <div className="mh-timer">
          <Timer size={16} style={{ marginRight: 4 }} />
          {formatTime(elapsed)}
        </div>
      </div>

      <div className="mh-task-card">
        <div className="mh-task-text">
          {current.text} = <span className="mh-task-answer">{answer || "?"}</span>
        </div>
        {feedback && (
          <div className={`mh-stamp ${feedback === "good" ? "mh-stamp-good" : "mh-stamp-bad"}`}>
            {feedback === "good" ? "RICHTIG!" : "NOCHMAL!"}
          </div>
        )}
      </div>

      <div className="mh-keypad">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
          <button key={d} className="mh-key" onClick={() => pressDigit(String(d))}>
            {d}
          </button>
        ))}
        {runConfig.allowNegative ? (
          <button className="mh-key mh-key-func" onClick={pressSign}>±</button>
        ) : (
          <div />
        )}
        <button className="mh-key" onClick={() => pressDigit("0")}>0</button>
        <button className="mh-key mh-key-func" onClick={pressBack}>
          <Delete size={20} />
        </button>
      </div>
      <button className="mh-btn mh-btn-primary mh-btn-big" onClick={submit}>
        Prüfen (Enter)
      </button>
    </div>
  );
}

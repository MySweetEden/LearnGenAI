import { useMemo, useState } from "react";

type Instrument = "guitar" | "ukulele";
type Difficulty = "easy" | "medium" | "hard";

type Chord = {
  name: string;
  difficulty: Difficulty;
  role: string;
  alternatives: string[];
};

const chords: Chord[] = [
  { name: "C", difficulty: "easy", role: "I", alternatives: ["Cmaj7", "Cadd9"] },
  { name: "G", difficulty: "easy", role: "V", alternatives: ["G6", "Gsus4"] },
  { name: "Am", difficulty: "easy", role: "vi", alternatives: ["Am7", "Fmaj7/A"] },
  { name: "F", difficulty: "medium", role: "IV", alternatives: ["Fmaj7", "Dm7/F"] },
  { name: "Bm7b5", difficulty: "hard", role: "vii", alternatives: ["Dm/B", "G7/B"] },
  { name: "E7", difficulty: "medium", role: "V/vi", alternatives: ["Esus4", "G#dim"] },
];

const timeline = [
  { time: "0:00", part: "Intro", chords: ["C", "G", "Am", "F"], confidence: 94 },
  { time: "0:16", part: "Verse", chords: ["C", "G", "Am", "F"], confidence: 91 },
  { time: "0:48", part: "Pre", chords: ["Dm", "G", "C", "E7"], confidence: 88 },
  { time: "1:05", part: "Hook", chords: ["F", "G", "Am", "G"], confidence: 93 },
  { time: "1:21", part: "Hook", chords: ["F", "G", "C", "E7"], confidence: 90 },
];

const voicings: Record<Instrument, string[]> = {
  guitar: ["C x32010", "G 320003", "Am x02210", "F xx3211"],
  ukulele: ["C 0003", "G 0232", "Am 2000", "F 2010"],
};

const difficultyLabel: Record<Difficulty, string> = {
  easy: "基本",
  medium: "要練習",
  hard: "避ける",
};

function App() {
  const [instrument, setInstrument] = useState<Instrument>("guitar");
  const [allowed, setAllowed] = useState<Record<string, boolean>>({
    C: true,
    G: true,
    Am: true,
    F: false,
    Bm7b5: false,
    E7: true,
  });

  const arrangedTimeline = useMemo(
    () =>
      timeline.map((line) => ({
        ...line,
        chords: line.chords.map((name) => {
          const chord = chords.find((entry) => entry.name === name);
          return chord && !allowed[name] ? chord.alternatives[0] : name;
        }),
      })),
    [allowed],
  );

  const blockedChords = useMemo(
    () => chords.filter((chord) => !allowed[chord.name]),
    [allowed],
  );

  const lowConfidence = timeline.filter((line) => line.confidence < 90).length;

  return (
    <main className="app-shell">
      <header className="app-header">
        <div className="brand">
          <span className="brand-mark">C</span>
          <strong>Chordcraft</strong>
        </div>

        <form className="url-bar">
          <input
            aria-label="YouTube URL"
            defaultValue="https://www.youtube.com/watch?v=practice-session"
            spellCheck={false}
          />
          <button type="submit">解析</button>
        </form>

        <div className="header-actions">
          <button aria-label="Undo">↺</button>
          <button>保存</button>
        </div>
      </header>

      <section className="status-row" aria-label="Analysis status">
        <span>Midnight Practice</span>
        <span>♩ 94</span>
        <span>信頼度 93%</span>
        <span>{blockedChords.length}件を代替</span>
        <span>{lowConfidence}件を確認</span>
      </section>

      <section className="workspace" aria-label="Chord editor">
        <section className="score-panel" aria-label="Chord sheet">
          <div className="panel-title">
            <h1>コード譜</h1>
            <div className="segmented" aria-label="Instrument">
              <button
                className={instrument === "guitar" ? "active" : ""}
                onClick={() => setInstrument("guitar")}
              >
                Guitar
              </button>
              <button
                className={instrument === "ukulele" ? "active" : ""}
                onClick={() => setInstrument("ukulele")}
              >
                Ukulele
              </button>
            </div>
          </div>

          <div className="sheet">
            {arrangedTimeline.map((line) => (
              <article className="sheet-line" key={`${line.time}-${line.part}`}>
                <span className="time">{line.time}</span>
                <span className="part">{line.part}</span>
                <div className="progression">
                  {line.chords.map((name, index) => (
                    <button className="chord-token" key={`${line.time}-${name}-${index}`}>
                      {name}
                    </button>
                  ))}
                </div>
                <span className={line.confidence < 90 ? "quality warn" : "quality"}>
                  {line.confidence}
                </span>
              </article>
            ))}
          </div>
        </section>

        <aside className="side-panel" aria-label="Practice controls">
          <section className="compact-card">
            <div className="panel-title">
              <h2>使えるコード</h2>
              <span>{chords.length - blockedChords.length}/{chords.length}</span>
            </div>

            <div className="chord-list">
              {chords.map((chord) => (
                <label className="chord-rule" key={chord.name}>
                  <input
                    type="checkbox"
                    checked={allowed[chord.name]}
                    onChange={() =>
                      setAllowed((current) => ({
                        ...current,
                        [chord.name]: !current[chord.name],
                      }))
                    }
                  />
                  <strong>{chord.name}</strong>
                  <span className={`dot ${chord.difficulty}`} />
                  <small>{difficultyLabel[chord.difficulty]}</small>
                  <em>{allowed[chord.name] ? "使用" : chord.alternatives[0]}</em>
                </label>
              ))}
            </div>
          </section>

          <section className="compact-card">
            <div className="panel-title">
              <h2>運指</h2>
              <span>{instrument}</span>
            </div>
            <div className="shape-grid">
              {voicings[instrument].map((shape) => {
                const [name, frets] = shape.split(" ");
                return (
                  <div className="shape" key={shape}>
                    <strong>{name}</strong>
                    <code>{frets}</code>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="compact-card">
            <div className="panel-title">
              <h2>練習</h2>
              <button>再計算</button>
            </div>
            <ol className="drills">
              <li>
                <strong>Hook loop</strong>
                <span>F → Fmaj7 / 78bpm</span>
              </li>
              <li>
                <strong>Change drill</strong>
                <span>C → G → Am</span>
              </li>
              <li>
                <strong>Check</strong>
                <span>0:48 を聴き直す</span>
              </li>
            </ol>
          </section>
        </aside>
      </section>
    </main>
  );
}

export default App;

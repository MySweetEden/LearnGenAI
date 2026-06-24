import { useMemo, useState } from "react";

type Instrument = "guitar" | "ukulele";
type Chord = {
  name: string;
  difficulty: "easy" | "medium" | "hard";
  role: string;
  barred?: boolean;
  alternatives: string[];
};

const chords: Chord[] = [
  { name: "C", difficulty: "easy", role: "I", alternatives: ["Cmaj7", "Cadd9"] },
  { name: "G", difficulty: "easy", role: "V", alternatives: ["G6", "Gsus4"] },
  { name: "Am", difficulty: "easy", role: "vi", alternatives: ["Am7", "Fmaj7/A"] },
  { name: "F", difficulty: "medium", role: "IV", barred: true, alternatives: ["Fmaj7", "Dm7/F"] },
  { name: "Bm7b5", difficulty: "hard", role: "vii", barred: true, alternatives: ["Dm/B", "G7/B"] },
  { name: "E7", difficulty: "medium", role: "V/vi", alternatives: ["Esus4", "G#dim"] },
];

const timeline = [
  { time: "0:00", section: "Intro", bar: "C  G  Am  F", confidence: 94 },
  { time: "0:16", section: "Verse", bar: "C  G  Am  F", confidence: 91 },
  { time: "0:48", section: "Pre", bar: "Dm  G  C  E7", confidence: 88 },
  { time: "1:05", section: "Hook", bar: "F  G  Am  G", confidence: 93 },
];

const voicings: Record<Instrument, string[]> = {
  guitar: ["C x32010", "G 320003", "Am x02210", "F xx3211"],
  ukulele: ["C 0003", "G 0232", "Am 2000", "F 2010"],
};

const workflow = ["Import", "Detect", "Arrange", "Practice"];

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

  const blockedCount = useMemo(
    () => chords.filter((chord) => !allowed[chord.name]).length,
    [allowed],
  );

  const simplifiedProgression = useMemo(
    () =>
      timeline.map((item) => ({
        ...item,
        bar: item.bar
          .split("  ")
          .map((name) => {
            const chord = chords.find((entry) => entry.name === name);
            return chord && !allowed[name] ? chord.alternatives[0] : name;
          })
          .join("  "),
      })),
    [allowed],
  );

  return (
    <main className="app-shell">
      <section className="hero-panel">
        <nav className="topbar" aria-label="Primary">
          <div className="brand">
            <span className="brand-mark">C</span>
            <span>Chordcraft Studio</span>
          </div>
          <div className="top-actions">
            <button className="icon-button" aria-label="履歴">
              ↺
            </button>
            <button className="primary-small">譜面を保存</button>
          </div>
        </nav>

        <div className="workflow-rail" aria-label="Workflow">
          {workflow.map((step, index) => (
            <span key={step}>
              {String(index + 1).padStart(2, "0")} {step}
            </span>
          ))}
        </div>

        <div className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">YouTube to practice-ready chord sheets</p>
            <h1>
              <span>耳コピを、</span>
              <span>練習に耐える</span>
              <span>譜面へ。</span>
            </h1>
            <p className="lead">
              音声解析、コード推定、ギター/ウクレレ運指、実力別の代替コード生成をひとつの作業台に集約します。
            </p>

            <div className="youtube-input" role="search">
              <span className="input-glyph">▶</span>
              <input
                aria-label="YouTube URL"
                defaultValue="https://www.youtube.com/watch?v=practice-session"
                spellCheck={false}
              />
              <button>解析</button>
            </div>

            <div className="hero-metrics" aria-label="Analysis summary">
              <div>
                <strong>93%</strong>
                <span>推定信頼度</span>
              </div>
              <div>
                <strong>24</strong>
                <span>小節</span>
              </div>
              <div>
                <strong>{blockedCount}</strong>
                <span>代替対象</span>
              </div>
            </div>
          </div>

          <section className="score-surface" aria-label="Generated chord sheet preview">
            <div className="score-header">
              <div>
                <span className="song-label">Imported track</span>
                <h2>Midnight Practice</h2>
              </div>
              <div className="tempo-pill">♩ 94</div>
            </div>

            <div className="section-tabs" role="tablist" aria-label="Sections">
              <button className="active">コード譜</button>
              <button>運指</button>
              <button>練習</button>
            </div>

            <div className="chord-sheet">
              {simplifiedProgression.map((line) => (
                <div className="sheet-row" key={`${line.time}-${line.section}`}>
                  <span className="time">{line.time}</span>
                  <span className="section">{line.section}</span>
                  <strong>{line.bar}</strong>
                  <span className="confidence">{line.confidence}%</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="quick-editor" aria-label="Fast arrangement controls">
          <div className="quick-item subtract">
            <span>Subtract</span>
            <strong>F, Bm7b5</strong>
            <small>弾けないコードを即時に除外</small>
          </div>
          <div className="quick-item add">
            <span>Add</span>
            <strong>Fmaj7, Dm/B</strong>
            <small>響きを保つ代替を自動提案</small>
          </div>
          <div className="quick-item neutral">
            <span>Export</span>
            <strong>Guitar / Ukulele</strong>
            <small>譜面と運指を同時に出力</small>
          </div>
        </div>
      </section>

      <section className="workspace-grid" aria-label="Practice workspace">
        <div className="control-panel">
          <div className="panel-heading">
            <div>
              <span className="panel-kicker">Subtract friction</span>
              <h2>使えるコードだけを残す</h2>
            </div>
            <span className="status-dot">{blockedCount} hidden</span>
          </div>

          <div className="instrument-toggle" aria-label="Instrument">
            <button
              className={instrument === "guitar" ? "selected" : ""}
              onClick={() => setInstrument("guitar")}
            >
              Guitar
            </button>
            <button
              className={instrument === "ukulele" ? "selected" : ""}
              onClick={() => setInstrument("ukulele")}
            >
              Ukulele
            </button>
          </div>

          <div className="chord-permissions">
            {chords.map((chord) => (
              <label className="permission-row" key={chord.name}>
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
                <span className={`difficulty ${chord.difficulty}`} />
                <strong>{chord.name}</strong>
                <span>{chord.role}</span>
                <em>{allowed[chord.name] ? "使用" : chord.alternatives[0]}</em>
              </label>
            ))}
          </div>
        </div>

        <div className="practice-panel">
          <div className="panel-heading">
            <div>
              <span className="panel-kicker">Add guidance</span>
              <h2>今日の練習レーン</h2>
            </div>
            <button className="ghost-button">難易度を再計算</button>
          </div>

          <div className="practice-lanes">
            <article>
              <span>01</span>
              <h3>Hook loop</h3>
              <p>F を Fmaj7 に置換し、2小節単位でテンポ78から開始。</p>
            </article>
            <article>
              <span>02</span>
              <h3>Change drill</h3>
              <p>C → G → Am の移動だけを抽出。右手は8分ストローク。</p>
            </article>
            <article>
              <span>03</span>
              <h3>Confidence pass</h3>
              <p>88%以下の小節を聴き比べ、手動修正候補として固定。</p>
            </article>
          </div>
        </div>

        <div className="voicing-strip">
          {voicings[instrument].map((shape) => (
            <div className="voicing-card" key={shape}>
              <span>{instrument}</span>
              <strong>{shape.split(" ")[0]}</strong>
              <code>{shape.split(" ").slice(1).join(" ")}</code>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

export default App;

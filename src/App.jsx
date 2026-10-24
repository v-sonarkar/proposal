import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// ✏️ Personalise these
const HER_NAME = "Ishita";
const HER_FULL_NAME = "Ishita Gupta";
const YOUR_NAME = "Lucky Sharma";

const NO_TEXTS = [
  "No",
  "Are you sure?",
  "Really sure? 🥺",
  "Think again!",
  "Last chance 😢",
  "Surely not?",
  "You might regret this!",
  "Give it another thought!",
  "Are you absolutely certain?",
  "This could be a mistake!",
  "Have a heart! 💔",
  "Don't be so cold!",
  "Change of heart?",
  "Wouldn't you reconsider?",
  "Is that your final answer?",
  "You're breaking my heart 😭",
];

const NO_FACES = ["🥺", "😢", "😭", "💔", "😿", "🙏"];

const LETTER_LINES = [
  `Dear ${HER_FULL_NAME},`,
  "Every moment with you feels like magic ✨",
  "You make my bad days better and my good days unforgettable.",
  "Your smile is my favourite thing in the whole world 😊",
  "So I built this little place on the internet just to ask you something…",
];

const REASONS = [
  { front: "💫", back: "Your smile lights up my whole world" },
  { front: "😂", back: "You laugh at my terrible jokes" },
  { front: "🏡", back: "With you, everything feels like home" },
  { front: "🌙", back: "You're the last thing on my mind every night" },
  { front: "🧸", back: "Your hugs fix everything" },
  { front: "💖", back: "You're the best thing that ever happened to me" },
];

const DATE_IDEAS = [
  { id: "dinner", emoji: "🍝", label: "Candlelight dinner" },
  { id: "movie", emoji: "🎬", label: "Movie night" },
  { id: "drive", emoji: "🚗", label: "Long drive" },
  { id: "icecream", emoji: "🍦", label: "Ice cream date" },
  { id: "beach", emoji: "🌅", label: "Sunset walk" },
  { id: "coffee", emoji: "☕", label: "Coffee & talks" },
  { id: "shopping", emoji: "🛍️", label: "Shopping spree" },
  { id: "picnic", emoji: "🧺", label: "Picnic in the park" },
];

const CATCH_GOAL = 10;

/* ---------------- Sound (Web Audio, no files needed) ---------------- */
let audioCtx = null;
let soundOn = true;
function tone(freq = 600, duration = 0.12, type = "sine", volume = 0.15) {
  if (!soundOn) return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(volume, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch {
    // audio not available — ignore
  }
}
const sfx = {
  pop: () => tone(700 + Math.random() * 300, 0.1, "triangle"),
  bad: () => tone(180, 0.25, "sawtooth", 0.08),
  click: () => tone(520, 0.08),
  win: () => [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => tone(f, 0.25, "triangle"), i * 130)),
};

/* ---------------- Shared visuals ---------------- */
function FloatingHearts({ count = 22 }) {
  const hearts = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 14 + Math.random() * 26,
        duration: 6 + Math.random() * 8,
        delay: Math.random() * 10,
        emoji: ["❤️", "💖", "💕", "💗", "💘", "🌸"][i % 6],
      })),
    [count]
  );
  return (
    <div className="hearts-bg" aria-hidden="true">
      {hearts.map((h) => (
        <span
          key={h.id}
          className="float-heart"
          style={{
            left: `${h.left}%`,
            fontSize: `${h.size}px`,
            animationDuration: `${h.duration}s`,
            animationDelay: `${h.delay}s`,
          }}
        >
          {h.emoji}
        </span>
      ))}
    </div>
  );
}

// Little hearts that pop wherever you tap / click
function TapHearts() {
  const [taps, setTaps] = useState([]);
  useEffect(() => {
    let id = 0;
    const onDown = (e) => {
      const tapId = id++;
      const items = Array.from({ length: 5 }, (_, i) => ({
        key: `${tapId}-${i}`,
        dx: (Math.random() - 0.5) * 120,
        dy: -40 - Math.random() * 80,
        emoji: ["💖", "💕", "✨", "💗", "❤️"][i],
      }));
      setTaps((t) => [...t, { id: tapId, x: e.clientX, y: e.clientY, items }]);
      setTimeout(() => setTaps((t) => t.filter((x) => x.id !== tapId)), 900);
    };
    window.addEventListener("pointerdown", onDown);
    return () => window.removeEventListener("pointerdown", onDown);
  }, []);
  return (
    <div className="tap-layer" aria-hidden="true">
      {taps.map((t) =>
        t.items.map((it) => (
          <span
            key={it.key}
            className="tap-heart"
            style={{ left: t.x, top: t.y, "--dx": `${it.dx}px`, "--dy": `${it.dy}px` }}
          >
            {it.emoji}
          </span>
        ))
      )}
    </div>
  );
}

function Burst() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 70 }, (_, i) => {
        const angle = Math.random() * Math.PI * 2;
        const dist = 150 + Math.random() * 380;
        return {
          id: i,
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist,
          rot: Math.random() * 720 - 360,
          emoji: ["❤️", "💖", "✨", "🎉", "💕", "🌹"][i % 6],
          delay: Math.random() * 0.3,
        };
      }),
    []
  );
  return (
    <div className="burst" aria-hidden="true">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="burst-piece"
          style={{ "--x": `${p.x}px`, "--y": `${p.y}px`, "--r": `${p.rot}deg`, animationDelay: `${p.delay}s` }}
        >
          {p.emoji}
        </span>
      ))}
    </div>
  );
}

function Progress({ step, total }) {
  return (
    <div className="progress" aria-label={`Step ${step + 1} of ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={`dot ${i <= step ? "on" : ""}`}>
          {i <= step ? "❤️" : "🤍"}
        </span>
      ))}
    </div>
  );
}

/* ---------------- Step 1: Envelope ---------------- */
function Envelope({ onDone }) {
  const [opening, setOpening] = useState(false);
  const open = () => {
    if (opening) return;
    sfx.win();
    setOpening(true);
    setTimeout(onDone, 1000);
  };
  return (
    <div className="screen fade-in">
      <h1 className="title">Hey {HER_NAME} 💌</h1>
      <p className="subtitle">{YOUR_NAME} sent you something special…</p>
      <button className={`envelope ${opening ? "opening" : ""}`} onClick={open} aria-label="Open the letter">
        <div className="flap" />
        <div className="letter">❤️</div>
        <div className="pocket" />
        <div className="seal">💗</div>
      </button>
      <p className="hint">Tap the envelope to open</p>
    </div>
  );
}

/* ---------------- Step 2: Catch the hearts game ---------------- */
function CatchHearts({ onDone }) {
  const [score, setScore] = useState(0);
  const [drops, setDrops] = useState([]);
  const [shake, setShake] = useState(false);
  const won = score >= CATCH_GOAL;
  const idRef = useRef(0);

  useEffect(() => {
    if (won) return;
    const spawn = setInterval(() => {
      const bad = Math.random() < 0.2;
      const id = idRef.current++;
      setDrops((d) => [
        ...d,
        {
          id,
          bad,
          left: 5 + Math.random() * 85,
          duration: 3 + Math.random() * 2.5,
          size: 34 + Math.random() * 18,
          emoji: bad ? "💔" : ["❤️", "💖", "💘", "💝"][id % 4],
        },
      ]);
    }, 650);
    return () => clearInterval(spawn);
  }, [won]);

  useEffect(() => {
    if (won) {
      sfx.win();
      setDrops([]);
    }
  }, [won]);

  const catchDrop = (drop) => {
    setDrops((d) => d.filter((x) => x.id !== drop.id));
    if (drop.bad) {
      sfx.bad();
      setScore((s) => Math.max(0, s - 1));
      setShake(true);
      setTimeout(() => setShake(false), 400);
    } else {
      sfx.pop();
      setScore((s) => s + 1);
    }
  };

  return (
    <div className="screen fade-in">
      <h1 className="title">Catch my heart, {HER_NAME}! 💘</h1>
      <p className="subtitle">Tap {CATCH_GOAL} falling hearts to unlock the letter — avoid the 💔</p>
      <div className={`score-card ${shake ? "shake" : ""}`}>
        <div className="score-bar">
          <div className="score-fill" style={{ width: `${Math.min(score / CATCH_GOAL, 1) * 100}%` }} />
        </div>
        <span>
          {Math.min(score, CATCH_GOAL)} / {CATCH_GOAL} ❤️
        </span>
      </div>
      {won && (
        <div className="pop-in won-box">
          <p className="subtitle">You caught my heart (you always do) 🥰</p>
          <button className="btn btn-yes" onClick={onDone}>
            Read the letter 💌
          </button>
        </div>
      )}
      <div className="drop-layer">
        {drops.map((d) => (
          <button
            key={d.id}
            className="drop"
            style={{ left: `${d.left}%`, fontSize: d.size, animationDuration: `${d.duration}s` }}
            onPointerDown={(e) => {
              e.stopPropagation();
              catchDrop(d);
            }}
            onAnimationEnd={() => setDrops((x) => x.filter((y) => y.id !== d.id))}
            aria-label={d.bad ? "Broken heart" : "Heart"}
          >
            {d.emoji}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Step 3: Letter (tap to reveal) ---------------- */
function Letter({ onDone }) {
  const [shown, setShown] = useState(1);
  const finished = shown >= LETTER_LINES.length;
  const next = () => {
    if (finished) return;
    sfx.click();
    setShown((s) => s + 1);
  };
  return (
    <div className="screen fade-in">
      <div className="card letter-card" onClick={next} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && next()}>
        {LETTER_LINES.slice(0, shown).map((l, i) => (
          <p key={i} className={`letter-line ${i === 0 ? "greeting" : ""}`}>
            {l}
          </p>
        ))}
        {!finished && <p className="hint tap-more">Tap to read more 👆</p>}
        {finished && (
          <button
            className="btn btn-yes pop-in"
            onClick={(e) => {
              e.stopPropagation();
              onDone();
            }}
          >
            Continue 💕
          </button>
        )}
      </div>
    </div>
  );
}

/* ---------------- Step 4: Love meter (hold to fill) ---------------- */
function LoveMeter({ onDone }) {
  const [level, setLevel] = useState(0);
  const [holding, setHolding] = useState(false);
  const full = level >= 100;

  useEffect(() => {
    if (full) return;
    const t = setInterval(() => {
      setLevel((l) => {
        const nl = holding ? l + 2 : Math.max(0, l - 1);
        if (holding && Math.floor(nl / 10) > Math.floor(l / 10)) tone(300 + nl * 6, 0.08, "triangle", 0.1);
        return Math.min(nl, 100);
      });
    }, 40);
    return () => clearInterval(t);
  }, [holding, full]);

  useEffect(() => {
    if (full) sfx.win();
  }, [full]);

  const label = full
    ? "∞ Overflowing!"
    : level < 25
    ? "Keep holding…"
    : level < 50
    ? "Warming up 😊"
    : level < 75
    ? "Getting stronger 😍"
    : "Almost there!! 🔥";

  return (
    <div className="screen fade-in">
      <h1 className="title">How much do I love you?</h1>
      <p className="subtitle">Press and hold the heart to find out</p>
      <div className="meter">
        <div className="meter-fill" style={{ height: `${level}%` }} />
        <span className="meter-text">{full ? "∞" : `${level}%`}</span>
      </div>
      <p className="meter-label">{label}</p>
      {!full ? (
        <button
          className={`hold-heart ${holding ? "holding" : ""}`}
          onPointerDown={(e) => {
            e.preventDefault();
            setHolding(true);
          }}
          onPointerUp={() => setHolding(false)}
          onPointerLeave={() => setHolding(false)}
          onContextMenu={(e) => e.preventDefault()}
          aria-label="Hold to fill the love meter"
        >
          💗
        </button>
      ) : (
        <div className="pop-in won-box">
          <p className="subtitle">The meter broke — my love for you has no limit, {HER_NAME} ❤️</p>
          <button className="btn btn-yes" onClick={onDone}>
            One more thing… 💍
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------------- Step 5: The question ---------------- */
function Question({ onDone }) {
  const [noCount, setNoCount] = useState(0);
  const [noPos, setNoPos] = useState(null);
  const noRef = useRef(null);

  const yesScale = Math.min(1 + noCount * 0.22, 5);
  const noScale = Math.max(1 - noCount * 0.05, 0.5);
  const face = noCount === 0 ? "🥰" : NO_FACES[(noCount - 1) % NO_FACES.length];

  const dodge = () => {
    sfx.bad();
    const btn = noRef.current;
    const w = btn?.offsetWidth ?? 120;
    const h = btn?.offsetHeight ?? 50;
    const pad = 16;
    setNoPos({
      left: pad + Math.random() * (window.innerWidth - w - pad * 2),
      top: pad + Math.random() * (window.innerHeight - h - pad * 2),
    });
    setNoCount((c) => c + 1);
  };

  const sayYes = () => {
    sfx.win();
    onDone(noCount);
  };

  return (
    <div className="screen fade-in">
      <div className="big-emoji bounce">{face}</div>
      <h1 className="title">{HER_NAME}, will you be mine? 💘</h1>
      {noCount > 0 && (
        <p className="subtitle">
          {noCount < 5
            ? "Pleaseee 🥺"
            : noCount < 10
            ? "I'm not giving up!"
            : "The Yes button is getting bigger for a reason 😏"}
        </p>
      )}
      <div className="buttons">
        <button className="btn btn-yes" style={{ transform: `scale(${yesScale})` }} onClick={sayYes}>
          Yes 💖
        </button>
        <button
          ref={noRef}
          className="btn btn-no"
          style={{
            transform: `scale(${noScale})`,
            ...(noPos ? { position: "fixed", left: noPos.left, top: noPos.top } : {}),
          }}
          onMouseEnter={dodge}
          onClick={dodge}
        >
          {NO_TEXTS[Math.min(noCount, NO_TEXTS.length - 1)]}
        </button>
      </div>
    </div>
  );
}

/* ---------------- Step 6: Plan our date ---------------- */
function DatePlanner({ onDone }) {
  const [picked, setPicked] = useState([]);
  const toggle = (id) => {
    sfx.pop();
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  };
  return (
    <div className="screen fade-in">
      <Burst />
      <h1 className="title">Yayyy!! 🥳</h1>
      <p className="subtitle">Now let's plan our first date — pick as many as you like!</p>
      <div className="date-grid">
        {DATE_IDEAS.map((d) => (
          <button key={d.id} className={`date-chip ${picked.includes(d.id) ? "picked" : ""}`} onClick={() => toggle(d.id)}>
            <span className="date-emoji">{d.emoji}</span>
            <span>{d.label}</span>
          </button>
        ))}
      </div>
      <button
        className="btn btn-yes"
        disabled={picked.length === 0}
        onClick={() => {
          sfx.win();
          onDone(DATE_IDEAS.filter((d) => picked.includes(d.id)));
        }}
      >
        {picked.length === 0 ? "Pick at least one 💭" : "Lock it in 🔒"}
      </button>
    </div>
  );
}

/* ---------------- Step 7: Celebration ---------------- */
function FlipCard({ front, back }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <button
      className={`flip-card ${flipped ? "flipped" : ""}`}
      onClick={() => {
        sfx.click();
        setFlipped((f) => !f);
      }}
    >
      <div className="flip-inner">
        <div className="flip-front">{front}</div>
        <div className="flip-back">{back}</div>
      </div>
    </button>
  );
}

function Celebration({ noCount, dates, onReplay }) {
  const [hugs, setHugs] = useState(0);
  return (
    <div className="screen fade-in scrollable">
      <Burst />
      <div className="big-emoji heartbeat">💖</div>
      <h1 className="title">
        {HER_NAME} ❤️ {YOUR_NAME.split(" ")[0]}
      </h1>
      <p className="subtitle">
        You just made me the happiest person alive!
        {noCount > 0 && ` (Even after pressing "No" ${noCount} time${noCount > 1 ? "s" : ""} 😜)`}
      </p>

      <div className="card">
        <h2 className="card-title">Our date plans 📅</h2>
        <div className="plan-list">
          {dates.map((d) => (
            <span key={d.id} className="plan-pill">
              {d.emoji} {d.label}
            </span>
          ))}
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">Why I love you</h2>
        <p className="hint">Tap each card to flip it</p>
        <div className="flip-grid">
          {REASONS.map((r) => (
            <FlipCard key={r.back} {...r} />
          ))}
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">Send me virtual hugs 🤗</h2>
        <button
          className="hug-btn"
          onClick={() => {
            sfx.pop();
            setHugs((h) => h + 1);
          }}
        >
          🤗
        </button>
        <p className="subtitle">
          {hugs === 0 ? "Tap to hug me!" : `${hugs} hug${hugs > 1 ? "s" : ""} received${hugs >= 10 ? " — I feel so loved 🥹" : ""}`}
        </p>
      </div>

      <p className="signature">Forever yours, {YOUR_NAME} 💌</p>
      <button className="btn btn-no" onClick={onReplay}>
        Replay ↺
      </button>
    </div>
  );
}

/* ---------------- App ---------------- */
const TOTAL_STEPS = 7;

export default function App() {
  const [step, setStep] = useState(0);
  const [noCount, setNoCount] = useState(0);
  const [dates, setDates] = useState([]);
  const [muted, setMuted] = useState(false);

  const next = useCallback(() => setStep((s) => s + 1), []);

  const toggleSound = (e) => {
    e.stopPropagation();
    soundOn = muted;
    setMuted(!muted);
  };

  return (
    <main className="app">
      <FloatingHearts />
      <TapHearts />
      <Progress step={step} total={TOTAL_STEPS} />
      <button className="sound-btn" onClick={toggleSound} aria-label={muted ? "Unmute" : "Mute"}>
        {muted ? "🔇" : "🔊"}
      </button>

      {step === 0 && <Envelope onDone={next} />}
      {step === 1 && <CatchHearts onDone={next} />}
      {step === 2 && <Letter onDone={next} />}
      {step === 3 && <LoveMeter onDone={next} />}
      {step === 4 && (
        <Question
          onDone={(n) => {
            setNoCount(n);
            next();
          }}
        />
      )}
      {step === 5 && (
        <DatePlanner
          onDone={(d) => {
            setDates(d);
            next();
          }}
        />
      )}
      {step === 6 && (
        <Celebration
          noCount={noCount}
          dates={dates}
          onReplay={() => {
            setStep(0);
            setNoCount(0);
            setDates([]);
          }}
        />
      )}
    </main>
  );
}

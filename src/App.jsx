import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

// ✏️ Personalise these
const HER_NAME = "Ishita";
const HER_FULL_NAME = "Ishita Gupta";
const YOUR_NAME = "Lucky Sharma";
const YOUR_FIRST = YOUR_NAME.split(" ")[0];

const NO_TEXTS = [
  "No",
  "Are you sure?",
  "Really sure? 🥺",
  "Think again!",
  "Last chance 😢",
  "Surely not?",
  "That's bad UX 😤",
  "Wrong button, designer!",
  "Ctrl + Z that please",
  "This could be a mistake!",
  "Have a heart! 💔",
  "Don't be so cold!",
  "Change of heart?",
  "Is that your final draft?",
  "You're breaking my heart 😭",
];

const NO_FACES = ["🥺", "😢", "😭", "💔", "😿", "🙏"];

const LETTER_LINES = [
  `Dear ${HER_FULL_NAME},`,
  "You see beauty in colours, shapes and details nobody else notices 🎨",
  "And somehow, you made my whole life look better designed.",
  "You're my favourite masterpiece — no revisions needed ✨",
  "So I built this little canvas just to ask you something…",
];

const REASONS = [
  { front: "🎨", back: "You turn ordinary things into art" },
  { front: "💫", back: "Your smile lights up my whole world" },
  { front: "✏️", back: "Even your doodles make me smile" },
  { front: "🌙", back: "You're the last thing on my mind every night" },
  { front: "🧸", back: "Your hugs fix everything" },
  { front: "💖", back: "You're the best thing that ever happened to me" },
];

const DATE_IDEAS = [
  { id: "gallery", emoji: "🖼️", label: "Art gallery visit" },
  { id: "dinner", emoji: "🍝", label: "Candlelight dinner" },
  { id: "pottery", emoji: "🏺", label: "Pottery class" },
  { id: "cafe", emoji: "☕", label: "Aesthetic café hopping" },
  { id: "paint", emoji: "🖌️", label: "Paint together" },
  { id: "movie", emoji: "🎬", label: "Movie night" },
  { id: "drive", emoji: "🚗", label: "Long drive" },
  { id: "sunset", emoji: "🌅", label: "Sunset photo walk" },
];

const PALETTES = [
  {
    id: "blush",
    name: "Blush Crush",
    bg1: "#ffdde1", bg2: "#ffc3d0", primary: "#e91e63", accent: "#ff80ab",
    ink: "#5a1a2b", soft: "#ffe4ec", card: "rgba(255,255,255,0.88)",
  },
  {
    id: "lavender",
    name: "Lavender Dream",
    bg1: "#ece6ff", bg2: "#d4c6ff", primary: "#7c4dff", accent: "#b388ff",
    ink: "#2e1a5a", soft: "#efe9ff", card: "rgba(255,255,255,0.88)",
  },
  {
    id: "peach",
    name: "Sunset Peach",
    bg1: "#ffe5d0", bg2: "#ffb199", primary: "#f4511e", accent: "#ffab91",
    ink: "#5a2a1a", soft: "#fff0e6", card: "rgba(255,255,255,0.88)",
  },
  {
    id: "matcha",
    name: "Matcha Latte",
    bg1: "#e3f6ea", bg2: "#b9e4c9", primary: "#2e7d55", accent: "#81c995",
    ink: "#173a28", soft: "#eafaf1", card: "rgba(255,255,255,0.88)",
  },
  {
    id: "midnight",
    name: "Midnight Rose",
    bg1: "#2b1030", bg2: "#4a1942", primary: "#ff4f8b", accent: "#ff9ec4",
    ink: "#ffe6ef", soft: "#5c2652", card: "rgba(58,24,56,0.9)",
  },
];

const FONTS = [
  { id: "dancing", family: "Dancing Script", vibe: "Romantic" },
  { id: "playfair", family: "Playfair Display", vibe: "Editorial" },
  { id: "pacifico", family: "Pacifico", vibe: "Playful" },
  { id: "caveat", family: "Caveat", vibe: "Handwritten" },
  { id: "grotesk", family: "Space Grotesk", vibe: "Modern" },
];

const PUZZLE_WORD = ["I", " ", "L", "O", "V", "E", " ", "Y", "O", "U"];
const CATCH_GOAL = 10;
const BROKEN_HEART_PENALTY = 2; // points lost for tapping a 💔

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
        emoji: ["❤️", "💖", "🎨", "💗", "✏️", "🌸"][i % 6],
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

// Figma-style multiplayer cursors: Ishita's label follows her, Lucky's cursor wanders around
const LUCKY_COMMENTS = [
  YOUR_FIRST,
  `${YOUR_FIRST}: hi cutie 👋`,
  YOUR_FIRST,
  `${YOUR_FIRST}: love this colour on you`,
  YOUR_FIRST,
  `${YOUR_FIRST}: nice kerning 😏`,
  YOUR_FIRST,
  `${YOUR_FIRST}: you're my favourite designer`,
];

function CursorArrow({ color }) {
  return (
    <svg width="18" height="22" viewBox="0 0 18 22" aria-hidden="true">
      <path d="M1 1 L1 17 L5.5 13 L8.5 20.5 L11.5 19.2 L8.6 12 L15 12 Z" fill={color} stroke="#fff" strokeWidth="1.5" />
    </svg>
  );
}

function DesignCursors() {
  const [me, setMe] = useState(null);
  const [lucky, setLucky] = useState({ x: 120, y: 160 });
  const [comment, setComment] = useState(0);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const mv = (e) => setMe({ x: e.clientX, y: e.clientY });
    window.addEventListener("pointermove", mv);
    return () => window.removeEventListener("pointermove", mv);
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setLucky({
        x: 20 + Math.random() * Math.max(window.innerWidth - 260, 60),
        y: 70 + Math.random() * Math.max(window.innerHeight - 140, 60),
      });
      setComment((c) => (c + 1) % LUCKY_COMMENTS.length);
    }, 2600);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="cursor-layer" aria-hidden="true">
      <div className="mp-cursor lucky" style={{ transform: `translate(${lucky.x}px, ${lucky.y}px)` }}>
        <CursorArrow color="#1e88e5" />
        <span className="mp-label" style={{ background: "#1e88e5" }}>
          {LUCKY_COMMENTS[comment]}
        </span>
      </div>
      {me && (
        <div className="mp-cursor me" style={{ transform: `translate(${me.x}px, ${me.y}px)` }}>
          <span className="mp-label" style={{ background: "var(--primary)" }}>
            {HER_NAME}
          </span>
        </div>
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
          emoji: ["❤️", "💖", "✨", "🎉", "🎨", "🌹"][i % 6],
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

function TopBar({ step, total, muted, onToggleSound }) {
  return (
    <header className="topbar">
      <span className="file">
        <span className="logo">◆</span> ishita-x-{YOUR_FIRST.toLowerCase()}.fig
      </span>
      <div className="dots" aria-label={`Frame ${step + 1} of ${total}`}>
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className={`dot ${i <= step ? "on" : ""}`} />
        ))}
      </div>
      <span className="frame">
        Frame {step + 1}/{total}
      </span>
      <button className="sound-btn" onClick={onToggleSound} aria-label={muted ? "Unmute" : "Mute"}>
        {muted ? "🔇" : "🔊"}
      </button>
    </header>
  );
}

/* ---------------- Step: Envelope ---------------- */
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
      <p className="tag">NEW DESIGN BRIEF · FROM {YOUR_NAME.toUpperCase()}</p>
      <h1 className="title">Hey {HER_NAME} 💌</h1>
      <p className="subtitle">A very special client has a project only you can handle…</p>
      <button className={`envelope ${opening ? "opening" : ""}`} onClick={open} aria-label="Open the brief">
        <div className="flap" />
        <div className="letter">🎨</div>
        <div className="pocket" />
        <div className="seal">💗</div>
      </button>
      <p className="hint">Tap the envelope to open the brief</p>
    </div>
  );
}

/* ---------------- Step: Pick the palette ---------------- */
function PalettePicker({ palette, onPick, onDone }) {
  return (
    <div className="screen fade-in">
      <p className="tag">TASK 01 · COLOUR THEORY</p>
      <h1 className="title">You're the designer here 🎨</h1>
      <p className="subtitle">Pick a palette — this whole website will wear your colours</p>
      <div className="palette-grid">
        {PALETTES.map((p) => (
          <button
            key={p.id}
            className={`palette-card ${palette.id === p.id ? "picked" : ""}`}
            onClick={() => {
              sfx.pop();
              onPick(p);
            }}
          >
            <div className="swatches">
              {[p.bg1, p.bg2, p.accent, p.primary, p.ink].map((c) => (
                <span key={c} style={{ background: c }} />
              ))}
            </div>
            <span className="palette-name">{p.name}</span>
            <span className="hex">{p.primary.toUpperCase()}</span>
          </button>
        ))}
      </div>
      <button
        className="btn btn-yes"
        onClick={() => {
          sfx.win();
          onDone();
        }}
      >
        Apply theme ✓
      </button>
    </div>
  );
}

/* ---------------- Step: Catch the hearts game ---------------- */
function CatchHearts({ onDone }) {
  const [score, setScore] = useState(0);
  const [drops, setDrops] = useState([]);
  const [shake, setShake] = useState(false);
  const [popups, setPopups] = useState([]);
  const won = score >= CATCH_GOAL;
  const idRef = useRef(0);

  // floating "+1" / "−2" text where the heart was tapped
  const showPopup = (x, y, text, bad) => {
    const id = idRef.current++;
    setPopups((p) => [...p, { id, x, y, text, bad }]);
    setTimeout(() => setPopups((p) => p.filter((q) => q.id !== id)), 900);
  };

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

  const catchDrop = (drop, e) => {
    if (won) return;
    setDrops((d) => d.filter((x) => x.id !== drop.id));
    if (drop.bad) {
      sfx.bad();
      setScore((s) => Math.max(0, s - BROKEN_HEART_PENALTY));
      showPopup(e.clientX, e.clientY, `−${BROKEN_HEART_PENALTY} 💔`, true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } else {
      sfx.pop();
      setScore((s) => s + 1);
      showPopup(e.clientX, e.clientY, "+1 ❤️", false);
    }
  };

  return (
    <div className="screen fade-in">
      <p className="tag">TASK 02 · WARM UP</p>
      <h1 className="title">Catch my heart, {HER_NAME}! 💘</h1>
      <p className="subtitle">
        Tap {CATCH_GOAL} falling hearts — each 💔 takes away {BROKEN_HEART_PENALTY} points!
      </p>
      <div className={`score-card ${shake ? "shake penalty" : ""}`}>
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
            Next task →
          </button>
        </div>
      )}
      <div className="drop-layer">
        {drops.map((d) => (
          <button
            key={d.id}
            className="drop"
            style={{ left: `${d.left}%`, fontSize: d.size, animationDuration: `${d.duration}s` }}
            onPointerDown={(e) => catchDrop(d, e)}
            onAnimationEnd={() => setDrops((x) => x.filter((y) => y.id !== d.id))}
            aria-label={d.bad ? "Broken heart" : "Heart"}
          >
            {d.emoji}
          </button>
        ))}
      </div>
      <div className="score-popups" aria-hidden="true">
        {popups.map((p) => (
          <span key={p.id} className={`score-popup ${p.bad ? "bad" : ""}`} style={{ left: p.x, top: p.y }}>
            {p.text}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Step: Fix the layout (drag & snap puzzle) ---------------- */
function LayoutPuzzle({ onDone }) {
  const boxRef = useRef(null);
  const dragRef = useRef(null);
  const [size, setSize] = useState(44);
  const [slots, setSlots] = useState([]);
  const [pieces, setPieces] = useState([]);
  const [target, setTarget] = useState(null);
  const [dragging, setDragging] = useState(null);

  // Slot positions depend on the artboard size, so recompute them on resize / rotation
  useLayoutEffect(() => {
    const box = boxRef.current;
    const computeLayout = () => {
      const w = box.clientWidth;
      const letters = PUZZLE_WORD.filter((c) => c !== " ").length;
      const spaces = PUZZLE_WORD.length - letters;
      const gap = w < 400 ? 4 : 6;
      const s = Math.min(64, Math.floor((w - 16 - gap * (letters - 1)) / (letters + spaces * 0.5)));
      const total = s * letters + gap * (letters - 1) + s * 0.5 * spaces;
      let x = (w - total) / 2;
      const newSlots = [];
      PUZZLE_WORD.forEach((ch, i) => {
        if (ch === " ") {
          x += s * 0.5;
          return;
        }
        newSlots.push({ id: i, letter: ch, x, y: 24 });
        x += s + gap;
      });
      return { w, h: box.clientHeight, s, slots: newSlots };
    };

    const first = computeLayout();
    let prev = first;
    setSize(first.s);
    setSlots(first.slots);
    setPieces(
      first.slots
        .map((sl) => ({
          id: sl.id,
          letter: sl.letter,
          x: Math.random() * (first.w - first.s),
          y: 24 + first.s + 40 + Math.random() * Math.max(first.h - first.s * 2 - 80, 10),
          rot: Math.random() * 40 - 20,
          slot: null,
        }))
        .sort(() => Math.random() - 0.5)
    );

    const ro = new ResizeObserver(() => {
      const next = computeLayout();
      if (next.w === prev.w && next.h === prev.h) return;
      const sx = next.w / prev.w;
      const sy = next.h / prev.h;
      setSize(next.s);
      setSlots(next.slots);
      setPieces((ps) =>
        ps.map((p) => {
          if (p.slot !== null) {
            const sl = next.slots.find((s) => s.id === p.slot);
            return { ...p, x: sl.x, y: sl.y };
          }
          return {
            ...p,
            x: Math.min(Math.max(p.x * sx, 0), next.w - next.s),
            y: Math.min(Math.max(p.y * sy, 0), next.h - next.s),
          };
        })
      );
      prev = next;
    });
    ro.observe(box);
    return () => ro.disconnect();
  }, []);

  const solved = pieces.length > 0 && pieces.every((p) => p.slot !== null);

  useEffect(() => {
    if (solved) sfx.win();
  }, [solved]);

  const findTarget = (piece, x, y) => {
    let best = null;
    let bestDist = size * 0.9;
    for (const sl of slots) {
      if (sl.letter !== piece.letter) continue;
      if (pieces.some((p) => p.slot === sl.id && p.id !== piece.id)) continue;
      const d = Math.hypot(sl.x - x, sl.y - y);
      if (d < bestDist) {
        best = sl;
        bestDist = d;
      }
    }
    return best;
  };

  const onDown = (e, piece) => {
    if (solved) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { id: piece.id, ox: e.clientX - piece.x, oy: e.clientY - piece.y };
    setDragging(piece.id);
    setPieces((ps) => ps.map((p) => (p.id === piece.id ? { ...p, slot: null, rot: 0 } : p)));
  };

  const onMove = (e, piece) => {
    const d = dragRef.current;
    if (!d || d.id !== piece.id) return;
    const x = e.clientX - d.ox;
    const y = e.clientY - d.oy;
    setPieces((ps) => ps.map((p) => (p.id === piece.id ? { ...p, x, y } : p)));
    setTarget(findTarget(piece, x, y)?.id ?? null);
  };

  const onUp = (piece) => {
    const d = dragRef.current;
    if (!d || d.id !== piece.id) return;
    dragRef.current = null;
    setDragging(null);
    const sl = slots.find((s) => s.id === target);
    if (sl) {
      sfx.pop();
      setPieces((ps) => ps.map((p) => (p.id === piece.id ? { ...p, x: sl.x, y: sl.y, slot: sl.id } : p)));
    }
    setTarget(null);
  };

  return (
    <div className="screen fade-in">
      <p className="tag">TASK 04 · LAYOUT</p>
      <h1 className="title">Fix my layout, please 🥺</h1>
      <p className="subtitle">Drag the letters into the frame — they snap like in Figma</p>
      <div ref={boxRef} className={`artboard ${solved ? "solved" : ""}`}>
        <span className="artboard-label">Frame · Message</span>
        {slots.map((sl) => (
          <div
            key={sl.id}
            className={`slot ${target === sl.id ? "target" : ""}`}
            style={{ left: sl.x, top: sl.y, width: size, height: size }}
          />
        ))}
        {target !== null && (() => {
          const sl = slots.find((s) => s.id === target);
          return (
            <>
              <div className="guide guide-v" style={{ left: sl.x + size / 2 }} />
              <div className="guide guide-h" style={{ top: sl.y + size / 2 }} />
            </>
          );
        })()}
        {pieces.map((p) => (
          <div
            key={p.id}
            className={`piece ${p.slot !== null ? "placed" : ""} ${dragging === p.id ? "dragging" : ""}`}
            style={{
              width: size,
              height: size,
              fontSize: size * 0.55,
              transform: `translate(${p.x}px, ${p.y}px) rotate(${p.rot}deg)`,
            }}
            onPointerDown={(e) => onDown(e, p)}
            onPointerMove={(e) => onMove(e, p)}
            onPointerUp={() => onUp(p)}
            onPointerCancel={() => onUp(p)}
          >
            {p.letter}
          </div>
        ))}
        {solved && <div className="solved-heart pop-in">❤️</div>}
      </div>
      {solved && (
        <div className="pop-in won-box">
          <p className="subtitle">Pixel perfect — just like you ✨</p>
          <button className="btn btn-yes" onClick={onDone}>
            Next task →
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------------- Step: Spot the shade (colour-eye test) ---------------- */
const SHADE_ROUNDS = 6;

function SpotTheShade({ onDone }) {
  const [round, setRound] = useState(1);
  const [wrong, setWrong] = useState(null);
  const [misses, setMisses] = useState(0);
  const done = round > SHADE_ROUNDS;

  const puzzle = useMemo(() => {
    const n = Math.min(round + 2, 7);
    const hue = Math.floor(Math.random() * 360);
    const sat = Math.round(55 + Math.random() * 25);
    const light = Math.round(45 + Math.random() * 12);
    const diff = Math.max(4, Math.round(20 - round * 2.8));
    return {
      n,
      diff,
      odd: Math.floor(Math.random() * n * n),
      base: `hsl(${hue} ${sat}% ${light}%)`,
      oddColor: `hsl(${hue} ${sat}% ${light + diff}%)`,
    };
  }, [round]);

  useEffect(() => {
    if (done) sfx.win();
  }, [done]);

  const pick = (i) => {
    if (done) return;
    if (i === puzzle.odd) {
      sfx.pop();
      setWrong(null);
      setRound((r) => r + 1);
    } else {
      sfx.bad();
      setMisses((m) => m + 1);
      setWrong(i);
      setTimeout(() => setWrong(null), 450);
    }
  };

  return (
    <div className="screen fade-in">
      <p className="tag">TASK 03 · COLOUR EYE</p>
      <h1 className="title">Spot the different shade 👀</h1>
      <p className="subtitle">One square is a tiny bit lighter. A designer's eye can find it!</p>
      {!done ? (
        <>
          <div className="shade-meta">
            <span>
              Round {round}/{SHADE_ROUNDS}
            </span>
            <span>Δ lightness {puzzle.diff}%</span>
            <span>Misses {misses}</span>
          </div>
          <div className="shade-grid" style={{ gridTemplateColumns: `repeat(${puzzle.n}, 1fr)` }}>
            {Array.from({ length: puzzle.n * puzzle.n }, (_, i) => (
              <button
                key={`${round}-${i}`}
                className={`shade-cell ${wrong === i ? "wrong" : ""}`}
                style={{ background: i === puzzle.odd ? puzzle.oddColor : puzzle.base }}
                onClick={() => pick(i)}
                aria-label={`Square ${i + 1}`}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="pop-in won-box">
          <div className="big-emoji">🏆</div>
          <p className="subtitle">
            Your eye for colour is unreal{misses === 0 ? " — zero misses!" : ` (only ${misses} miss${misses > 1 ? "es" : ""})`} ✨
          </p>
          <p className="subtitle">But my eyes only ever spot you 🥰</p>
          <button className="btn btn-yes" onClick={onDone}>
            Next task →
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------------- Step: Memory match ---------------- */
const MEMORY_ICONS = ["🎨", "✏️", "📐", "🖌️", "💖", "🌸"];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function MemoryMatch({ onDone }) {
  const [cards] = useState(() => shuffle([...MEMORY_ICONS, ...MEMORY_ICONS]).map((icon, id) => ({ id, icon })));
  const [open, setOpen] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const done = matched.length === cards.length;

  useEffect(() => {
    if (done) sfx.win();
  }, [done]);

  const flip = (id) => {
    if (open.length === 2 || open.includes(id) || matched.includes(id)) return;
    sfx.click();
    const next = [...open, id];
    setOpen(next);
    if (next.length < 2) return;
    setMoves((m) => m + 1);
    const [a, b] = next.map((i) => cards[i]);
    if (a.icon === b.icon) {
      setTimeout(() => {
        sfx.pop();
        setMatched((m) => [...m, a.id, b.id]);
        setOpen([]);
      }, 400);
    } else {
      setTimeout(() => {
        sfx.bad();
        setOpen([]);
      }, 850);
    }
  };

  return (
    <div className="screen fade-in">
      <p className="tag">TASK 05 · MEMORY</p>
      <h1 className="title">Match the design tools 🧠</h1>
      <p className="subtitle">Flip two cards at a time and find all {MEMORY_ICONS.length} pairs</p>
      <div className="shade-meta">
        <span>Moves {moves}</span>
        <span>
          Pairs {matched.length / 2}/{MEMORY_ICONS.length}
        </span>
      </div>
      <div className="memory-grid">
        {cards.map((c) => {
          const faceUp = open.includes(c.id) || matched.includes(c.id);
          return (
            <button
              key={c.id}
              className={`mem-card ${faceUp ? "up" : ""} ${matched.includes(c.id) ? "matched" : ""}`}
              onClick={() => flip(c.id)}
              aria-label={faceUp ? c.icon : "Hidden card"}
            >
              <div className="mem-inner">
                <div className="mem-back">◆</div>
                <div className="mem-front">{c.icon}</div>
              </div>
            </button>
          );
        })}
      </div>
      {done && (
        <div className="pop-in won-box">
          <p className="subtitle">
            All matched in {moves} moves! We're a perfect match too 💞
          </p>
          <button className="btn btn-yes" onClick={onDone}>
            Next task →
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------------- Step: Letter (pick a typeface, tap to reveal) ---------------- */
function Letter({ font, onFont, onDone }) {
  const [shown, setShown] = useState(1);
  const finished = shown >= LETTER_LINES.length;
  const next = () => {
    if (finished) return;
    sfx.click();
    setShown((s) => s + 1);
  };
  return (
    <div className="screen fade-in">
      <p className="tag">TASK 06 · TYPOGRAPHY</p>
      <p className="subtitle">Choose the typeface for my letter to you</p>
      <div className="font-chips">
        {FONTS.map((f) => (
          <button
            key={f.id}
            className={`font-chip ${font.id === f.id ? "picked" : ""}`}
            style={{ fontFamily: `"${f.family}"` }}
            onClick={() => {
              sfx.pop();
              onFont(f);
            }}
          >
            Aa <small>{f.vibe}</small>
          </button>
        ))}
      </div>
      <div
        className="card letter-card"
        onClick={next}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && next()}
      >
        {LETTER_LINES.slice(0, shown).map((l, i) => (
          <p
            key={i}
            className={`letter-line ${i === 0 ? "greeting" : ""}`}
            style={{ fontFamily: `"${font.family}", cursive` }}
          >
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

/* ---------------- Step: Love meter (hold to fill) ---------------- */
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
      <p className="tag">TASK 07 · MEASUREMENTS</p>
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
          <p className="subtitle">The meter broke — my love for you has no max-width, {HER_NAME} ❤️</p>
          <button className="btn btn-yes" onClick={onDone}>
            Next task →
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------------- Step: Sketch something ---------------- */
function Sketch({ palette, onDone }) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const last = useRef(null);
  const [color, setColor] = useState(palette.primary);
  const [brush, setBrush] = useState(6);
  const [hasInk, setHasInk] = useState(false);
  const [mode, setMode] = useState("draw"); // "draw" | "upload"
  const [upload, setUpload] = useState(null);
  const [uploadError, setUploadError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  // Read the chosen image and shrink very large files so the poster stays fast
  const handleFile = (file) => {
    setUploadError("");
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setUploadError("That doesn't look like an image — try PNG, JPG, WEBP or SVG 🙏");
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const img = await loadImage(reader.result);
        const max = 1600;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement("canvas");
        c.width = Math.round(img.width * scale) || 800;
        c.height = Math.round(img.height * scale) || 800;
        const ctx = c.getContext("2d");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, c.width, c.height);
        ctx.drawImage(img, 0, 0, c.width, c.height);
        setUpload(c.toDataURL("image/png"));
        sfx.pop();
      } catch {
        setUploadError("Couldn't open that image — try another one 🙏");
      }
    };
    reader.readAsDataURL(file);
  };

  const colors = [palette.primary, palette.accent, "#222222", "#ffb300", "#29b6f6", "#43a047"];

  const fillWhite = () => {
    const c = canvasRef.current;
    const ctx = c.getContext("2d");
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.restore();
  };

  // Size the canvas to its CSS box (crisp on retina), and keep the drawing when the screen resizes / rotates
  useEffect(() => {
    const c = canvasRef.current;
    const fit = () => {
      const dpr = window.devicePixelRatio || 1;
      const r = c.getBoundingClientRect();
      if (!r.width || !r.height) return; // hidden while the Upload tab is open — keep the drawing
      const w = Math.round(r.width * dpr);
      const h = Math.round(r.height * dpr);
      if (w === c.width && h === c.height) return;
      let snapshot = null;
      if (c.width && c.height) {
        snapshot = document.createElement("canvas");
        snapshot.width = c.width;
        snapshot.height = c.height;
        snapshot.getContext("2d").drawImage(c, 0, 0);
      }
      c.width = w;
      c.height = h;
      fillWhite();
      const ctx = c.getContext("2d");
      if (snapshot) ctx.drawImage(snapshot, 0, 0, w, h);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    };
    c.width = 0;
    c.height = 0;
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(c);
    return () => ro.disconnect();
  }, []);

  const pos = (e) => {
    const r = canvasRef.current.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const stroke = (from, to) => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.strokeStyle = color;
    ctx.lineWidth = brush;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
  };

  const down = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    const p = pos(e);
    last.current = p;
    stroke(p, { x: p.x + 0.1, y: p.y + 0.1 });
    setHasInk(true);
  };
  const move = (e) => {
    if (!drawing.current) return;
    const p = pos(e);
    stroke(last.current, p);
    last.current = p;
  };
  const up = () => {
    drawing.current = false;
  };

  return (
    <div className="screen fade-in">
      <p className="tag">TASK 08 · ILLUSTRATION</p>
      <h1 className="title">Show me your art ✏️</h1>
      <p className="subtitle">Draw something here, or upload one of your designs — it goes on our poster at the end</p>
      <div className="mode-tabs" role="tablist">
        <button
          role="tab"
          aria-selected={mode === "draw"}
          className={`mode-tab ${mode === "draw" ? "active" : ""}`}
          onClick={() => {
            sfx.click();
            setMode("draw");
          }}
        >
          ✏️ Draw
        </button>
        <button
          role="tab"
          aria-selected={mode === "upload"}
          className={`mode-tab ${mode === "upload" ? "active" : ""}`}
          onClick={() => {
            sfx.click();
            setMode("upload");
          }}
        >
          📁 Upload design
        </button>
      </div>

      {mode === "upload" && (
        <div className="card upload-wrap">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              handleFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
          {upload ? (
            <div className="upload-preview">
              <img src={upload} alt="Your uploaded design" />
              <div className="row">
                <button className="btn btn-ghost" onClick={() => fileRef.current.click()}>
                  🔄 Replace
                </button>
                <button className="btn btn-ghost" onClick={() => setUpload(null)}>
                  🗑️ Remove
                </button>
              </div>
            </div>
          ) : (
            <button
              className={`dropzone ${dragOver ? "over" : ""}`}
              onClick={() => fileRef.current.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                handleFile(e.dataTransfer.files?.[0]);
              }}
            >
              <span className="dropzone-icon">🖼️</span>
              <strong>Tap to choose a design</strong>
              <span className="hint-static">or drag &amp; drop it here · PNG, JPG, WEBP, SVG</span>
            </button>
          )}
          {uploadError && <p className="upload-error">{uploadError}</p>}
        </div>
      )}

      <div className={`sketch-wrap card ${mode === "draw" ? "" : "is-hidden"}`}>
        <div className="toolbar">
          {colors.map((c) => (
            <button
              key={c}
              className={`color-dot ${color === c ? "picked" : ""}`}
              style={{ background: c }}
              onClick={() => setColor(c)}
              aria-label={`Colour ${c}`}
            />
          ))}
          <button className={`tool ${color === "#ffffff" ? "picked" : ""}`} onClick={() => setColor("#ffffff")}>
            🧽
          </button>
          <span className="sep" />
          {[3, 6, 12].map((b) => (
            <button key={b} className={`tool ${brush === b ? "picked" : ""}`} onClick={() => setBrush(b)} aria-label={`Brush ${b}`}>
              <span className="brush-dot" style={{ width: b + 2, height: b + 2 }} />
            </button>
          ))}
          <span className="sep" />
          <button
            className="tool"
            onClick={() => {
              fillWhite();
              setHasInk(false);
            }}
          >
            🗑️
          </button>
        </div>
        <canvas
          ref={canvasRef}
          className="sketch-canvas"
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
        />
      </div>
      <div className="row">
        <button className="btn btn-ghost" onClick={() => onDone(null)}>
          Skip
        </button>
        <button
          className="btn btn-yes"
          disabled={mode === "draw" ? !hasInk : !upload}
          onClick={() => {
            sfx.win();
            onDone(mode === "draw" ? canvasRef.current.toDataURL("image/png") : upload);
          }}
        >
          {mode === "draw" ? "Export artwork 📤" : "Use this design 📤"}
        </button>
      </div>
    </div>
  );
}

/* ---------------- Step: Scratch card ---------------- */
function ScratchCard({ palette, onDone }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const scratching = useRef(false);
  const last = useRef(null);
  const revealedRef = useRef(false);
  const [revealed, setRevealed] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const c = canvasRef.current;
    const wrap = wrapRef.current;
    const paintCover = () => {
      if (revealedRef.current) return;
      const dpr = window.devicePixelRatio || 1;
      const r = wrap.getBoundingClientRect();
      c.width = Math.round(r.width * dpr);
      c.height = Math.round(r.height * dpr);
      const ctx = c.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalCompositeOperation = "source-over";
      const g = ctx.createLinearGradient(0, 0, r.width, r.height);
      g.addColorStop(0, palette.accent);
      g.addColorStop(1, palette.primary);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, r.width, r.height);
      // glitter
      for (let i = 0; i < 120; i++) {
        ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.5})`;
        ctx.beginPath();
        ctx.arc(Math.random() * r.width, Math.random() * r.height, Math.random() * 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = "#fff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `600 ${Math.max(18, Math.min(28, r.width / 16))}px Poppins, sans-serif`;
      ctx.fillText("✨ Scratch here ✨", r.width / 2, r.height / 2);
      setProgress(0);
    };
    paintCover();
    const ro = new ResizeObserver(paintCover);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [palette]);

  const pos = (e) => {
    const r = canvasRef.current.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const scratch = (from, to) => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 40;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
  };

  const measure = () => {
    const c = canvasRef.current;
    const data = c.getContext("2d").getImageData(0, 0, c.width, c.height).data;
    let clear = 0;
    let total = 0;
    for (let i = 3; i < data.length; i += 4 * 24) {
      total++;
      if (data[i] === 0) clear++;
    }
    const pct = clear / total;
    setProgress(pct);
    if (pct > 0.5 && !revealedRef.current) {
      revealedRef.current = true;
      setRevealed(true);
      sfx.win();
    }
  };

  const down = (e) => {
    if (revealed) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    scratching.current = true;
    last.current = pos(e);
    scratch(last.current, { x: last.current.x + 0.1, y: last.current.y });
  };
  const move = (e) => {
    if (!scratching.current) return;
    const p = pos(e);
    scratch(last.current, p);
    last.current = p;
    if (Math.random() < 0.15) tone(900 + Math.random() * 400, 0.03, "square", 0.03);
  };
  const up = () => {
    if (!scratching.current) return;
    scratching.current = false;
    measure();
  };

  return (
    <div className="screen fade-in">
      <p className="tag">TASK 09 · SECRET FILE</p>
      <h1 className="title">Scratch to reveal 🎟️</h1>
      <p className="subtitle">There's a secret hidden under here…</p>
      <div ref={wrapRef} className="scratch-wrap card">
        <div className="scratch-message">
          <div className="big-emoji">💍</div>
          <p className="letter-line greeting">{HER_NAME},</p>
          <p className="subtitle">
            you're the most beautiful design I've ever seen — and I have one very important question for you…
          </p>
        </div>
        <canvas
          ref={canvasRef}
          className={`scratch-canvas ${revealed ? "gone" : ""}`}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
        />
      </div>
      {!revealed ? (
        <p className="hint">Scratched {Math.round(progress * 100)}% — keep going!</p>
      ) : (
        <button className="btn btn-yes pop-in" onClick={onDone}>
          Ask me 💘
        </button>
      )}
    </div>
  );
}

/* ---------------- Step: The question ---------------- */
function Question({ onDone }) {
  const [noCount, setNoCount] = useState(0);
  const [noPos, setNoPos] = useState(null);
  const noRef = useRef(null);

  const [vw, setVw] = useState(window.innerWidth);
  useEffect(() => {
    const onResize = () => {
      setVw(window.innerWidth);
      setNoPos(null); // put the No button back so it can't get stuck off-screen
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Don't let the Yes button grow wider than the screen on phones
  const maxYes = vw < 480 ? 2.4 : vw < 900 ? 3.5 : 5;
  const yesScale = Math.min(1 + noCount * 0.22, maxYes);
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
      top: 60 + Math.random() * (window.innerHeight - h - 60 - pad),
    });
    setNoCount((c) => c + 1);
  };

  return (
    <div className="screen fade-in">
      <p className="tag">FINAL APPROVAL</p>
      <div className="big-emoji bounce">{face}</div>
      <h1 className="title">{HER_NAME}, will you be mine? 💘</h1>
      {noCount > 0 && (
        <p className="subtitle">
          {noCount < 5
            ? "Pleaseee 🥺"
            : noCount < 10
            ? "Client is not accepting this revision 😤"
            : "The Yes button is getting bigger — that's visual hierarchy 😏"}
        </p>
      )}
      <div className="buttons">
        <button
          className="btn btn-yes"
          style={{ transform: `scale(${yesScale})` }}
          onClick={() => {
            sfx.win();
            onDone(noCount);
          }}
        >
          Yes 💖
        </button>
        <button
          ref={noRef}
          className="btn btn-no"
          style={{
            transform: `scale(${noScale})`,
            ...(noPos ? { position: "fixed", left: noPos.left, top: noPos.top } : {}),
          }}
          onPointerEnter={(e) => e.pointerType === "mouse" && dodge()}
          onClick={dodge}
        >
          {NO_TEXTS[Math.min(noCount, NO_TEXTS.length - 1)]}
        </button>
      </div>
    </div>
  );
}

/* ---------------- Step: Plan our date ---------------- */
function DatePlanner({ onDone }) {
  const [picked, setPicked] = useState([]);
  const toggle = (id) => {
    sfx.pop();
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  };
  return (
    <div className="screen fade-in">
      <Burst />
      <h1 className="title">Yayyy!! Approved! 🥳</h1>
      <p className="subtitle">Now let's moodboard our first date — pick as many as you like</p>
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

/* ---------------- Poster (rendered to a canvas so she can download it) ---------------- */
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function wrapLines(ctx, text, maxWidth) {
  const words = text.split(" ");
  const lines = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

async function makePoster({ palette, font, sketch, dates }) {
  const W = 1080;
  const H = 1350;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d");
  try {
    await document.fonts.load(`100px "${font.family}"`);
    await document.fonts.load(`600 40px "Poppins"`);
  } catch {
    // fall back to whatever font is available
  }

  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, palette.bg1);
  g.addColorStop(1, palette.bg2);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // decorative blobs
  ctx.globalAlpha = 0.25;
  ctx.fillStyle = palette.accent;
  ctx.beginPath();
  ctx.arc(120, 160, 180, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(W - 80, H - 200, 240, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.textAlign = "center";
  ctx.fillStyle = palette.ink;
  ctx.font = `600 28px "Poppins", sans-serif`;
  ctx.fillText("A LOVE STORY · DESIGNED TOGETHER", W / 2, 110);

  ctx.fillStyle = palette.primary;
  ctx.font = `100px "${font.family}", cursive`;
  ctx.fillText(`${HER_NAME} ❤ ${YOUR_FIRST}`, W / 2, 240);

  // artwork card
  const cx = 140;
  const cy = 300;
  const cw = W - 280;
  const ch = 600;
  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "rgba(0,0,0,0.15)";
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 16;
  ctx.beginPath();
  ctx.roundRect(cx, cy, cw, ch, 36);
  ctx.fill();
  ctx.shadowColor = "transparent";

  if (sketch) {
    const img = await loadImage(sketch);
    const scale = Math.min((cw - 60) / img.width, (ch - 60) / img.height);
    const iw = img.width * scale;
    const ih = img.height * scale;
    ctx.drawImage(img, cx + (cw - iw) / 2, cy + (ch - ih) / 2, iw, ih);
  } else {
    ctx.font = `260px serif`;
    ctx.textBaseline = "middle";
    ctx.fillText("💖", W / 2, cy + ch / 2);
    ctx.textBaseline = "alphabetic";
  }

  ctx.fillStyle = palette.ink;
  ctx.font = `600 30px "Poppins", sans-serif`;
  ctx.fillText(`Design by ${HER_FULL_NAME}`, W / 2, cy + ch + 60);

  ctx.font = `44px "${font.family}", cursive`;
  ctx.fillStyle = palette.primary;
  const plans = dates.map((d) => d.label).join(" · ");
  wrapLines(ctx, `Up next: ${plans}`, W - 200)
    .slice(0, 3)
    .forEach((line, i) => ctx.fillText(line, W / 2, cy + ch + 140 + i * 56));

  const today = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  ctx.fillStyle = palette.ink;
  ctx.font = `500 26px "Poppins", sans-serif`;
  ctx.fillText(`She said YES · ${today}`, W / 2, H - 70);

  return c.toDataURL("image/png");
}

/* ---------------- Step: Celebration ---------------- */
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

function Celebration({ noCount, dates, palette, font, sketch, onReplay }) {
  const [hugs, setHugs] = useState(0);
  const [poster, setPoster] = useState(null);

  useEffect(() => {
    let alive = true;
    makePoster({ palette, font, sketch, dates }).then((url) => alive && setPoster(url));
    return () => {
      alive = false;
    };
  }, [palette, font, sketch, dates]);

  return (
    <div className="screen wide fade-in">
      <Burst />
      <div className="big-emoji heartbeat">💖</div>
      <h1 className="title">
        {HER_NAME} ❤️ {YOUR_FIRST}
      </h1>
      <p className="subtitle">
        You just made me the happiest person alive!
        {noCount > 0 && ` (Even after pressing "No" ${noCount} time${noCount > 1 ? "s" : ""} 😜)`}
      </p>

      <div className="celebrate-grid">
      <div className="card poster-card">
        <h2 className="card-title">Our poster 🖼️</h2>
        <p className="hint">Designed with your palette, your font and your artwork</p>
        {poster ? (
          <>
            <img className="poster" src={poster} alt="Our love poster" />
            <a className="btn btn-yes download" href={poster} download={`${HER_NAME}-x-${YOUR_FIRST}.png`}>
              Download poster ⬇️
            </a>
          </>
        ) : (
          <p className="subtitle">Rendering… 🎨</p>
        )}
      </div>

      <div className="side-stack">
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
          {hugs === 0
            ? "Tap to hug me!"
            : `${hugs} hug${hugs > 1 ? "s" : ""} received${hugs >= 10 ? " — I feel so loved 🥹" : ""}`}
        </p>
      </div>
      </div>
      </div>

      <p className="signature">Forever yours, {YOUR_NAME} 💌</p>
      <button className="btn btn-no" onClick={onReplay}>
        Replay ↺
      </button>
    </div>
  );
}

/* ---------------- App ---------------- */
const TOTAL_STEPS = 13;

export default function App() {
  const [step, setStep] = useState(0);
  const [palette, setPalette] = useState(PALETTES[0]);
  const [font, setFont] = useState(FONTS[0]);
  const [sketch, setSketch] = useState(null);
  const [noCount, setNoCount] = useState(0);
  const [dates, setDates] = useState([]);
  const [muted, setMuted] = useState(false);

  const next = useCallback(() => {
    setStep((s) => s + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const toggleSound = () => {
    soundOn = muted;
    setMuted(!muted);
  };

  const themeVars = {
    "--bg1": palette.bg1,
    "--bg2": palette.bg2,
    "--primary": palette.primary,
    "--accent": palette.accent,
    "--ink": palette.ink,
    "--soft": palette.soft,
    "--card": palette.card,
    "--display": `"${font.family}"`,
  };

  return (
    <main className="app" style={themeVars}>
      <FloatingHearts />
      <TapHearts />
      <DesignCursors />
      <TopBar step={step} total={TOTAL_STEPS} muted={muted} onToggleSound={toggleSound} />

      {step === 0 && <Envelope onDone={next} />}
      {step === 1 && <PalettePicker palette={palette} onPick={setPalette} onDone={next} />}
      {step === 2 && <CatchHearts onDone={next} />}
      {step === 3 && <SpotTheShade onDone={next} />}
      {step === 4 && <LayoutPuzzle onDone={next} />}
      {step === 5 && <MemoryMatch onDone={next} />}
      {step === 6 && <Letter font={font} onFont={setFont} onDone={next} />}
      {step === 7 && <LoveMeter onDone={next} />}
      {step === 8 && (
        <Sketch
          palette={palette}
          onDone={(img) => {
            setSketch(img);
            next();
          }}
        />
      )}
      {step === 9 && <ScratchCard palette={palette} onDone={next} />}
      {step === 10 && (
        <Question
          onDone={(n) => {
            setNoCount(n);
            next();
          }}
        />
      )}
      {step === 11 && (
        <DatePlanner
          onDone={(d) => {
            setDates(d);
            next();
          }}
        />
      )}
      {step === 12 && (
        <Celebration
          noCount={noCount}
          dates={dates}
          palette={palette}
          font={font}
          sketch={sketch}
          onReplay={() => {
            setStep(0);
            setNoCount(0);
            setDates([]);
            setSketch(null);
          }}
        />
      )}
    </main>
  );
}

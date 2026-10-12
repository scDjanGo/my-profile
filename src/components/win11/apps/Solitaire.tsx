"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { IconPlus } from "../icons";
import { Segmented } from "../controls";

/* ---------- Cards ---------- */

type Suit = 0 | 1 | 2 | 3; // spades, hearts, diamonds, clubs
interface Card {
  id: string;
  suit: Suit;
  rank: number; // 1 = ace … 13 = king
  up: boolean;
}
interface Game {
  stock: Card[];
  waste: Card[];
  found: Card[][];
  tab: Card[][];
  score: number;
  moves: number;
}
type PileRef = { kind: "waste" } | { kind: "found"; i: number } | { kind: "tab"; i: number };

const SUIT_PATHS = [
  "M12 2C9 6.2 4 8.8 4 13a4 4 0 0 0 7 2.7V17l-1.6 4.5h5.2L13 17v-1.3A4 4 0 0 0 20 13c0-4.2-5-6.8-8-11Z",
  "M12 21s-8.5-5.3-8.5-11.2A4.6 4.6 0 0 1 12 7.2a4.6 4.6 0 0 1 8.5 2.6C20.5 15.7 12 21 12 21Z",
  "M12 2 19.5 12 12 22 4.5 12Z",
  "M12 2.5a3.8 3.8 0 0 0-3.5 5.3A3.8 3.8 0 1 0 10.9 14l-1.5 7.5h5.2L13.1 14a3.8 3.8 0 1 0 2.4-6.2A3.8 3.8 0 0 0 12 2.5Z",
];
const RANKS = ["", "A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const isRed = (s: Suit) => s === 1 || s === 2;

function SuitIcon({ suit, size }: { suit: Suit; size: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
      <path d={SUIT_PATHS[suit]} fill="currentColor" />
    </svg>
  );
}

function shuffle<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function deal(): Game {
  const deck = shuffle(
    ([0, 1, 2, 3] as Suit[]).flatMap((suit) => Array.from({ length: 13 }, (_, r) => ({ id: `${suit}-${r + 1}`, suit, rank: r + 1, up: false }))),
  );
  const tab: Card[][] = [];
  let k = 0;
  for (let i = 0; i < 7; i++) {
    tab.push(deck.slice(k, k + i + 1).map((c, j) => ({ ...c, up: j === i })));
    k += i + 1;
  }
  return { stock: deck.slice(k), waste: [], found: [[], [], [], []], tab, score: 0, moves: 0 };
}

const top = <T,>(a: T[]) => a[a.length - 1];
const canFound = (c: Card, pile: Card[]) => (pile.length ? top(pile).suit === c.suit && top(pile).rank === c.rank - 1 : c.rank === 1);
const canTab = (c: Card, pile: Card[]) =>
  pile.length ? top(pile).up && isRed(top(pile).suit) !== isRed(c.suit) && top(pile).rank === c.rank + 1 : c.rank === 13;

const clone = (g: Game): Game => ({
  ...g,
  stock: [...g.stock],
  waste: [...g.waste],
  found: g.found.map((p) => [...p]),
  tab: g.tab.map((p) => [...p]),
});

function pileOf(g: Game, ref: PileRef) {
  return ref.kind === "waste" ? g.waste : ref.kind === "found" ? g.found[ref.i] : g.tab[ref.i];
}

/** Moves `count` cards from one pile to another if the rules allow it; returns the new game or null */
function tryMove(g: Game, from: PileRef, count: number, to: PileRef): Game | null {
  if (to.kind === "waste") return null;
  if (from.kind === to.kind && "i" in from && "i" in to && from.i === to.i) return null;
  const src = pileOf(g, from);
  const moving = src.slice(src.length - count);
  if (!moving.length || !moving[0].up) return null;
  const dst = pileOf(g, to);
  if (to.kind === "found" && (count !== 1 || !canFound(moving[0], dst))) return null;
  if (to.kind === "tab" && !canTab(moving[0], dst)) return null;

  const next = clone(g);
  const nsrc = pileOf(next, from);
  nsrc.splice(nsrc.length - count, count);
  pileOf(next, to).push(...moving);
  // Windows scoring
  if (to.kind === "found") next.score += 10;
  if (from.kind === "waste" && to.kind === "tab") next.score += 5;
  if (from.kind === "found" && to.kind === "tab") next.score = Math.max(0, next.score - 15);
  if (from.kind === "tab" && nsrc.length && !top(nsrc).up) {
    nsrc[nsrc.length - 1] = { ...top(nsrc), up: true };
    next.score += 5;
  }
  next.moves += 1;
  return next;
}

/** Where a click sends a card: a foundation first, then the best tableau pile */
function autoTarget(g: Game, from: PileRef, count: number): PileRef | null {
  if (count === 1) {
    for (let i = 0; i < 4; i++) if (tryMove(g, from, 1, { kind: "found", i })) return { kind: "found", i };
  }
  const order = [...Array(7).keys()].sort((a, b) => Number(g.tab[a].length === 0) - Number(g.tab[b].length === 0));
  for (const i of order) if (tryMove(g, from, count, { kind: "tab", i })) return { kind: "tab", i };
  return null;
}

/* ---------- Win animation: the classic bouncing cards ---------- */

function drawCardOnCanvas(ctx: CanvasRenderingContext2D, card: Card, x: number, y: number, w: number, h: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "#fff";
  ctx.strokeStyle = "rgba(0,0,0,.35)";
  ctx.beginPath();
  ctx.roundRect(0, 0, w, h, w * 0.08);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = isRed(card.suit) ? "#d4202c" : "#1b1b1b";
  ctx.font = `600 ${w * 0.2}px 'Segoe UI', Selawik, sans-serif`;
  ctx.fillText(RANKS[card.rank], w * 0.08, w * 0.24);
  const path = new Path2D(SUIT_PATHS[card.suit]);
  ctx.translate(w * 0.25, h * 0.32);
  ctx.scale(w / 48, w / 48);
  ctx.fill(path);
  ctx.restore();
}

function celebrate(canvas: HTMLCanvasElement, found: Card[][], cardW: number, cardH: number, origin: (i: number) => { x: number; y: number }) {
  const ctx = canvas.getContext("2d")!;
  const queue: { card: Card; i: number }[] = [];
  for (let r = 13; r >= 1; r--) for (let i = 0; i < 4; i++) queue.push({ card: found[i][r - 1], i });
  let current: { card: Card; x: number; y: number; vx: number; vy: number } | null = null;
  let raf = 0;
  const step = () => {
    if (!current) {
      const next = queue.shift();
      if (!next) return;
      const o = origin(next.i);
      current = { card: next.card, x: o.x, y: o.y, vx: (Math.random() * 5 + 2) * (Math.random() < 0.5 ? -1 : 1), vy: -Math.random() * 6 };
    }
    current.vy += 0.6;
    current.x += current.vx;
    current.y += current.vy;
    if (current.y + cardH > canvas.height) {
      current.y = canvas.height - cardH;
      current.vy *= -0.75;
    }
    drawCardOnCanvas(ctx, current.card, current.x, current.y, cardW, cardH);
    if (current.x < -cardW || current.x > canvas.width) current = null;
    raf = requestAnimationFrame(step);
  };
  raf = requestAnimationFrame(step);
  return () => cancelAnimationFrame(raf);
}

/* ---------- Component ---------- */

interface DragState {
  from: PileRef;
  cards: Card[];
  x0: number;
  y0: number;
  /** where the grabbed card sits inside the felt when the drag starts */
  left: number;
  top: number;
  active: boolean;
}

export default function Solitaire() {
  const t = useTranslations("solitaire");
  const [game, setGame] = useState<Game>(deal);
  const [history, setHistory] = useState<Game[]>([]);
  const [drawCount, setDrawCount] = useState<1 | 3>(1);
  const [seconds, setSeconds] = useState(0);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [box, setBox] = useState({ w: 900, h: 600 });
  const area = useRef<HTMLDivElement>(null);
  const ghost = useRef<HTMLDivElement>(null);
  const confetti = useRef<HTMLCanvasElement>(null);
  const dragRef = useRef<DragState | null>(null);

  const won = game.found.every((p) => p.length === 13);
  const canAutoComplete = !won && game.stock.length === 0 && game.waste.length === 0 && game.tab.every((p) => p.every((c) => c.up));

  // layout follows the window size
  useEffect(() => {
    const el = area.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setBox({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // game clock
  useEffect(() => {
    if (won || game.moves === 0) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [won, game.moves]);

  const gap = Math.max(6, Math.min(16, box.w * 0.015));
  const cardW = Math.max(44, Math.min(110, (box.w - gap * 8) / 7));
  const cardH = cardW * 1.4;
  const colX = (i: number) => gap + i * (cardW + gap);
  const tabTop = gap * 2 + cardH;

  // win: classic bouncing cards
  useEffect(() => {
    if (!won || !confetti.current) return;
    const c = confetti.current;
    c.width = box.w;
    c.height = box.h;
    return celebrate(c, game.found, cardW, cardH, (i) => ({ x: colX(3 + i), y: gap }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [won]);

  const commit = (next: Game | null) => {
    if (!next) return false;
    setHistory((h) => [...h.slice(-50), game]);
    setGame(next);
    return true;
  };

  const newGame = () => {
    setGame(deal());
    setHistory([]);
    setSeconds(0);
  };

  const undo = () => {
    const prev = history[history.length - 1];
    if (!prev) return;
    setHistory((h) => h.slice(0, -1));
    setGame(prev);
  };

  const clickStock = () => {
    const next = clone(game);
    if (!next.stock.length) {
      if (!next.waste.length) return;
      next.stock = next.waste.reverse().map((c) => ({ ...c, up: false }));
      next.waste = [];
      if (drawCount === 1) next.score = Math.max(0, next.score - 100);
    } else {
      const drawn = next.stock.splice(Math.max(0, next.stock.length - drawCount)).reverse();
      next.waste.push(...drawn.map((c) => ({ ...c, up: true })));
    }
    next.moves += 1;
    commit(next);
  };

  // auto-complete plays every remaining card onto the foundations, one by one
  const [autoRunning, setAutoRunning] = useState(false);
  useEffect(() => {
    if (!autoRunning) return;
    const id = setTimeout(() => {
      for (let i = 0; i < 7; i++) {
        const pile = game.tab[i];
        if (!pile.length) continue;
        for (let f = 0; f < 4; f++) {
          const next = tryMove(game, { kind: "tab", i }, 1, { kind: "found", i: f });
          if (next) {
            setGame(next);
            return;
          }
        }
      }
      setAutoRunning(false);
    }, 90);
    return () => clearTimeout(id);
  }, [autoRunning, game]);

  /* ----- dragging ----- */
  // one delegated handler: cards carry data-drag="tab-3" / "waste" / "found-1" and data-index
  const startDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = (e.target as HTMLElement).closest<HTMLElement>("[data-drag]");
    if (!el || e.button !== 0) return;
    const [kind, n] = el.dataset.drag!.split("-");
    const from: PileRef = kind === "waste" ? { kind: "waste" } : kind === "found" ? { kind: "found", i: +n } : { kind: "tab", i: +n };
    const index = Number(el.dataset.index);
    const pile = pileOf(game, from);
    const cards = from.kind === "tab" ? pile.slice(index) : [top(pile)];
    if (!cards[0]?.up) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const r = el.getBoundingClientRect();
    const a = area.current!.getBoundingClientRect();
    dragRef.current = { from, cards, x0: e.clientX, y0: e.clientY, left: r.left - a.left, top: r.top - a.top, active: false };
  };

  const moveDrag = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    const dx = e.clientX - d.x0;
    const dy = e.clientY - d.y0;
    if (!d.active) {
      if (Math.hypot(dx, dy) < 4) return;
      d.active = true;
      setDrag({ ...d });
    }
    if (ghost.current) ghost.current.style.translate = `${dx}px ${dy}px`;
  };

  const endDrag = (e: React.PointerEvent) => {
    const d = dragRef.current;
    dragRef.current = null;
    if (!d) return;
    setDrag(null);
    if (!d.active) {
      // a click sends the card where it fits best
      const to = autoTarget(game, d.from, d.cards.length);
      if (to) commit(tryMove(game, d.from, d.cards.length, to));
      return;
    }
    const target = document
      .elementsFromPoint(e.clientX, e.clientY)
      .map((el) => (el as HTMLElement).closest<HTMLElement>("[data-pile]")?.dataset.pile)
      .find(Boolean);
    if (!target) return;
    const [kind, i] = target.split("-");
    const to: PileRef = kind === "found" ? { kind: "found", i: +i } : { kind: "tab", i: +i };
    commit(tryMove(game, d.from, d.cards.length, to));
  };

  const dragging = (c: Card) => !!drag?.cards.some((x) => x.id === c.id);

  const renderCard = (c: Card, style: React.CSSProperties, dragFrom?: string, index?: number, hidden = false) => (
    <div
      key={c.id}
      data-drag={dragFrom}
      data-index={index}
      className={`win-card ${c.up ? "" : "is-back"} ${isRed(c.suit) ? "is-red" : ""}`}
      style={{ ...style, width: cardW, height: cardH, visibility: hidden ? "hidden" : undefined, fontSize: cardW * 0.19 }}
    >
      {c.up && (
        <>
          <div className="win-card-corner">
            <span>{RANKS[c.rank]}</span>
            <SuitIcon suit={c.suit} size={cardW * 0.16} />
          </div>
          <div className="win-card-center">
            {c.rank > 10 ? (
              <span className="win-card-face">{RANKS[c.rank]}</span>
            ) : (
              <SuitIcon suit={c.suit} size={cardW * (c.rank === 1 ? 0.5 : 0.38)} />
            )}
          </div>
          <div className="win-card-corner is-bottom">
            <span>{RANKS[c.rank]}</span>
            <SuitIcon suit={c.suit} size={cardW * 0.16} />
          </div>
        </>
      )}
    </div>
  );

  // tableau fan: compress if a column would run off the bottom
  const fan = (pile: Card[]) => {
    const down = cardH * 0.12;
    const upOff = cardH * 0.27;
    const total = pile.reduce((s, c, i) => s + (i === pile.length - 1 ? 0 : c.up ? upOff : down), 0);
    const room = box.h - tabTop - cardH - gap;
    const k = total > room && total > 0 ? room / total : 1;
    let y = 0;
    return pile.map((c) => {
      const at = y;
      y += (c.up ? upOff : down) * k;
      return at;
    });
  };

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  const wasteShown = game.waste.slice(-(drawCount === 3 ? 3 : 1));

  return (
    <div className="win-app flex h-full flex-col text-[13px]">
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-(--divider) px-3 py-1.5">
        <button className="win-cmd" onClick={newGame}>
          <IconPlus /> {t("newGame")}
        </button>
        <button className="win-cmd" onClick={undo} disabled={!history.length}>
          <svg viewBox="0 0 16 16" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M5 3 2 6l3 3M2 6h7.5a4 4 0 0 1 0 8H7" />
          </svg>
          {t("undo")}
        </button>
        {canAutoComplete && !autoRunning && (
          <button className="win-btn win-btn-accent" onClick={() => setAutoRunning(true)}>
            {t("autoComplete")}
          </button>
        )}
        <div className="max-sm:hidden">
          <Segmented
            value={String(drawCount) as "1" | "3"}
            onChange={(v) => {
              setDrawCount(v === "3" ? 3 : 1);
              newGame();
            }}
            options={[
              { value: "1", label: t("draw1") },
              { value: "3", label: t("draw3") },
            ]}
          />
        </div>
        <div className="ml-auto flex gap-4 tabular-nums text-(--text-2)">
          <span>
            {t("score")}: <b className="text-(--text)">{game.score}</b>
          </span>
          <span>
            {t("moves")}: <b className="text-(--text)">{game.moves}</b>
          </span>
          <span>
            {t("time")}: <b className="text-(--text)">{`${mm}:${ss}`}</b>
          </span>
        </div>
      </div>

      <div ref={area} className="win-felt relative min-h-0 flex-1 overflow-hidden select-none"
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={() => {
          dragRef.current = null;
          setDrag(null);
        }}
      >
        {/* stock */}
        <button
          aria-label={t("stock")}
          onClick={clickStock}
          className="win-card-slot absolute"
          style={{ left: colX(0), top: gap, width: cardW, height: cardH }}
        >
          {game.stock.length > 0 ? (
            renderCard(top(game.stock), { position: "absolute", inset: 0 })
          ) : (
            <svg viewBox="0 0 24 24" width={cardW * 0.4} height={cardW * 0.4} fill="none" stroke="currentColor" strokeWidth="1.5" className="opacity-70" aria-hidden>
              <path d="M19 12a7 7 0 1 1-2-4.9M19 4v4h-4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>

        {/* waste */}
        <div className="absolute" style={{ left: colX(1), top: gap, width: cardW * 1.6, height: cardH }}>
          {wasteShown.map((c, i) => {
            const isTop = i === wasteShown.length - 1;
            return renderCard(
              c,
              { position: "absolute", left: i * cardW * 0.22, top: 0 },
              isTop ? "waste" : undefined,
              game.waste.length - 1,
              isTop && dragging(c),
            );
          })}
        </div>

        {/* foundations */}
        {game.found.map((pile, i) => (
          <div key={i} data-pile={`found-${i}`} className="win-card-slot absolute" style={{ left: colX(3 + i), top: gap, width: cardW, height: cardH }}>
            <SuitIcon suit={i as Suit} size={cardW * 0.4} />
            {pile.length > 0 &&
              renderCard(
                top(pile),
                { position: "absolute", inset: 0 },
                `found-${i}`,
                pile.length - 1,
                dragging(top(pile)),
              )}
          </div>
        ))}

        {/* tableau */}
        {game.tab.map((pile, i) => {
          const ys = fan(pile);
          return (
            <div key={i} data-pile={`tab-${i}`} className="absolute" style={{ left: colX(i), top: tabTop, width: cardW, height: box.h - tabTop }}>
              <div className="win-card-slot absolute left-0 top-0" style={{ width: cardW, height: cardH }} />
              {pile.map((c, j) =>
                renderCard(
                  c,
                  { position: "absolute", left: 0, top: ys[j], transition: "top .15s ease" },
                  c.up ? `tab-${i}` : undefined,
                  j,
                  dragging(c),
                ),
              )}
            </div>
          );
        })}

        {/* dragged cards follow the pointer via translate */}
        {drag && (
          <div
            ref={ghost}
            className="pointer-events-none absolute z-50"
            style={{ left: drag.left, top: drag.top, filter: "drop-shadow(0 10px 18px rgba(0,0,0,.35))" }}
          >
            {drag.cards.map((c, i) => renderCard(c, { position: "absolute", left: 0, top: i * cardH * 0.27 }))}
          </div>
        )}

        <canvas ref={confetti} className="pointer-events-none absolute inset-0" />

        {won && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="win-flyout flex flex-col items-center gap-3 px-10 py-7 text-center">
              <div className="text-2xl font-semibold">{t("won")}</div>
              <div className="text-(--text-2)">{t("wonText", { moves: game.moves, time: `${mm}:${ss}`, score: game.score })}</div>
              <button className="win-btn win-btn-accent mt-2" onClick={newGame}>
                {t("playAgain")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

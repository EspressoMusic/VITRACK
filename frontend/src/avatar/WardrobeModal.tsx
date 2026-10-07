import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDownIcon, CloseIcon, LockIcon } from "../components/icons";
import { useLanguage } from "../contexts/LanguageContext";
import { WARDROBE_STRINGS } from "../lib/i18n/wardrobe";
import { AvatarView } from "./AvatarView";
import {
  ANIMALS,
  type AnimalKind,
  type AvatarLook,
  FUR_COLORS,
  isHero,
  isPlayable,
  LOCKED_HEROES,
  PLAYABLE_HEROES,
  setAvatarLook,
  useAvatarLook,
} from "./look";
import { avatarThumb } from "./thumb";

/** Up to 4 in one row, otherwise split evenly over two rows. */
const columns = (n: number) =>
  `repeat(${n <= 4 ? n : Math.ceil(n / 2)}, minmax(0, 1fr))`;

/** Playable heroes first, then the heroes and animals still to unlock. */
const ROSTER: AnimalKind[] = [
  ...PLAYABLE_HEROES,
  ...LOCKED_HEROES,
  ...ANIMALS.filter((a) => !isHero(a) && a !== "bunny"),
];
/** Where a tile sits by its distance from the centred one: sideways offset (px) and scale. */
const SLOTS = [
  { x: 0, scale: 1 },
  { x: 88, scale: 0.56 },
  { x: 136, scale: 0.4 },
];

const INK =
  "drop-shadow(2px 0 0 #000) drop-shadow(-2px 0 0 #000) drop-shadow(0 2px 0 #000) drop-shadow(0 -2px 0 #000)";

function CharacterThumb({
  kind,
  locked,
}: {
  kind: AnimalKind;
  locked: boolean;
}) {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    avatarThumb(kind).then(
      (url) => alive && setSrc(url),
      () => {},
    );
    return () => {
      alive = false;
    };
  }, [kind]);
  if (!src) return null;
  return (
    <img
      src={src}
      alt=""
      draggable={false}
      className="h-full w-full object-contain"
      style={{ filter: locked ? `brightness(0) ${INK}` : INK }}
    />
  );
}

/** Character picker: a live, spinnable 3D preview over the sculpted heroes (the only characters for now). Changes apply instantly. */
export function WardrobeModal({ onClose }: { onClose: () => void }) {
  const { lang, dir } = useLanguage();
  const t = WARDROBE_STRINGS[lang];
  const look = useAvatarLook();
  const solid = isHero(look.animal);

  const update = (key: keyof AvatarLook, value: string) =>
    setAvatarLook({ ...look, [key]: value } as AvatarLook);

  // The focused character sits big in the middle; heroes apply as soon as they land there.
  const [focus, setFocus] = useState(() =>
    Math.max(0, ROSTER.indexOf(look.animal)),
  );
  const goTo = (i: number) => {
    if (i < 0 || i >= ROSTER.length) return;
    setFocus(i);
    const kind = ROSTER[i];
    if (isPlayable(kind)) update("animal", kind);
  };
  // Physical left/right: the next character sits on the reading side.
  const side = dir === "rtl" ? -1 : 1;
  const neighbor = { left: focus - side, right: focus + side };
  const swipe = useRef<{ x: number; moved: boolean } | null>(null);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      dir={dir}
    >
      <div
        className="modal-backdrop-enter absolute inset-0"
        style={{
          backgroundColor: "rgba(60,42,16,0.35)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
        }}
        onClick={onClose}
      />
      <div
        className="modal-card-enter relative z-10 flex max-h-full w-full max-w-sm flex-col gap-2.5 rounded-3xl p-3"
        style={{ backgroundColor: "#e5c184", border: "4px solid #000000" }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={t.closeAriaLabel}
          className="absolute end-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full"
          style={{ backgroundColor: "#000000", color: "#ffffff" }}
        >
          <CloseIcon className="h-3.5 w-3.5" />
        </button>

        <div
          className="overflow-hidden rounded-2xl"
          style={{
            flex: "1 1 260px",
            minHeight: 110,
            background:
              "radial-gradient(circle at 50% 62%, #fff8e8 0%, #f6dfb0 62%, #eccb8c 100%)",
            border: "3px solid #000000",
          }}
        >
          <AvatarView spinnable />
        </div>

        <div className="flex h-36 shrink-0 flex-col justify-center gap-2.5">
          <div className="relative -mx-1">
            <div
              className="relative h-32 touch-pan-y select-none overflow-hidden"
              onPointerDown={(e) =>
                (swipe.current = { x: e.clientX, moved: false })
              }
              onPointerUp={(e) => {
                const start = swipe.current;
                if (!start) return;
                const dx = e.clientX - start.x;
                if (Math.abs(dx) > 30) {
                  start.moved = true;
                  goTo(dx < 0 ? neighbor.right : neighbor.left);
                }
              }}
              onClickCapture={(e) => {
                if (swipe.current?.moved) e.stopPropagation();
                swipe.current = null;
              }}
            >
              {ROSTER.map((option, i) => {
                const locked = !isPlayable(option);
                const active = look.animal === option;
                const d = i - focus;
                const far = Math.abs(d) >= SLOTS.length;
                const slot = SLOTS[Math.min(Math.abs(d), SLOTS.length - 1)];
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => goTo(i)}
                    aria-label={t.styles[option]}
                    aria-pressed={active}
                    aria-disabled={locked}
                    tabIndex={far ? -1 : undefined}
                    className="absolute bottom-0 left-1/2 flex h-full w-[100px] items-end justify-center transition-[transform,opacity] duration-300"
                    style={{
                      transform: `translateX(calc(-50% + ${Math.sign(d) * side * slot.x}px)) scale(${slot.scale})`,
                      transformOrigin: "50% 100%",
                      opacity: far ? 0 : Math.abs(d) === 2 ? 0.55 : 1,
                      pointerEvents: far ? "none" : undefined,
                      zIndex: SLOTS.length - Math.abs(d),
                    }}
                  >
                    {active && (
                      <span
                        className="absolute bottom-0.5 h-4 w-20 rounded-[50%]"
                        style={{
                          backgroundColor: "var(--accent)",
                          border: "2px solid #000000",
                        }}
                      />
                    )}
                    <span className="relative h-full w-full">
                      <CharacterThumb kind={option} locked={locked} />
                    </span>
                    {locked && (
                      <span
                        className="absolute left-1/2 top-1 flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full"
                        style={{
                          backgroundColor: "#000000",
                          color: "#ffffff",
                          border: "2px solid #ffffff",
                        }}
                      >
                        <LockIcon className="h-5 w-5" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            {(
              [
                ["left", 90],
                ["right", -90],
              ] as const
            ).map(([edge, turn]) => {
              const target = neighbor[edge];
              const enabled = target >= 0 && target < ROSTER.length;
              return (
                <button
                  key={edge}
                  type="button"
                  onClick={() => goTo(target)}
                  disabled={!enabled}
                  aria-hidden
                  tabIndex={-1}
                  className="absolute top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full transition-opacity active:scale-90"
                  style={{
                    [edge]: 0,
                    opacity: enabled ? 1 : 0.3,
                    backgroundColor: "var(--surface-cream)",
                    color: "#000000",
                    border: "2px solid #000000",
                    boxShadow: "0 2px 0 #000000",
                  }}
                >
                  <ChevronDownIcon
                    className="h-4 w-4"
                    style={{ transform: `rotate(${turn}deg)` }}
                    strokeWidth={3}
                  />
                </button>
              );
            })}
          </div>
          {!solid && (
            <div className="flex flex-col gap-1">
              <span
                className="text-xs font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                {t.color}
              </span>
              <div
                className="grid justify-items-center gap-1.5"
                style={{ gridTemplateColumns: columns(FUR_COLORS.length) }}
              >
                {FUR_COLORS.map((color, i) => {
                  const active = look.fur === color;
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => update("fur", color)}
                      aria-label={t.colorAria(i + 1)}
                      aria-pressed={active}
                      className="h-7 w-7 rounded-full transition-transform active:scale-90"
                      style={{
                        backgroundColor: color,
                        border: "2px solid #000000",
                        boxShadow: active
                          ? "0 0 0 2px #ffffff, 0 0 0 4px #000000"
                          : "none",
                      }}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-full py-2 text-xl font-black transition-transform active:translate-y-1 active:shadow-none"
            style={{
              backgroundColor: "var(--accent)",
              color: "#000000",
              border: "3px solid #000000",
              boxShadow: "0 3px 0 #000000",
            }}
          >
            {t.done}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

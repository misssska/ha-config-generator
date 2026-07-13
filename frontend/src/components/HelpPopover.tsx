"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

type HelpVariant = "info" | "warning" | "danger";

type HelpPopoverProps = {
  title: string;
  description: string;
  details?: string;
  variant?: HelpVariant;
};

type Position = {
  top: number;
  left: number;
};

const VARIANT_CLASSES: Record<
  HelpVariant,
  {
    button: string;
    panel: string;
    icon: string;
  }
> = {
  info: {
    button:
      "border-blue-500/40 bg-blue-500/10 text-blue-200 hover:bg-blue-500/20",
    panel:
      "border-blue-500/30 bg-slate-950 text-slate-200",
    icon: "i",
  },
  warning: {
    button:
      "border-amber-500/50 bg-amber-500/10 text-amber-200 hover:bg-amber-500/20",
    panel:
      "border-amber-500/40 bg-slate-950 text-slate-200",
    icon: "!",
  },
  danger: {
    button:
      "border-red-500/50 bg-red-500/10 text-red-200 hover:bg-red-500/20",
    panel:
      "border-red-500/40 bg-slate-950 text-slate-200",
    icon: "!",
  },
};

export default function HelpPopover({
  title,
  description,
  details,
  variant = "info",
}: HelpPopoverProps) {
  const tooltipId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [position, setPosition] = useState<Position | null>(null);

  const variantClasses = VARIANT_CLASSES[variant];

  function closePopover() {
    setPinned(false);
    setOpen(false);
    setPosition(null);
  }

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;

      if (
        pinned &&
        !triggerRef.current?.contains(target) &&
        !panelRef.current?.contains(target)
      ) {
        closePopover();
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && open) {
        closePopover();
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, pinned]);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current || !panelRef.current) {
      return;
    }

    function updatePosition() {
      const trigger = triggerRef.current;
      const panel = panelRef.current;

      if (!trigger || !panel) {
        return;
      }

      const triggerRect = trigger.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();

      const margin = 12;
      const gap = 10;

      const hasRoomBelow =
        window.innerHeight - triggerRect.bottom >= panelRect.height + gap;

      const proposedTop = hasRoomBelow
        ? triggerRect.bottom + gap
        : triggerRect.top - panelRect.height - gap;

      const centeredLeft =
        triggerRect.left + triggerRect.width / 2 - panelRect.width / 2;

      const left = Math.min(
        Math.max(centeredLeft, margin),
        window.innerWidth - panelRect.width - margin,
      );

      setPosition({
        top: Math.max(margin, proposedTop),
        left,
      });
    }

    const animationFrame = window.requestAnimationFrame(updatePosition);

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  function handleClick() {
    if (pinned) {
      closePopover();
      return;
    }

    setPinned(true);
    setOpen(true);
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={`Súgó: ${title}`}
        aria-expanded={open}
        aria-controls={tooltipId}
        onClick={handleClick}
        onPointerEnter={(event) => {
          if (event.pointerType === "mouse") {
            setOpen(true);
          }
        }}
        onPointerLeave={(event) => {
          if (event.pointerType === "mouse" && !pinned) {
            setOpen(false);
            setPosition(null);
          }
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          if (!pinned) {
            setOpen(false);
            setPosition(null);
          }
        }}
        className={`ml-2 inline-flex h-5 w-5 shrink-0 cursor-help items-center justify-center rounded-full border text-[11px] font-bold transition focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${variantClasses.button}`}
      >
        {variantClasses.icon}
      </button>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={panelRef}
            id={tooltipId}
            role="tooltip"
            style={{
              position: "fixed",
              top: position?.top ?? 0,
              left: position?.left ?? 0,
              visibility: position ? "visible" : "hidden",
            }}
            className={`z-[100] w-[min(20rem,calc(100vw-1.5rem))] rounded-xl border p-4 text-left text-xs leading-5 shadow-2xl ${variantClasses.panel}`}
          >
            <div className="mb-1 font-semibold text-slate-100">
              {title}
            </div>

            <p>{description}</p>

            {details && (
              <p className="mt-2 border-t border-slate-800 pt-2 text-slate-400">
                {details}
              </p>
            )}

            <p className="mt-2 text-[11px] text-slate-500">
              Kattintással rögzíthető. Bezárás: külső kattintás vagy Esc.
            </p>
          </div>,
          document.body,
        )}
    </>
  );
}

"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { IconCheck, IconChevronRight, IconDot } from "./icons";

export type MenuEntry =
  | "separator"
  | {
      label: string;
      icon?: React.ReactNode;
      onClick?: () => void;
      checked?: boolean;
      /** radio items show a dot instead of a check */
      radio?: boolean;
      submenu?: MenuEntry[];
      shortcut?: string;
      bold?: boolean;
      /** Rendered as a real link so the browser opens it natively */
      href?: string;
      download?: boolean;
    };

/** Keeps a freshly rendered menu inside the viewport without a re-render */
function fitToViewport(el: HTMLDivElement | null, flipFrom?: DOMRect) {
  if (!el) return;
  const r = el.getBoundingClientRect();
  const maxY = window.innerHeight - 56;
  if (flipFrom) {
    if (r.right > window.innerWidth - 4) el.style.left = `${-r.width + 4}px`;
    if (r.bottom > maxY) el.style.top = `${maxY - r.bottom}px`;
    return;
  }
  if (r.right > window.innerWidth - 4) el.style.left = `${window.innerWidth - 4 - r.right}px`;
  if (r.bottom > maxY) el.style.top = `${Math.max(4 - r.top, maxY - r.bottom)}px`;
}

function MenuList({ items, onClose, nested }: { items: MenuEntry[]; onClose: () => void; nested?: boolean }) {
  const [open, setOpen] = useState<number | null>(null);
  const hasMarks = items.some((i) => i !== "separator" && (i.checked !== undefined || i.icon));

  return (
    <div
      ref={(el) => fitToViewport(el, nested ? new DOMRect() : undefined)}
      data-menu
      role="menu"
      className={`win-menu min-w-56 ${nested ? "absolute left-full top-0 -ml-1" : "relative"}`}
      onContextMenu={(e) => e.preventDefault()}
    >
      {items.map((item, i) => {
        if (item === "separator") return <div key={i} className="mx-1 my-1 h-px bg-(--divider)" />;
        const mark =
          item.checked !== undefined ? (
            item.checked ? (
              item.radio ? <IconDot /> : <IconCheck />
            ) : (
              <span className="size-4" />
            )
          ) : (
            item.icon
          );
        const body = (
          <>
            {hasMarks && <span className="flex w-4 shrink-0 justify-center">{mark}</span>}
            <span className={`flex-1 truncate ${item.bold ? "font-semibold" : ""}`}>{item.label}</span>
            {item.shortcut && <span className="pl-6 text-xs text-(--text-2)">{item.shortcut}</span>}
            {item.submenu && <IconChevronRight size={12} />}
          </>
        );
        return (
          <div
            key={i}
            className="relative"
            onPointerEnter={() => setOpen(item.submenu ? i : null)}
          >
            {item.href ? (
              <a
                role="menuitem"
                className="win-menu-item"
                href={item.href}
                download={item.download}
                target={item.download ? undefined : "_blank"}
                rel="noreferrer"
                onClick={onClose}
              >
                {body}
              </a>
            ) : (
              <button
                role="menuitem"
                className={`win-menu-item ${open === i ? "bg-(--hover)" : ""}`}
                onClick={() => {
                  if (item.submenu) return setOpen(open === i ? null : i);
                  onClose();
                  item.onClick?.();
                }}
              >
                {body}
              </button>
            )}
            {item.submenu && open === i && <MenuList items={item.submenu} onClose={onClose} nested />}
          </div>
        );
      })}
    </div>
  );
}

/** Context menu / dropdown at a viewport position; closes on outside click or Esc */
export default function Menu({
  x,
  y,
  items,
  onClose,
}: {
  x: number;
  y: number;
  items: MenuEntry[];
  onClose: () => void;
}) {
  useEffect(() => {
    const down = (e: PointerEvent) => {
      if (!(e.target as HTMLElement).closest("[data-menu]")) onClose();
    };
    const key = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("pointerdown", down, true);
    window.addEventListener("keydown", key);
    return () => {
      window.removeEventListener("pointerdown", down, true);
      window.removeEventListener("keydown", key);
    };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.14, ease: [0.1, 0.9, 0.2, 1] }}
      className="fixed z-[9600]"
      style={{ left: x, top: y }}
    >
      <MenuList items={items} onClose={onClose} />
    </motion.div>
  );
}

/** Helper for dropdown buttons: opens a menu right under the clicked element */
export function useDropdown() {
  const [menu, setMenu] = useState<{ x: number; y: number; id: string } | null>(null);
  return {
    menu,
    toggle: (id: string) => (e: React.MouseEvent<HTMLElement>) => {
      e.stopPropagation();
      if (menu?.id === id) return setMenu(null);
      const r = e.currentTarget.getBoundingClientRect();
      setMenu({ x: r.left, y: r.bottom + 4, id });
    },
    close: () => setMenu(null),
  };
}

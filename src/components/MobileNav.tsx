"use client";

import { useRef } from "react";
import { Menu, X } from "lucide-react";
import NavLink from "./NavLink";
import { navLinks } from "./navLinks";

export default function MobileNav() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const open = () => dialogRef.current?.showModal();
  const close = () => dialogRef.current?.close();

  return (
    <>
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between bg-ink px-4 text-paper md:hidden">
        <span className="font-display text-xl font-semibold">Study Buddy</span>
        <button
          type="button"
          onClick={open}
          aria-label="Open menu"
          className="flex size-11 cursor-pointer items-center justify-center rounded-lg hover:bg-white/10"
        >
          <Menu size={24} aria-hidden />
        </button>
      </header>

      <dialog
        ref={dialogRef}
        aria-label="Main menu"
        // Tapping the dark backdrop closes the menu
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
        className="m-0 h-dvh max-h-none w-72 max-w-[85vw] bg-ink p-0 text-paper backdrop:bg-black/50 md:hidden"
      >
        <nav aria-label="Main" className="flex h-full flex-col gap-6 p-5">
          <div className="flex items-center justify-between">
            <span className="font-display text-xl font-semibold">Study Buddy</span>
            <button
              type="button"
              onClick={close}
              aria-label="Close menu"
              className="flex size-11 cursor-pointer items-center justify-center rounded-lg hover:bg-white/10"
            >
              <X size={24} aria-hidden />
            </button>
          </div>
          <div className="flex flex-col gap-1.5">
            {navLinks.map((link) => (
              <NavLink key={link.href} {...link} onClick={close} />
            ))}
          </div>
        </nav>
      </dialog>
    </>
  );
}
import NavLink from "./NavLink";
import { navLinks } from "./navLinks";

export default function Sidebar() {
  return (
    <nav
      aria-label="Main"
      className="sticky top-0 hidden h-screen shrink-0 flex-col gap-8 bg-ink py-8 text-paper md:flex md:w-20 md:px-3 lg:w-60 lg:px-5"
    >
      <div className="font-display font-semibold">
        <span aria-hidden className="block text-center text-2xl lg:hidden">
          SB
        </span>
        <span className="sr-only lg:not-sr-only lg:block lg:pl-3 lg:text-[26px]">
          Study Buddy
        </span>
      </div>
      <div className="flex flex-col gap-1.5">
        {navLinks.map((link) => (
          <NavLink key={link.href} {...link} />
        ))}
      </div>
    </nav>
  );
}
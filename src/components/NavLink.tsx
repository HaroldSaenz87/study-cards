"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavLinkProps = {
  href: string;
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
};

export default function NavLink({ href, label, icon, onClick }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      onClick={onClick}
      title={label}
      aria-current={isActive ? "page" : undefined}
      className={`flex min-h-11 items-center gap-3 rounded-lg px-3 transition-colors md:max-lg:justify-center md:max-lg:px-0 ${
        isActive
          ? "bg-accent font-semibold text-white"
          : "text-[#D9DCE3] hover:bg-white/10 hover:text-white"
      }`}
    >
      {icon}
      <span className="md:max-lg:sr-only">{label}</span>
    </Link>
  );
}
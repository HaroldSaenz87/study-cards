import { House, Layers, CircleHelp, ChartColumn } from "lucide-react";

const iconProps = { size: 20, strokeWidth: 1.8, "aria-hidden": true } as const;

export const navLinks = [
  { href: "/", label: "Home", icon: <House {...iconProps} /> },
  { href: "/study", label: "Study cards", icon: <Layers {...iconProps} /> },
  { href: "/quiz", label: "Quiz mode", icon: <CircleHelp {...iconProps} /> },
  { href: "/progress", label: "Progress", icon: <ChartColumn {...iconProps} /> },
];
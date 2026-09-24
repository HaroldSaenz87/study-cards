import { House, Layers, CircleHelp, ChartColumn } from "lucide-react";
import NavLink from "./NavLink";

const iconProps = { size: 20, strokeWidth: 1.8, "aria-hidden": true};

const links = [

    { href: "/", label: "Home", icon: <House {...iconProps} />},
    { href: "/study", label: "Study cards", icon: <Layers {...iconProps} />},
    { href: "/quiz", label: "Quiz mode", icon: <CircleHelp {...iconProps} />},
    { href: "/progress", label: "progress", icon: <ChartColumn {...iconProps} />},

];

export default function Sidebar(){
    return(
        <nav
            aria-label="Main"
            className="sticky top-0 flex h-screen w-60 shrink-0 flex-col gap-8 bg-ink px-5 py-8 text-paper"
        >
            <div className="pl-3 font-display text-[26px] font-semibold">
                Study Buddy
            </div>
            
            <div className="flex flex-col gap-1.5">
                
                {links.map((link) => (
                    <NavLink key={link.href} {...link} />
                ))}

            </div>
        </nav>
    )
}
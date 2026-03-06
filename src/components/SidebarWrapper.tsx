"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";

export function SidebarWrapper() {
    const pathname = usePathname();

    // Paths where we do NOT want the sidebar to appear
    const noSidebarRoutes = ["/login", "/register"];

    if (noSidebarRoutes.includes(pathname)) {
        return null;
    }

    return <Sidebar />;
}

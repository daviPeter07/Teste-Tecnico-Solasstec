"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  CalendarDays,
  DoorOpen,
  LayoutDashboard,
  Users,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const navigationItems = [
  { href: "/", label: "Visão geral", icon: LayoutDashboard },
  { href: "/visitantes", label: "Visitantes", icon: Users },
  { href: "/salas", label: "Salas", icon: DoorOpen },
  { href: "/feriados", label: "Feriados", icon: CalendarDays },
  { href: "/agendamentos", label: "Agendamentos", icon: Building2 },
] as const;

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <SidebarHeader className="border-b border-sidebar-border p-2 group-data-[collapsible=icon]:p-1.5">
        <Link
          href="/"
          className="flex h-12 items-center gap-3 px-2 group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:px-0"
        >
          <span className="flex size-8 shrink-0 items-center justify-center bg-primary text-primary-foreground transition-all group-data-[collapsible=icon]:size-7">
            <Building2 aria-hidden="true" className="size-4 shrink-0 transition-all group-data-[collapsible=icon]:size-3.5" />
          </span>
          <span className="group-data-[collapsible=icon]:hidden">
            <span className="block text-xs font-bold tracking-[0.1em] uppercase">Solasstec</span>
            <span className="block font-mono text-[0.58rem] tracking-[0.15em] text-muted-foreground uppercase">
              Portaria corporativa
            </span>
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="font-mono text-[0.62rem] tracking-[0.18em] text-muted-foreground uppercase group-data-[collapsible=icon]:hidden">
            Operação
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const isActive =
                  item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                const Icon = item.icon;

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.label}
                      className={cn(
                        "h-11 rounded-none border-l-2 px-3 transition-colors group-data-[collapsible=icon]:!size-9 group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:border-l-0",
                        isActive
                          ? "border-primary bg-sidebar-accent font-medium text-sidebar-accent-foreground group-data-[collapsible=icon]:bg-sidebar-accent"
                          : "border-transparent text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                      )}
                    >
                      <Link href={item.href} className="flex items-center">
                        <Icon aria-hidden="true" className="size-4 shrink-0" />
                        <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export function AppHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <SidebarTrigger />
        <CurrentAreaName />
      </div>
      <ThemeToggle />
    </header>
  );
}

export function CurrentAreaName({ compact = false }: { compact?: boolean }) {
  const pathname = usePathname();
  const currentArea = navigationItems.find((item) =>
    item.href === "/" ? pathname === "/" : pathname.startsWith(item.href),
  );

  return (
    <div className={cn("flex items-center", compact ? "gap-2" : "gap-3")}>
      <span
        aria-hidden="true"
        className={cn("bg-primary", compact ? "h-4 w-0.5" : "h-5 w-1")}
      />
      <span
        className={cn(
          "font-semibold text-foreground",
          compact
            ? "text-xs tracking-[0.08em] uppercase"
            : "text-sm tracking-tight",
        )}
      >
        {currentArea?.label ?? "Visão geral"}
      </span>
    </div>
  );
}

export { SidebarProvider };

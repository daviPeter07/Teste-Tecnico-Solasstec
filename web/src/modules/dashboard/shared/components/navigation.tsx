"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArchiveX,
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
  { href: "/", label: "Visão geral", dockLabel: "Início", icon: LayoutDashboard },
  { href: "/visitantes", label: "Visitantes", dockLabel: "Visitantes", icon: Users },
  { href: "/salas", label: "Salas", dockLabel: "Salas", icon: DoorOpen },
  { href: "/feriados", label: "Feriados", dockLabel: "Feriados", icon: CalendarDays },
  { href: "/agendamentos", label: "Agendamentos", dockLabel: "Agenda", icon: Building2 },
  { href: "/inativos", label: "Inativos", dockLabel: "Inativos", icon: ArchiveX },
] as const;

function isActivePath(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

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
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const isActive = isActivePath(pathname, item.href);
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
        <SidebarTrigger className="hidden md:inline-flex" />
        <CurrentAreaName />
      </div>
      <ThemeToggle />
    </header>
  );
}

export function MobileDockNavigation() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-card/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-12px_30px_rgba(15,23,42,0.1)] backdrop-blur-xl md:hidden"
    >
      <div className="grid w-full grid-cols-6">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = isActivePath(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "group flex h-12 flex-col items-center justify-center gap-0.5 px-1 text-[0.61rem] font-bold tracking-tight transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
              )}
            >
              <Icon
                aria-hidden="true"
                className={cn(
                  "size-4 transition-transform group-hover:-translate-y-0.5",
                  isActive && "size-4.5",
                )}
              />
              <span className="max-w-full truncate leading-none">{item.dockLabel}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function CurrentAreaName({ compact = false }: { compact?: boolean }) {
  const pathname = usePathname();
  const currentArea = navigationItems.find((item) => isActivePath(pathname, item.href));

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

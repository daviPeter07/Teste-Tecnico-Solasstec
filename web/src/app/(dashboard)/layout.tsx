import {
  AppHeader,
  AppSidebar,
  SidebarProvider,
} from "@/modules/dashboard/shared/components/navigation";

export const dynamic = "force-dynamic";

export default function DashboardLayout({ children }: LayoutProps<"/">) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background text-foreground">
        <AppSidebar />
        <div className="flex flex-1 flex-col min-w-0">
          <AppHeader />
          <main className="mx-auto w-full max-w-[1500px] flex-1 px-5 py-5 sm:px-8 sm:py-6 lg:px-12">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

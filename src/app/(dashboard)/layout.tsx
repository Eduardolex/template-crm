import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { getTenantColorCSS } from "@/lib/color-presets/get-tenant-colors";
import { MobileSidebarProvider } from "@/components/layout/mobile-sidebar-provider";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Fetch tenant-specific CSS
  const colorCSS = await getTenantColorCSS();

  return (
    <>
      {/* Inject tenant-specific color CSS */}
      <style dangerouslySetInnerHTML={{ __html: colorCSS }} />

      <MobileSidebarProvider>
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <div className="flex flex-1 flex-col overflow-hidden">
            <Header />
            <main className="flex-1 overflow-y-auto bg-background p-4 md:p-6">
              {children}
            </main>
          </div>
        </div>
      </MobileSidebarProvider>
    </>
  );
}

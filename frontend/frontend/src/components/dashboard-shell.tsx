import type { ReactNode } from "react";
import { AppSidebar } from "./app-sidebar";
import { TopNavbar } from "./top-navbar";
import { Footer } from "./footer";

export function DashboardShell({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen flex w-full bg-background relative">
      <div className="pointer-events-none fixed inset-0 grid-bg opacity-40" />
      <div className="pointer-events-none fixed inset-0 hero-bg" />
      <div 
        className="pointer-events-none fixed inset-0 opacity-30"
        style={{
          backgroundImage: 'url(/src/components/ui/background.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      />
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0 relative">
        <TopNavbar title={title} />
        <main className="flex-1 px-4 md:px-8 py-8">{children}</main>
        <Footer />
      </div>
    </div>
  );
}

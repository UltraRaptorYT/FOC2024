import { Outlet } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Toaster } from "@/components/ui/toaster";

function Layout() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <main className="min-h-[100dvh] bg-slate-100 dark:bg-slate-900 flex dark:text-white text-black w-full">
        <div className="grow w-full">
          <Outlet />
          <Toaster />
        </div>
      </main>
      <div className="fixed bottom-3 left-3">
        <ThemeToggle></ThemeToggle>
      </div>
    </ThemeProvider>
  );
}

export default Layout;

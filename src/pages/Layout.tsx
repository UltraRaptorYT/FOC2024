import { Outlet } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/hooks/AuthContext";

function Layout() {
  return (
    <AuthProvider>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <main className="min-h-[100dvh] bg-slate-100 dark:bg-black flex dark:text-white text-black w-full">
          <div className="grow w-full">
            <Outlet />
            <Toaster expand={true} richColors />
          </div>
        </main>
        <div className="fixed bottom-3 left-3">
          <ThemeToggle></ThemeToggle>
        </div>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default Layout;

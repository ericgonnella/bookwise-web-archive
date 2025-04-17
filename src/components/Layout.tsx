
import React, { ReactNode } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  // Simple toggle for dark mode (frontend only in this version)
  const toggleDarkMode = () => {
    document.documentElement.classList.toggle("dark");
  };
  
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-primary">BookWise</h1>
          </div>
          
          <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </header>
      
      <main>{children}</main>
      
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} BookWise. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;

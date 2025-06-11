import { type ReactNode, useState } from "react";
import { Link } from "react-router";
import { ChevronRight, Home, Settings, HelpCircle, X } from "lucide-react";
import { Button } from "@/components/atoms/button.comp";

interface SidebarProps {
  children: ReactNode;
}

export function Sidebar({ children }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-[60] bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-600 transition-all duration-300"
      >
        <ChevronRight
          className={`h-5 w-5 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
        <span className="sr-only">Toggle Sidebar</span>
      </Button>
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 sm:w-72 bg-zinc-900/95 backdrop-blur-sm border-r border-zinc-800 shadow-2xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 border-b border-zinc-800">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-white">Canban</h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <Link
                to="/dashboard"
                onClick={() => setIsOpen(false)}
                className="flex items-center px-4 py-3 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-lg transition-colors"
              >
                <Home className="w-5 h-5 mr-3" />
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard/settings"
                onClick={() => setIsOpen(false)}
                className="flex items-center px-4 py-3 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5 mr-3" />
                Settings
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard/help"
                onClick={() => setIsOpen(false)}
                className="flex items-center px-4 py-3 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-lg transition-colors"
              >
                <HelpCircle className="w-5 h-5 mr-3" />
                Help
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      <main className="w-full">{children}</main>
    </>
  );
}

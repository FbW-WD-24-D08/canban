import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import { Menu } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import { Button } from "../atoms/button.comp";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../molecules/dropdown-menu.comp";

export function Navbar() {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  const isHomePage = location.pathname === "/";

  useEffect(() => {
    if (!isHomePage) {
      setIsVisible(true);
      return;
    }

    // Hide navbar after a delay on the homepage
    const timer = setTimeout(() => {
      if (window.scrollY < 100) {
        setIsVisible(false);
      }
    }, 3000); // 3-second delay

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < lastScrollY.current || currentScrollY < 100) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
      lastScrollY.current = currentScrollY;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (e.clientY < 80) {
        setIsVisible(true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isHomePage]);

  const navClasses = isHomePage
    ? "absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/50 to-transparent"
    : "sticky top-0 z-50 bg-zinc-900 border-b border-zinc-800";

  const transitionClasses =
    !isVisible && isHomePage
      ? "-translate-y-full opacity-0"
      : "translate-y-0 opacity-100";

  return (
    <nav
      className={`${navClasses} transition-all duration-500 ease-in-out ${transitionClasses}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link
            to="/"
            className="text-white text-xl font-bold hover:text-teal-400 transition-colors flex items-center"
          >
            Canban
          </Link>
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/about"
              className="text-zinc-300 hover:text-white transition-colors text-sm font-medium flex items-center h-10"
            >
              About
            </Link>
            <SignedIn>
              <Link
                to="/dashboard"
                className="text-zinc-300 hover:text-white transition-colors text-sm font-medium flex items-center h-10"
              >
                Dashboard
              </Link>
            </SignedIn>
            <SignedOut>
              <Button
                asChild
                variant="default"
                size="sm"
                className="bg-teal-600 hover:bg-teal-700 flex items-center"
              >
                <Link to="/signin" className="flex items-center">
                  Login
                </Link>
              </Button>
            </SignedOut>
          </div>
          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8",
                },
              }}
            />
          </SignedIn>
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-zinc-300 hover:text-white hover:bg-zinc-800 flex items-center justify-center"
                >
                  <Menu size={20} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48 bg-zinc-900 border-zinc-800">
                <DropdownMenuItem className="focus:bg-zinc-800 focus:text-white">
                  <Link
                    to="/about"
                    className="text-zinc-300 hover:text-white w-full flex items-center py-2"
                  >
                    About
                  </Link>
                </DropdownMenuItem>
                <SignedIn>
                  <DropdownMenuItem className="focus:bg-zinc-800 focus:text-white">
                    <Link
                      to="/dashboard"
                      className="text-zinc-300 hover:text-white w-full flex items-center py-2"
                    >
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                </SignedIn>
                <SignedOut>
                  <DropdownMenuItem className="focus:bg-zinc-800 focus:text-white">
                    <Link
                      to="/signin"
                      className="text-zinc-300 hover:text-white w-full flex items-center py-2"
                    >
                      Login
                    </Link>
                  </DropdownMenuItem>
                </SignedOut>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}

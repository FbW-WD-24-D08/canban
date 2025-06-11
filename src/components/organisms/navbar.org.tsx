import { Link } from "react-router";
import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import { Button } from "@/components/atoms/button.comp";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/molecules/dropdown-menu.comp";
import { Menu } from "lucide-react";

export function Navbar() {
  return (
    <nav className="bg-zinc-900 border-b border-zinc-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 pl-16">
          <Link
            to="/"
            className="text-white text-xl font-bold hover:text-teal-400 transition-colors flex items-center"
          >
            Canban
          </Link>
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex md:items-center md:space-x-4">
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
                <DropdownMenuContent
                  align="end"
                  className="bg-zinc-900 border-zinc-800 min-w-[160px]"
                >
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
      </div>
    </nav>
  );
}

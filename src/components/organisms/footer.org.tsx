import { Github } from "lucide-react";
import { Link } from "react-router";

export function Footer() {
  return (
    <footer className="bg-zinc-900 border-t border-zinc-800 py-4 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <p className="text-zinc-400 text-sm">
            © {new Date().getFullYear()} All rights reserved.
          </p>

          <Link
            to="https://github.com/FbW-WD-24-D08/canban"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-400 hover:text-white transition-colors flex items-center space-x-2"
          >
            <Github size={20} />
            <span className="text-sm">GitHub</span>
          </Link>

          <div className="flex space-x-4">
            <Link
              to="/about"
              className="text-zinc-400 hover:text-white transition-colors text-sm"
            >
              About
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

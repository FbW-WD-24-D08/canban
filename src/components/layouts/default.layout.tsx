import { type ReactNode } from "react";

import { Footer } from "../organisms/footer.org.tsx";
import { Hero } from "../organisms/hero.org.tsx";
import { Navbar } from "../organisms/navbar.org.tsx";

interface DefaultLayoutProps {
  children: ReactNode;
  withHero?: boolean;
}

export function DefaultLayout({ children, withHero }: DefaultLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      {withHero && <Hero />}
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

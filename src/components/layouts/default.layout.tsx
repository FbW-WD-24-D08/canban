import { type ReactNode } from "react";

import { Navbar } from "../organisms/navbar.org.tsx";
import { Footer } from "../organisms/footer.org.tsx";

function Hero() {
  return (
    <section>
      <h2>Hero Section</h2>
    </section>
  );
}

interface DefaultLayoutProps {
  children: ReactNode;
  withHero?: boolean;
}

export function DefaultLayout({ children, withHero }: DefaultLayoutProps) {
  return (
    <>
      <Navbar />
      {withHero && <Hero />}
      {children}
      <Footer />
    </>
  );
}

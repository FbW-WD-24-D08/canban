import { type ReactNode } from "react";

function Navbar() {
  return (
    <nav>
      <h1>Navbar</h1>
    </nav>
  );
}

function Hero() {
  return (
    <section>
      <h2>Hero Section</h2>
    </section>
  );
}

function Footer() {
  return (
    <footer>
      <p>© Footer</p>
    </footer>
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

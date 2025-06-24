import { CommandPalette } from "@/components/molecules/command-palette.comp";
import { HelpOverlay } from "@/components/molecules/help-overlay.comp";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { lazy, Suspense, useEffect, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";

import "./App.css";
import { ToastProvider } from "./components/contexts/toast.context.tsx";
import { UserProvider } from "./components/contexts/user.context.tsx";
import DashboardLayout from "./components/layouts/dashboard.layout.tsx";

const IndexPage = lazy(() => import("./components/pages/index.page.tsx"));
const SigninPage = lazy(() => import("./components/pages/signin.page.tsx"));
const SignUpPage = lazy(() => import("./components/pages/signup.page.tsx"));
const AboutPage = lazy(() => import("./components/pages/about.page.tsx"));
const DashboardPage = lazy(
  () => import("./components/pages/dashboard.page.tsx")
);
const NotFoundPage = lazy(() => import("./components/pages/notfound.page.tsx"));
const ProtectedRoute = lazy(
  () => import("./components/molecules/protected-route.comp.tsx")
);
const BoardPage = lazy(() => import("./components/pages/board.page.tsx"));

function App() {
  const [showHelp, setShowHelp] = useState(false);
  const [showCmd, setShowCmd] = useState(false);
  const location = useLocation();

  const isDashboard = location.pathname.startsWith("/dashboard");

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "?") {
        setShowHelp((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <TooltipProvider delayDuration={200}>
      <ToastProvider>
        <Suspense
          fallback={
            <div className="flex flex-1 items-center justify-center p-8 text-zinc-400">
              Loading...
            </div>
          }
        >
          <Routes>
            {/* Public Routes */}
            <Route element={<IndexPage />} path="/" />
            <Route element={<AboutPage />} path="/about" />

            {/* Signin/Signout */}
            <Route element={<SigninPage />} path="/signin" />
            <Route element={<SigninPage />} path="/signin/factor-one" />
            <Route element={<SigninPage />} path="/signin/reset-password" />
            <Route
              element={<SigninPage />}
              path="/signin/reset-password-success"
            />
            <Route element={<SigninPage />} path="/signin/sso-callback" />
            <Route element={<SignUpPage />} path="/signup" />
            <Route
              element={<SignUpPage />}
              path="/signup/verify-email-address"
            />

            {/* Dashboard Routes */}
            <Route
              element={
                <UserProvider>
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                </UserProvider>
              }
              path="/dashboard"
            >
              <Route element={<DashboardPage />} index />
              <Route element={<BoardPage />} path="board/:id" />
            </Route>
            {/* Error */}
            <Route element={<NotFoundPage />} path="*" />
          </Routes>
        </Suspense>
        {showHelp && <HelpOverlay onClose={() => setShowHelp(false)} />}
        {showCmd && <CommandPalette open={showCmd} onOpenChange={setShowCmd} />}
        {/* floating help button */}
        {isDashboard && (
          <button
            onClick={() => setShowHelp((p) => !p)}
            title="Help ( ? )"
            className="fixed bottom-16 right-4 z-55 w-10 h-10 flex items-center justify-center rounded-full bg-teal-600 hover:bg-teal-700 text-white text-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
          >
            ?
          </button>
        )}
      </ToastProvider>
    </TooltipProvider>
  );
}

export default App;

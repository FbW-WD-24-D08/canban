import { ClerkProvider } from "@clerk/clerk-react";
import * as Toast from "@radix-ui/react-toast";
import { Theme } from "@radix-ui/themes";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App.tsx";
import "./index.css";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Add your Clerk Publishable Key to the .env file");
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Toast.Provider swipeDirection="right" duration={4000}>
      <Theme appearance="dark" accentColor="teal" grayColor="olive">
        <ClerkProvider afterSignOutUrl={"/"} publishableKey={PUBLISHABLE_KEY}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ClerkProvider>
      </Theme>
      <Toast.Viewport className="fixed bottom-0 right-0 p-4 flex flex-col gap-2 w-96 max-w-full z-[10000] outline-none" />
    </Toast.Provider>
  </StrictMode>
);

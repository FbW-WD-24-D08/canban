import { Route, Routes } from "react-router";
import { lazy } from "react";

import "./App.css";
import DashboardLayout from "./components/layouts/dashboard.layout.tsx";

const IndexPage = lazy(() => import("./components/pages/index.page.tsx"));
const SigninPage = lazy(() => import("./components/pages/signin.page.tsx"));
const SignUpPage = lazy(() => import("./components/pages/signup.page.tsx"));
const AboutPage = lazy(() => import("./components/pages/about.page.tsx"));
const DashboardPage = lazy(
  () => import("./components/pages/dashboard.page.tsx")
);

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Routes>
        {/* Public Routes */}
        <Route element={<IndexPage />} path="/" />
        <Route element={<AboutPage />} path="/about" />

        {/* Signin/Signout */}
        <Route element={<SigninPage />} path="/signin" />
        <Route element={<SigninPage />} path="/signin/factor-one" />
        <Route element={<SigninPage />} path="/signin/reset-password" />
        <Route element={<SigninPage />} path="/signin/reset-password-success" />
        <Route element={<SigninPage />} path="/signin/sso-callback" />
        <Route element={<SignUpPage />} path="/signup" />
        <Route element={<SignUpPage />} path="/signup/verify-email-address" />

        {/* Dashboard Routes */}
        <Route element={<DashboardLayout />}>
          <Route element={<DashboardPage />} path="/dashboard" />
        </Route>
      </Routes>
    </div>
  );
}

export default App;

import { Route, Routes } from "react-router";
import { lazy } from "react";

import "./App.css";

const IndexPage = lazy(() => import("./components/pages/index.page"));
const SigninPage = lazy(() => import("./components/pages/signin.page"));
const SignUpPage = lazy(() => import("./components/pages/signup.page"));

function App() {
  return (
    <>
      <Routes>
        <Route element={<IndexPage />} path="/" />

        {/* Signin/Signout */}
        <Route element={<SigninPage />} path="/signin" />
        <Route element={<SigninPage />} path="/signin/factor-one" />
        <Route element={<SigninPage />} path="/signin/reset-password" />
        <Route element={<SigninPage />} path="/signin/reset-password-success" />
        <Route element={<SigninPage />} path="/signin/sso-callback" />
        <Route element={<SignUpPage />} path="/signup" />
        <Route element={<SignUpPage />} path="/signup/verify-email-address" />
      </Routes>
    </>
  );
}

export default App;

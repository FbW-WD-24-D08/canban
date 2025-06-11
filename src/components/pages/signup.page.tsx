import { SignUp } from "@clerk/clerk-react";
import { DefaultLayout } from "../layouts/default.layout.js";
import { MetaTags } from "../atoms/metatags.comp.js";
import { siteConfig } from "../../config/site.js";
MetaTags;

export default function SignUpPage() {
  return (
    <>
      <MetaTags
        title={siteConfig.meta.signup.title}
        desc={siteConfig.meta.signup.desc}
        bots={siteConfig.meta.signup.bots}
        keywords={siteConfig.meta.signup.keywords}
      />
      <DefaultLayout>
        <section className="flex flex-col items-center justify-center h-screen">
          <SignUp
            fallback={"Loading..."}
            path="/signup"
            forceRedirectUrl={"/dashboard"}
            signInUrl="/signin"
          />
        </section>
      </DefaultLayout>
    </>
  );
}

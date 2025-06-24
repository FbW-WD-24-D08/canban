import { siteConfig } from "@/config/site.ts";
import { Link } from "react-router-dom";
import { Button } from "../atoms/button.comp.tsx";
import { MetaTags } from "../atoms/metatags.comp.tsx";
import { DefaultLayout } from "../layouts/default.layout.tsx";

export default function NotFoundPage() {
  return (
    <>
      <MetaTags
        title={siteConfig.meta.notfound.title}
        desc={siteConfig.meta.notfound.desc}
        bots={siteConfig.meta.notfound.bots}
        keywords={siteConfig.meta.notfound.keywords}
      />
      <DefaultLayout>
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
          <div className="max-w-lg mx-auto text-center">
            <div className="mb-8">
              <div className="text-8xl md:text-9xl font-bold text-teal-500 mb-4">
                404
              </div>
              <div className="w-24 h-1 bg-teal-500 mx-auto mb-8"></div>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Page Not Found
            </h1>

            <p className="text-xl text-zinc-400 mb-8 leading-relaxed">
              Looks like you've wandered off the board. The page you're looking
              for doesn't exist.
            </p>

            <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
              <Button
                asChild
                className="bg-teal-600 hover:bg-teal-700 w-full sm:w-auto"
              >
                <Link to="/">Back to Home</Link>
              </Button>
            </div>

            <div className="mt-12 text-center">
              <p className="text-sm text-zinc-500">
                Need help? Check out our{" "}
                <Link
                  to="/about"
                  className="text-teal-400 hover:text-teal-300 transition-colors"
                >
                  about page
                </Link>
              </p>
            </div>
          </div>
        </div>
      </DefaultLayout>
    </>
  );
}

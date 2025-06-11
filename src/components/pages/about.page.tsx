import { siteConfig } from "../../config/site.ts";
import { MetaTags } from "../atoms/metatags.comp.tsx";
import { DefaultLayout } from "../layouts/default.layout.tsx";

export default function AboutPage() {
  return (
    <>
      <MetaTags
        title={siteConfig.meta.about.title}
        desc={siteConfig.meta.about.desc}
        bots={siteConfig.meta.about.bots}
        keywords={siteConfig.meta.about.keywords}
      />{" "}
      <DefaultLayout>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              About Canban
            </h1>
            <p className="text-xl text-zinc-300 leading-relaxed max-w-2xl mx-auto">
              Canban is a modern Kanban board application designed to help you
              manage your tasks efficiently. Built with React, TypeScript, and
              modern web technologies.
            </p>
          </div>

          <div className="mb-16">
            <h2 className="text-3xl font-bold text-white text-center mb-8">
              Meet Our Team
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
              <div className="bg-zinc-800 rounded-lg p-6 text-center hover:bg-zinc-700 transition-colors">
                <div className="mb-4">
                  <img
                    src="https://avatars.githubusercontent.com/u/55494133?v=4"
                    alt="Kai's Avatar"
                    className="w-24 h-24 md:w-32 md:h-32 rounded-full mx-auto border-4 border-teal-500 hover:border-teal-400 transition-colors"
                  />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Kai</h3>
                <p className="text-zinc-400 mb-4">Developer</p>
                <a
                  href="https://github.com/2701kai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-teal-400 hover:text-teal-300 transition-colors"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  GitHub Profile
                </a>
              </div>

              <div className="bg-zinc-800 rounded-lg p-6 text-center hover:bg-zinc-700 transition-colors">
                <div className="mb-4">
                  <img
                    src="https://avatars.githubusercontent.com/u/22892326?v=4"
                    alt="Payermann's Avatar"
                    className="w-24 h-24 md:w-32 md:h-32 rounded-full mx-auto border-4 border-teal-500 hover:border-teal-400 transition-colors"
                  />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Payermann
                </h3>
                <p className="text-zinc-400 mb-4">Developer</p>
                <a
                  href="https://github.com/payermann"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-teal-400 hover:text-teal-300 transition-colors"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  GitHub Profile
                </a>
              </div>
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              Technologies Used
            </h2>
            <div className="flex flex-wrap justify-center gap-3">
              <span className="bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full text-sm">
                React
              </span>
              <span className="bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full text-sm">
                TypeScript
              </span>
              <span className="bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full text-sm">
                Vite
              </span>
              <span className="bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full text-sm">
                Tailwind CSS
              </span>
              <span className="bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full text-sm">
                shadcn/ui
              </span>
              <span className="bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full text-sm">
                Clerk Auth
              </span>
            </div>
          </div>
        </div>
      </DefaultLayout>
    </>
  );
}

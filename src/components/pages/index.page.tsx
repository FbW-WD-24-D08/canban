import { siteConfig } from "../../config/site.ts";
import { MetaTags } from "../atoms/metatags.comp.tsx";
import { DefaultLayout } from "../layouts/default.layout.tsx";

export default function IndexPage() {
  return (
    <>
      <MetaTags
        title={siteConfig.meta.index.title}
        desc={siteConfig.meta.index.desc}
        bots={siteConfig.meta.index.bots}
        keywords={siteConfig.meta.index.keywords}
      />
      <DefaultLayout withHero>
        <main>
          <section className="py-16 bg-zinc-950">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Organize Your Work Efficiently
                </h2>
                <p className="text-xl text-zinc-300 max-w-2xl mx-auto">
                  Experience the power of visual task management with our modern
                  Kanban board
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800">
                  <img
                    src="https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=500&h=300&fit=crop&auto=format"
                    alt="Kanban board with sticky notes"
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Visual Organization
                    </h3>
                    <p className="text-zinc-400">
                      Organize tasks with intuitive drag-and-drop functionality
                    </p>
                  </div>
                </div>

                <div className="bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800">
                  <img
                    src="https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=500&h=300&fit=crop&auto=format"
                    alt="Team collaboration board"
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Team Collaboration
                    </h3>
                    <p className="text-zinc-400">
                      Work together seamlessly with real-time updates
                    </p>
                  </div>
                </div>

                <div className="bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800">
                  <img
                    src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=500&h=300&fit=crop&auto=format"
                    alt="Project management workflow"
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Workflow Management
                    </h3>
                    <p className="text-zinc-400">
                      Track progress from idea to completion
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </DefaultLayout>
    </>
  );
}

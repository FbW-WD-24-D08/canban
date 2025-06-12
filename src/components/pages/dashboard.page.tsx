import { siteConfig } from "../../config/site.ts";
import { MetaTags } from "../atoms/metatags.comp.tsx";
import { DefaultLayout } from "../layouts/default.layout.tsx";
import { useUserContext } from "../contexts/user.context.tsx";

export default function DashboardPage() {
  const { currentUser } = useUserContext();
  const userName = currentUser?.name || "User";

  return (
    <>
      <MetaTags
        title={siteConfig.meta.dashboard.title}
        desc={siteConfig.meta.dashboard.desc}
        bots={siteConfig.meta.dashboard.bots}
        keywords={siteConfig.meta.dashboard.keywords}
      />
      <DefaultLayout>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 text-center">
            Dashboard
          </h1>
          <p className="text-xl text-zinc-300 leading-relaxed max-w-2xl mx-auto">
            Welcome to your dashboard {userName}! Here you can manage your
            tasks, view analytics, and customize your settings.
          </p>
        </div>
      </DefaultLayout>
    </>
  );
}

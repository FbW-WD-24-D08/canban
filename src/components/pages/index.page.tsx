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
          <h1>Welcome to the site</h1>
          <p>Main content goes here</p>
        </main>
      </DefaultLayout>
    </>
  );
}

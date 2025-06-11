interface MetaTagsProps {
  title?: string;
  desc?: string;
  bots?: boolean;
  keywords?: string;
}

export function MetaTags({ title, desc, bots, keywords }: MetaTagsProps) {
  const withBoths = bots ? "index, follow" : "noindex, nofollow";

  return (
    <>
      <title>{title}</title>
      <meta property="og:title" content={title || "canban"} />
      <meta name="description" content={desc || "canban"} />
      <meta property="og:description" content={desc || "canban"} />
      <meta name="robots" content={withBoths || false}></meta>
      <meta name="googlebot" content={withBoths || false}></meta>
      <meta name="keywords" content={keywords || "canban"}></meta>
    </>
  );
}

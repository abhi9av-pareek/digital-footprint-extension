import {
  WEBSITE_DATABASE,
  type WebsiteInfo,
} from "./websites";

export function classifyWebsite(domain: string): WebsiteInfo {
  return (
    WEBSITE_DATABASE[domain] ?? {
      name: domain,
      category: "other",
    }
  );
}

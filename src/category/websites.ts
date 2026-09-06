import type { WebsiteCategory } from "./types";

export interface WebsiteInfo {
  name: string;
  category: WebsiteCategory;
}

export const WEBSITE_DATABASE: Record<string, WebsiteInfo> = {
  "github.com": {
    name: "GitHub",
    category: "technology",
  },

  "stackoverflow.com": {
    name: "Stack Overflow",
    category: "technology",
  },

  "wikipedia.org": {
    name: "Wikipedia",
    category: "education",
  },

  "coursera.org": {
    name: "Coursera",
    category: "education",
  },

  "leetcode.com": {
    name: "LeetCode",
    category: "education",
  },

  "espn.com": {
    name: "ESPN",
    category: "sports",
  },

  "cricbuzz.com": {
    name: "Cricbuzz",
    category: "sports",
  },

  "instagram.com": {
    name: "Instagram",
    category: "social",
  },

  "facebook.com": {
    name: "Facebook",
    category: "social",
  },

  "reddit.com": {
    name: "Reddit",
    category: "social",
  },

  "youtube.com": {
    name: "YouTube",
    category: "entertainment",
  },

  "netflix.com": {
    name: "Netflix",
    category: "entertainment",
  },

  "amazon.com": {
    name: "Amazon",
    category: "shopping",
  },

  "flipkart.com": {
    name: "Flipkart",
    category: "shopping",
  },

  "cnn.com": {
    name: "CNN",
    category: "news",
  },

  "bbc.com": {
    name: "BBC",
    category: "news",
  },

  "linkedin.com": {
    name: "LinkedIn",
    category: "business",
  },

  "zerodha.com": {
    name: "Zerodha",
    category: "finance",
  },

  "steampowered.com": {
    name: "Steam",
    category: "gaming",
  },
};

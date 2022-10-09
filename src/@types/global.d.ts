import { View } from "./types";

export {};

declare global {
  interface Window {
    PROJECTS: Array<{
      title: string;
      category: string;
      demo: string;
      source: string;
      path: string;
    }>;
    ASSETS: { [name: string]: string };
    FONTS: { [name: string]: { map: string; data: any } };
    VIEW: View;
  }
}

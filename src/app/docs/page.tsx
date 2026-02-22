import fs from "fs";
import path from "path";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { DocsClient, DocSection } from "./DocsClient";

export const metadata = {
  title: "HIVE402 - Developer Documentation",
  description:
    "Documentation for the Hive-402 Decentralized Intelligence Protocol",
};

export default async function DocsPage() {
  const readmePath = path.join(
    process.cwd(),
    "packages",
    "hive-sdk",
    "README.md",
  );
  let content = "";
  try {
    content = await fs.promises.readFile(readmePath, "utf8");
    // Strip out the badges from the top of the README for a cleaner doc page
    content = content.replace(/\[\!\[.*?\]\(.*?\)\]\(.*?\)\n?/g, "");
  } catch (e) {
    content =
      "# Error\nCould not load documentation. Make sure the SDK README exists.";
  }

  // Split content by "## " (which denotes major sections)
  // Ensure we don't split accidentally by using multiline flag start of line
  const parts = content.split(/^## /m);

  const sections: DocSection[] = [];

  // The first part is the overview (everything before the first ##)
  if (parts.length > 0 && parts[0].trim().length > 0) {
    sections.push({
      id: "overview",
      title: "Overview",
      category: "Getting Started",
      content: parts[0],
    });
  }

  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    const lines = part.split("\n");
    const title = lines[0].trim();
    const id = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    // Determine category based on title
    let category = "Guides";
    if (
      ["installation", "quick start", "core concepts"].includes(
        title.toLowerCase(),
      )
    ) {
      category = "Getting Started";
    } else if (title.toLowerCase().includes("api")) {
      category = "API Reference";
    }

    // Restore the "## " prefix because we split by it
    const sectionContent = "## " + part;

    // Skip "Table of Contents" because we have a dynamic sidebar now
    if (title.toLowerCase() !== "table of contents") {
      sections.push({
        id,
        title,
        category,
        content: sectionContent,
      });
    }
  }

  return (
    <div className="min-h-screen bg-obsidian text-slate-300 selection:bg-gold/30 flex flex-col">
      <Navbar />
      <DocsClient sections={sections} />
      <Footer />
    </div>
  );
}

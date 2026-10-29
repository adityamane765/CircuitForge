import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { DeveloperHeader } from "@/components/Developers/DeveloperHeader";
import { EditorMap } from "@/components/Developers/EditorMap";
import { HeroProductFlow } from "@/components/Developers/HeroProductFlow";
import DeveloperPage from "@/app/developers/page";
import LandingPage from "@/components/Landing/LandingPage";

import {
  blockCategories,
  capabilityGroups,
  exampleSteps,
  guideSections,
  limitations,
  troubleshootingItems,
  workflows,
} from "./developerGuide";

describe("developer guide content contract", () => {
  it("provides unique anchors for the full user journey", () => {
    const ids = guideSections.map((section) => section.id);

    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toEqual([
      "overview",
      "quickstart",
      "features",
      "workflows",
      "example",
      "blocks",
      "troubleshooting",
      "limitations",
    ]);
  });

  it("covers the editor without turning one template into the product", () => {
    expect(capabilityGroups.map((group) => group.title)).toEqual([
      "Build",
      "Inspect",
      "Test",
      "Save and export",
      "Deploy",
      "Review and share",
    ]);
    expect(workflows.map((workflow) => workflow.id)).toEqual([
      "build",
      "test",
      "export",
      "deploy",
      "save",
      "share",
    ]);
    expect(exampleSteps).toHaveLength(4);
    expect(exampleSteps[0].title).toBe("Load the template");
    expect(exampleSteps[1].body).toContain("set secret to 42");
    expect(capabilityGroups.at(-1)?.items.join(" ")).toContain("Claude, ChatGPT, or Gemini");
    expect(workflows.find((workflow) => workflow.id === "share")?.steps.join(" ")).toContain("Name the circuit");
  });

  it("matches the implemented 19-block toolbox", () => {
    expect(blockCategories.map((category) => category.blocks.length)).toEqual([3, 5, 2, 4, 4, 1]);
    expect(blockCategories.flatMap((category) => category.blocks)).toHaveLength(19);
  });

  it("covers each actionable failure class", () => {
    const categories = troubleshootingItems.map((item) => item.category);

    expect(categories).toEqual(
      expect.arrayContaining([
        "validation",
        "disabled-test",
        "hash-mismatch",
        "compiler",
        "declaration",
        "wallet",
        "network-funds",
        "deployment",
        "browser-storage",
      ]),
    );
  });

  it("states the product boundaries developers need before deployment", () => {
    const ids = limitations.map((item) => item.id);

    expect(ids).toEqual(
      expect.arrayContaining([
        "testnet",
        "hosted-compiler",
        "gas-estimate",
        "ai-review",
        "browser-local",
        "private-input-placeholder",
        "public-output-comment",
      ]),
    );
  });
});

describe("developer guide presentation contracts", () => {
  it("renders semantic navigation with editor and section destinations", () => {
    const html = renderToStaticMarkup(createElement(DeveloperHeader, { sections: guideSections }));

    expect(html).toContain("<nav");
    expect(html).toContain('href="/developers#overview"');
    expect(html).toContain('href="/editor"');
    expect(html).toContain("Open editor");
    expect(html).toContain('aria-label="Developer guide sections"');
    expect(html).toContain("lg:hidden");
  });

  it("labels the editor map for assistive technology", () => {
    const html = renderToStaticMarkup(createElement(EditorMap));

    expect(html).toContain('role="img"');
    expect(html).toContain('aria-label="CircuitForge editor layout"');
    expect(html).toContain("Block toolbox");
    expect(html).toContain("Live Cairo");
    expect(html).toContain("Test");
    expect(html).toContain("Graph");
  });

  it("summarizes the full product flow in the hero illustration", () => {
    const html = renderToStaticMarkup(createElement(HeroProductFlow));

    expect(html).toContain('role="img"');
    expect(html).toContain('aria-label="CircuitForge product flow"');
    expect(html).toContain("Build visually");
    expect(html).toContain("Typed graph");
    expect(html).toContain("Live Cairo");
    expect(html).toContain("PASS");
    expect(html).toContain("Scarb");
    expect(html).toContain("Sepolia");
  });

});

describe("developer page journey", () => {
  it("gets a new developer to a portable result before the deep reference", () => {
    const html = renderToStaticMarkup(createElement(DeveloperPage));
    const visibleText = html.replace(/<[^>]+>/g, "");

    expect(visibleText).toContain("Build and test a circuit");
    expect(visibleText).toContain("Choose a starting point");
    expect(visibleText).toContain("empty canvas");
    expect(visibleText).toContain("IPFS circuit by CID");
    expect(visibleText).toContain("Continue with the circuit");
    expect(visibleText).toContain("Where each step runs");
    expect(visibleText).toContain("In your browser");
    expect(visibleText).toContain("Hosted service");
    expect(visibleText).toContain("Your Starknet wallet");
    expect(html.indexOf('id="quickstart"')).toBeLessThan(html.indexOf('id="blocks"'));
  });

  it("shows the template range before teaching one example", () => {
    const html = renderToStaticMarkup(createElement(DeveloperPage));
    const visibleText = html.replace(/<[^>]+>/g, "");

    for (const template of ["Age Verification", "Arithmetic Proof", "Hash Preimage", "Merkle Proof"]) {
      expect(visibleText).toContain(template);
    }
    expect(html.indexOf("Built-in templates")).toBeLessThan(html.indexOf('id="example"'));
  });

  it("renders the complete product guide before the small example", () => {
    const html = renderToStaticMarkup(createElement(DeveloperPage));
    const visibleText = html.replace(/<[^>]+>/g, "");

    expect(visibleText).toContain("CircuitForge developer guide");
    expect(html).toContain('href="#features"');
    expect(visibleText).toContain("Build Cairo circuits from typed blocks, test their constraints, then export or deploy the generated code.");
    expect(visibleText).toContain("What the editor does");
    expect(visibleText).toContain("Use each part of the editor");
    expect(visibleText).toContain("Hash Preimage");
    expect(html.indexOf('id="features"')).toBeLessThan(html.indexOf('id="example"'));
    expect(visibleText).toContain("Open Deploy");
    expect(visibleText).toContain("connect a Starknet wallet");
    expect(visibleText).toContain("Start Deployment");
    expect(visibleText).toContain("Publish to IPFS");
  });

  it("renders every declared section anchor and keeps failure guidance distinct", () => {
    const html = renderToStaticMarkup(createElement(DeveloperPage));

    for (const section of guideSections) {
      expect(html).toContain(`id="${section.id}"`);
    }
    expect(html).toContain("Hash Preimage returns FAIL");
    expect(html).toContain("Compilation fails or times out");
    expect(html).toContain("Declaration fails");
    expect(html).toContain("Declare succeeds but deploy fails");
    expect(html).toContain("Generated contracts currently emit private inputs as zero placeholders");
    expect(html).toContain("Public Output blocks are currently emitted as comments");
  });
});

describe("public landing navigation", () => {
  it("links developers into the guide and shows the implemented block count", () => {
    const html = renderToStaticMarkup(createElement(LandingPage));

    expect(html).toContain('href="/developers"');
    expect(html).toContain("Developers");
    expect(html).toContain("19 block types");
    expect(html).not.toContain("16 block types");
    expect(html).toContain("landing-mobile-label");
    expect(html).toContain(">Docs<");
    expect(html).toContain(">Editor<");
  });
});

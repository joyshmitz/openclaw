import { beforeEach, describe, expect, it } from "vitest";
import type { OpenClawConfig } from "../config/config.js";
import {
  buildAllPluginInspectReports,
  buildPluginInspectReport,
  buildPluginStatusReport,
  loadConfig,
  resetPluginsCliTestState,
  runPluginsCommand,
  runtimeErrors,
  runtimeLogs,
} from "./plugins-cli-test-helpers.js";

describe("plugins cli inspect", () => {
  beforeEach(() => {
    resetPluginsCliTestState();
  });

  it("scopes single-plugin inspect without prebuilding the full status report", async () => {
    const config = {
      plugins: {
        installs: {
          "lossless-claw": {
            source: "npm",
            spec: "@martian-engineering/lossless-claw@0.5.1",
          },
        },
      },
    } as OpenClawConfig;
    const inspect = {
      plugin: {
        id: "lossless-claw",
        name: "Lossless Claw",
        status: "loaded",
        format: "openclaw",
        source: "/tmp/lossless-claw",
        origin: "installed",
      },
      shape: "plain-capability",
      capabilityMode: "single",
      usesLegacyBeforeAgentStart: false,
      bundleCapabilities: [],
      capabilities: [{ kind: "text-inference", ids: ["lossless-claw"] }],
      typedHooks: [],
      compatibility: [],
      customHooks: [],
      tools: [],
      commands: [],
      cliCommands: [],
      services: [],
      gatewayMethods: [],
      mcpServers: [],
      lspServers: [],
      httpRouteCount: 0,
      policy: {
        allowedModels: [],
        hasAllowedModelsConfig: false,
      },
      diagnostics: [],
    };

    loadConfig.mockReturnValue(config);
    buildPluginInspectReport.mockReturnValue(inspect);

    await runPluginsCommand(["plugins", "inspect", "lossless-claw", "--json"]);

    expect(buildPluginStatusReport).not.toHaveBeenCalled();
    expect(buildAllPluginInspectReports).not.toHaveBeenCalled();
    expect(buildPluginInspectReport).toHaveBeenCalledWith({
      id: "lossless-claw",
      config,
    });
    expect(runtimeLogs.at(-1)).toContain('"lossless-claw"');
  });

  it("still builds the full report for inspect --all", async () => {
    const config = {} as OpenClawConfig;
    loadConfig.mockReturnValue(config);
    buildPluginStatusReport.mockReturnValue({
      plugins: [],
      diagnostics: [],
    });
    buildAllPluginInspectReports.mockReturnValue([]);

    await runPluginsCommand(["plugins", "inspect", "--all", "--json"]);

    expect(buildPluginStatusReport).toHaveBeenCalledWith({ config });
    expect(buildAllPluginInspectReports).toHaveBeenCalledWith({
      config,
      report: {
        plugins: [],
        diagnostics: [],
      },
    });
  });

  it("rejects mixing a plugin id with inspect --all", async () => {
    await expect(
      runPluginsCommand(["plugins", "inspect", "lossless-claw", "--all"]),
    ).rejects.toThrow("__exit__:1");

    expect(runtimeErrors.at(-1)).toContain("Pass either a plugin id or --all, not both.");
  });
});

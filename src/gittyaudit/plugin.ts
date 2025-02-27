import type { Plugin } from "@elizaos/core";
import GitAudit from "./actions/analyse-repo.ts";

const gittyAuditPlugin: Plugin = {
  name: "gittyAudit",
  description: "GittyAudit Plugin for Eliza",
  actions: [GitAudit],
  evaluators: [],
  providers: [],
};

export default gittyAuditPlugin;

// ============================================================================
// @hive402/sdk — Public API
// The Decentralized Intelligence Protocol on Stacks
// ============================================================================

// Core client
export { Hive402Client, Hive402PaymentRequiredError } from "./client";

// High-level helpers
export { equipHiveSkill, publishHiveSkill } from "./blueprint";

// Types (re-export all for consumers)
export type {
  Hive402Config,
  IngestOptions,
  IngestResponse,
  PublishOptions,
  PublishResponse,
  AuthCredentials,
  ContractInfo,
  PaymentArgs,
  AgentWallet,
  SkillListing,
  SearchOptions,
  BrowseOptions,
} from "./types";

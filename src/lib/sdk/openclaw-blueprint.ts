import { Hive402Client } from "./index";

export async function equipHiveSkill(
  agentWallet: {
    address: string;
    publicKey: string;
    sign: (msg: string) => Promise<string>;
  },
  skillId: string,
) {
  const client = new Hive402Client();
  const challenge = `Hive-402 Ingestion Request: ${skillId}`;

  // 1. Agent signs the request
  const signature = await agentWallet.sign(challenge);

  // 2. Ingest intelligence
  const intelligence = await client.ingest({
    skillId,
    agentAddress: agentWallet.address,
    publicKey: agentWallet.publicKey,
    signature: signature,
    challenge,
  });

  console.log(`[Hive-402] Intelligence Synced: ${intelligence.title}`);
  return intelligence;
}

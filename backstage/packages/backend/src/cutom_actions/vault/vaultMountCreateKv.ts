import { createTemplateAction } from "@backstage/plugin-scaffolder-node"
import { VaultBase, VaultMount } from "./handler/types";
import { createMountKv } from "./handler/VaultSecrets";
export function vaultMountCreateKv(base: VaultBase) {
  return createTemplateAction<VaultMount>({
    id: "vault:mount:createKv",
    description: "An action to create vault secrets",
    schema: vaultMountCreateKvSchema(),
    async handler (ctx){
      const mount = ctx.input
      createMountKv(base,mount)
    }
  })
}
function vaultMountCreateKvSchema() {
  return {
    input: {
      type: 'object',
      required: ['mount'],
      properties: {
        mount: {
          title: 'mount',
          description: 'mount location for kv',
          type: 'string',
        }
      }
    }
  }
}
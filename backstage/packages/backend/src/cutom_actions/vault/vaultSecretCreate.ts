import { ActionContext, createTemplateAction } from "@backstage/plugin-scaffolder-node"
import { VaultBase, VaultSecret } from "./handler/types";
import { createSecret } from "./handler/VaultSecrets";
export function vaultSecretCreate(base: VaultBase) {
  return createTemplateAction<VaultSecret>({
    id: "vault:secret:create",
    description: "An action to create vault secrets",
    schema: vaultSecretCreateSchema(),
    async handler (ctx){
      const secret = ctx.input
      createSecret(base,secret)
    }
  })
}
function vaultSecretCreateSchema() {
  return {
    input: {
      type: 'object',
      required: ['mount', 'name'],
      properties: {
        mount: {
          title: 'mount',
          description: 'mount location for secret',
          type: 'string',
        },
        name: {
          title: 'name',
          description: 'name of the secret',
          type: 'string',
        },
        secrets: {
          title: 'secrets',
          description: 'map of secrets to create',
          type: 'Map<string,string>',
        }
      }
    }
  }
}
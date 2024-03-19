import { createTemplateAction } from "@backstage/plugin-scaffolder-node"
import { VaultBase, VaultSecret } from "./handler/types";
import { getSecret } from "./handler/VaultSecrets";
export function vaultSecretGet(base: VaultBase) {
  return createTemplateAction<VaultSecret>({
    id: "vault:secret:get",
    description: "An action to get vault secrets",
    schema: vaultSecretGetSchema(),
    async handler (ctx){
      let secret = ctx.input
      secret = await getSecret(base,secret)

      ctx.output('secrets',secret.secrets)
    }
  })
}
function vaultSecretGetSchema() {
  return {
    input: {
      type: 'object',
      required: ['mount', 'name'],
      properties: {
        token: {
          title: 'token',
          description: 'token used to connect to vault',
          type: 'string',
        },
        mount: {
          title: 'mount',
          description: 'mount location for secret',
          type: 'string',
        },
        name: {
          title: 'name',
          description: 'name of the secret',
          type: 'string',
        }
      }
    },
    output: {
        type: 'object',
        properties:{
          secrets: {
            title: 'secrets',
            description: 'map of secrets',
            type: 'map<string,string>'
          }
        }
    }
  }
}
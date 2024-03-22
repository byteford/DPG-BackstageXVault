import { createTemplateAction } from "@backstage/plugin-scaffolder-node"
import { VaultAws, VaultBase } from "./handler/types";
import { awsLogin } from "./handler/VaultAWSAuth";
export function vaultTokenCreate(base: VaultBase) {
  return createTemplateAction<VaultAws>({
    id: "vault:token:create",
    description: "Creates a vault token",
    schema: vaultTokenCreateSchema(),
    async handler (ctx){
      const aws = ctx.input
      const res = await awsLogin(base,aws)
      ctx.output('token',res.auth.client_token)
    }
  })
}
function vaultTokenCreateSchema() {
  return {
    input: {
      type: 'object',
      required: ['mount', 'role'],
      properties: {
        mount: {
          title: 'mount',
          description: 'mount location for auth mount',
          type: 'string',
        },
        role: {
          title: 'role',
          description: 'role to auth against',
          type: 'string',
        }
      }
    },
    output: {
        type: 'object',
        properties:{
          token: {
            title: 'token',
            description: 'vault token',
            type: 'string'
          }
        }
    }
  }
}
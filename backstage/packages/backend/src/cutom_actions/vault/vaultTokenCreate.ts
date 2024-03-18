import { createTemplateAction } from "@backstage/plugin-scaffolder-node"
import { VaultAws, VaultBase, VaultUserpass } from "./handler/types";
import { awsLogin, createUserpassUser } from "./handler/VaultAuth";
export function vaultUserpassCreateUser(base: VaultBase) {
  return createTemplateAction<VaultAws>({
    id: "vault:token:create",
    description: "Creates a vault token",
    schema: vaultUserpassCreateUserSchema(),
    async handler (ctx){
      const aws = ctx.input
      const res = await awsLogin(base,aws)
      ctx.output('token',res.auth.client_token)
    }
  })
}
function vaultUserpassCreateUserSchema() {
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
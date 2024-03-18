import { createTemplateAction } from "@backstage/plugin-scaffolder-node"
import { VaultBase, VaultUserpass } from "./handler/types";
import { createUserpassUser } from "./handler/VaultAuth";
export function vaultUserpassCreateUser(base: VaultBase) {
  return createTemplateAction<VaultUserpass>({
    id: "vault:userpass:createUser",
    description: "An action to create a userpass user",
    schema: vaultUserpassCreateUserSchema(),
    async handler (ctx){
      const user = ctx.input
      createUserpassUser(base,user)
    }
  })
}
function vaultUserpassCreateUserSchema() {
  return {
    input: {
      type: 'object',
      required: ['mount', 'username'],
      properties: {
        mount: {
          title: 'mount',
          description: 'mount location for userpass',
          type: 'string',
        },
        username: {
          title: 'username',
          description: 'username of the user',
          type: 'string',
        },
        password: {
          title: 'password',
          description: 'the users password',
          type: 'string',
        },
        policies: {
          title: 'policies',
          description: 'the policies for the users token',
          type: 'list(string)',
        }
      }
    }
  }
}
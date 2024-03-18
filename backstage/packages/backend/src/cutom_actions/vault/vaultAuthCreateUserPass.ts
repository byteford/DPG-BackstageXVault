import { ActionContext, createTemplateAction } from "@backstage/plugin-scaffolder-node"
import { VaultAuth, VaultBase, VaultSecret } from "./handler/types";
import { createAuthUserpass } from "./handler/VaultAuth";
export function vaultAuthCreateUserPass(base: VaultBase) {
  return createTemplateAction<VaultAuth>({
    id: "vault:auth:createUserPass",
    description: "An action to create a userpass auth mount",
    schema: vaultAuthCreateUserPassSchema(),
    async handler (ctx){
      const auth = ctx.input
      createAuthUserpass(base,auth)
    }
  })
}
function vaultAuthCreateUserPassSchema() {
  return {
    input: {
      type: 'object',
      required: ['mount', 'listing_visibility'],
      properties: {
        mount: {
          title: 'mount',
          description: 'mount location for auth mount',
          type: 'string',
        },
        listing_visibility: {
          title: 'listing_visibility',
          description: 'listing_visibility of the auth mount',
          type: '"unauth" | "hidden"',
        },
      }
    }
  }
}
import { VaultAuth, VaultBase, VaultUserpass } from "./types"
import { makeRequest } from "./VaultUtils"

export async function createAuthUserpass(base: VaultBase, auth: VaultAuth) {
  const res = makeRequest(
    {
      base: base,
      method: "POST",
      endpoint: `/sys/auth/${auth.mount}`,
      body: {
        type: "userpass",
        config: {
          listing_visibility: auth.listing_visibility ?? "hidden"
        }
      }
    }
  )

  return await res
}

export async function createUserpassUser(base: VaultBase, userpass: VaultUserpass) {
  const res = makeRequest(
    {
      base: base,
      method: "POST",
      endpoint: `/auth/${userpass.mount}/users/${userpass.username}`,
      body: {
        password: userpass.password ?? "password",
        token_policies: userpass.policies
      }
    }
  )

  return await res
}
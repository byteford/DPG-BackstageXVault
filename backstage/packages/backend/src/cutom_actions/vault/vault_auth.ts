import { vault_auth, vault_base, vault_userpass } from "./types"
import { make_request } from "./vault_utils"

export async function create_auth_userpass(base: vault_base, auth: vault_auth) {
  const res = make_request(
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

export async function create_userpass_user(base: vault_base, userpass: vault_userpass) {
  const res = make_request(
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
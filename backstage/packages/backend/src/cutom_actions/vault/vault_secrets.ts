import { vault_base, vault_secret } from "./types"
import { make_request } from "./vault_utils"



export async function create_mount_kv(base: vault_base, mount_name: string) {
  const res = make_request(
    {
      base: base,
      method: "POST",
      endpoint: `/sys/mounts/${mount_name}`,
      body: {
        type: "kv"
      }
    }
  )

  return await res
}

export async function create_secret(base: vault_base, secret: vault_secret) {
  const res = make_request(
    {
      base: base,
      method: "POST",
      endpoint: `/${secret.mount}/${secret.name}`,
      body: secret.secrets
    }
  )

  return await res
}

export async function get_secret(base: vault_base, secret: vault_secret) {
  const res = make_request(
    {
      base: base,
      method: "GET",
      endpoint: `/${secret.mount}/${secret.name}`
    }
  )
  const resp = await res
    if (resp.status === 200){
      secret.secrets =  (await resp.json()).data
    }else{
      throw new Error(`error getting: ${secret.mount}/${secret.name}\nreponse test: ${resp.statusText}`);
    }
  return secret
}
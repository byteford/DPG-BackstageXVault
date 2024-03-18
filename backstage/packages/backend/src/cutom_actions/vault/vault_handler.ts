import { vault_base, vault_request, vault_secret } from "./types"

export async function make_request(req: vault_request) {
  const options = {
    method: req.method,
    headers: {
      "X-Vault-Token": req.base.token
    },
    body: JSON.stringify(req.body)
  }
  console.log(`calling: ${req.base.url + req.endpoint}`)
  const res = fetch(req.base.url + req.endpoint, options)
  return await res
}

export async function create_mount(base: vault_base, mount_name: string) {
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
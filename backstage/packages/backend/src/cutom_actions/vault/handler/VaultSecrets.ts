import { VaultBase, VaultMount, VaultSecret } from "./types"
import { makeRequest } from "./VaultUtils"



export async function createMountKv(base: VaultBase, mount: VaultMount) {
  const res = makeRequest(
    {
      base: base,
      method: "POST",
      endpoint: `/sys/mounts/${mount.mount}`,
      body: {
        type: "kv"
      }
    }
  )

  return await res
}

export async function createSecret(base: VaultBase, secret: VaultSecret) {
  const res = makeRequest(
    {
      base: base,
      method: "POST",
      endpoint: `/${secret.mount}/${secret.name}`,
      body: secret.secrets
    }
  )

  return await res
}

export async function getSecret(base: VaultBase, secret: VaultSecret) {
  const res = makeRequest(
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
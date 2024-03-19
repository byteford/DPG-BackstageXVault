import { VaultBase, VaultMount, VaultSecret } from "./types"
import { makeRequest } from "./VaultUtils"



export async function createMountKv(base: VaultBase, mount: VaultMount) {
  if (mount.token){
    base.token = mount.token
  }
  let res = makeRequest(
    {
      base: base,
      method: "POST",
      endpoint: `/sys/mounts/${mount.mount}`,
      body: {
        type: "kv"
      }
    }
  )
  let created = false
  do {
    res = makeRequest(
      {
        base: base,
        method: "GET",
        endpoint: `/sys/mounts`,
      }
    )
    const resp = await res
    const body = await resp.json()
    if (Array.from(Object.keys(body.data)).includes(`${mount.mount}/`)) {
      created = true
    }
  } while (!created)
  return await res
}

export async function createSecret(base: VaultBase, secret: VaultSecret) {
  if (secret.token){
    base.token = secret.token
  }
  let created = false
  let resp
  do {
    const res = makeRequest(
      {
        base: base,
        method: "POST",
        endpoint: `/${secret.mount}/${secret.name}`,
        body: secret.secrets
      }
    )
    const resp = await res
    if (resp.status === 204) {
      created = true
    } else {
      //throw new Error(`${resp.status}: error creating: ${secret.mount}/${secret.name}\nreponse text: ${resp.statusText}`);
    }
  } while (!created)

  return await resp
}

export async function getSecret(base: VaultBase, secret: VaultSecret) {
  if (secret.token){
    base.token = secret.token
  }
  let resived = true
  do{
  const res = makeRequest(
    {
      base: base,
      method: "GET",
      endpoint: `/${secret.mount}/${secret.name}`
    }
  )
  const resp = await res
  if (resp.status === 200) {
    secret.secrets = (await resp.json()).data
    resived = true
  } else {
    //throw new Error(`error getting: ${secret.mount}/${secret.name}\nreponse text: ${resp.statusText}`);
  }
}while(!resived)
  return secret
}
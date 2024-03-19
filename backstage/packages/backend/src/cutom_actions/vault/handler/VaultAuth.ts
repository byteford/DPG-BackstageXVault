import { VaultAuth, VaultAws, VaultBase, VaultUserpass } from "./types"
import { makeRequest } from "./VaultUtils"

export async function createAuthUserpass(base: VaultBase, auth: VaultAuth) {
  if (auth.token){
    base.token = auth.token
  }
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
  if (userpass.token){
    base.token = userpass.token
  }
  let created = false
  do {
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
    const resp = await res
    if (resp.status === 204) {
      created = true
    }
  } while (!created)
}

export async function awsLogin(base: VaultBase, aws: VaultAws) {
  
  const optionstoken = {
    method: "PUT",
    headers: {
      "X-aws-ec2-metadata-token-ttl-seconds": "21600"
    }
  }
  let res = fetch("http://169.254.169.254/latest/api/token", optionstoken)
  
  const optionspkcs7 = {
    method: "GET",
    headers: {
      "X-aws-ec2-metadata-token": await (await res).text()
    }
  }
  res = fetch("http://169.254.169.254/latest/dynamic/instance-identity/pkcs7", optionspkcs7)
  
  const resp = await res
  const body = await resp.text()
  
  const pkcs7  = (body.split('\n').join(''))
    const vaultRes = makeRequest(
      {
        base: base,
        method: "POST",
        endpoint: `/auth/${aws.mount}/login`,
        body: {
          "role": aws.role,
          "pkcs7": pkcs7,
          "nonce": "playground"
        }
      }
    )
    const vaultResp = await vaultRes
    return await vaultResp.json()
}
import { VaultRequest } from "./types"

export async function makeRequest(req: VaultRequest) {
  const options = {
    method: req.method,
    headers: {
      "X-Vault-Token": req.base.token
    },
    body: JSON.stringify(req.body)
  }
  const res = fetch(req.base.url + req.endpoint, options)
  return await res
}
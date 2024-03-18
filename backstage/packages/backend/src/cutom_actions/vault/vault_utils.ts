import { vault_request } from "./types"

export async function make_request(req: vault_request) {
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
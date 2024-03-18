export type vault_base = {
    url: string
    token: string
  };

export type vault_request = {
    base: vault_base
    method: "POST" | "GET"
    endpoint: string
    body?: any
}

export type vault_secret = {
  mount: string,
  name: string,
  secrets?: {}
}

export type vault_auth = {
  mount: string,
  listing_visibility?: "unauth" | "hidden"
}

export type vault_userpass = {
  mount: string,
  username: string,
  password?: string
  policies?: [string]
}
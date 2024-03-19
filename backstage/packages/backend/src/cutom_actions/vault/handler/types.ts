export type VaultBase = {
    url: string
    token: string
  };

export type VaultRequest = {
    base: VaultBase
    method: "POST" | "GET"
    endpoint: string
    body?: any
}

export type VaultMount = {
  token?: string
  mount: string
}

export type VaultSecret = {
  token?: string
  mount: string,
  name: string,
  secrets?: {}
}

export type VaultAuth = {
  token?: string
  mount: string,
  listing_visibility?: "unauth" | "hidden"
}

export type VaultUserpass = {
  token?: string
  mount: string,
  username: string,
  password?: string
  policies?: [string]
}

export type VaultAws = {
  token?: string
  mount: string,
  role: string
}
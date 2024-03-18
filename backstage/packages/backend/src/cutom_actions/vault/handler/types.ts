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
  mount: string
}

export type VaultSecret = {
  mount: string,
  name: string,
  secrets?: {}
}

export type VaultAuth = {
  mount: string,
  listing_visibility?: "unauth" | "hidden"
}

export type VaultUserpass = {
  mount: string,
  username: string,
  password?: string
  policies?: [string]
}
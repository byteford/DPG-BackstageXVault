import { create_auth_userpass, create_userpass_user } from "./vault_auth";

describe("vault auth tests", () => {
  const base_url = "http://localhost:8200/v1"
  const token = "token"
  afterEach(() => {
    jest.restoreAllMocks()
  })

  test("make userpass auth", async () => {
    jest.spyOn(global, 'fetch')
      .mockImplementation(() =>
        Promise.resolve(
          {
            status: 204, json: Promise.resolve([])
          }
        ) as unknown as Promise<Response>
      )
    const res = create_auth_userpass(
      {
        url: base_url,
        token: token
      },
      {
        mount: "userauth",
        listing_visibility: "unauth"
      }
    )
    expect((await res).status).toBe(204)
  })
  test("make userpass user", async () => {
    jest.spyOn(global, 'fetch')
      .mockImplementation(() =>
        Promise.resolve(
          {
            status: 204, json: Promise.resolve([])
          }
        ) as unknown as Promise<Response>
      )
    const res = create_userpass_user(
      {
        url: base_url,
        token: token
      },
      {
        mount: "userauth",
        username: "james"
      }
    )
    console.log(await res)
    expect((await res).status).toBe(204)
  })
})
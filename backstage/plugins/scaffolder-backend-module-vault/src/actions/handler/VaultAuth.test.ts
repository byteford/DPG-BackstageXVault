import { awsLogin, createAuthUserpass, createUserpassUser } from "./VaultAuth";

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
    const res = createAuthUserpass(
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
    const res = createUserpassUser(
      {
        url: base_url,
        token: token
      },
      {
        mount: "test_mount",
        username: "james"
      }
    )
    console.log(await res)
  })

  test("login aws", async () => {
    jest.spyOn(global, 'fetch')
      .mockImplementation(() =>
        Promise.resolve(
          {
            status: 200, text: jest.fn(() =>Promise.resolve("")), json: jest.fn(() =>Promise.resolve({}))
          }
        ) as unknown as Promise<Response>
      )
    const res = awsLogin(
      {
        url: base_url,
        token: token
      },
      {
        mount: "aws",
        role: "panda"
      }
    )
    console.log(await res)
  })
})
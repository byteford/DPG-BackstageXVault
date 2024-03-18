import { create_mount_kv, create_secret, get_secret } from "./vault_secrets";

describe("vault secret tests", () => {
  const base_url = "http://localhost:8200/v1"
  const token = "token"
  afterEach(() => {
    jest.restoreAllMocks()
  })

  test("make kv mount", async () => {
    jest.spyOn(global, 'fetch')
      .mockImplementation(() =>
        Promise.resolve(
          {
            status: 204, json: Promise.resolve([])
          }
        ) as unknown as Promise<Response>
      )
    const res = create_mount_kv(
      {
        url: base_url,
        
        token: token
      },
      "playground5"
    )
    expect((await res).status).toBe(204)
  })
  test("create secret", async () => {
    jest.spyOn(global, 'fetch')
      .mockImplementation(() =>
        Promise.resolve(
          {
            status: 204, json: Promise.resolve([])
          }
        ) as unknown as Promise<Response>
      )
    const res = create_secret(
      {
        url: base_url,
        token: token
      },
      {
        mount: "playground5",
        name: "test_secret1",
        secrets: {
          "secrets": "yay",
          "foo": "bar"
        }
      }
    )
    expect((await res).status).toBe(204)
  })
  test("get secret", async () => {
    jest.spyOn(global, 'fetch')
      .mockImplementation(() =>
        Promise.resolve(
          {
            status: 200, json: jest.fn(()=> Promise.resolve({data: {"foo": "bar"}}))
          }
        ) as unknown as Promise<Response>
      )
    const secret = get_secret(
      {
        url: base_url,
        token: token
      },
      {
        mount: "playground5",
        name: "test_secret1",
      }
    )
    console.log(await secret)
    expect((await secret).secrets).toBeDefined()
  })

})



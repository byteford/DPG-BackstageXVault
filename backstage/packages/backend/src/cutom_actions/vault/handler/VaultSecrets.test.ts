import { createMountKv, createSecret, getSecret } from "./VaultSecrets";

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
    const res = createMountKv(
      {
        url: base_url,
        
        token: token
      },
      {
      mount: "playground5"
      }
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
    const res = createSecret(
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
    const secret = getSecret(
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



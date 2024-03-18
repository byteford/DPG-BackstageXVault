import { createMountKv, createSecret, getSecret } from "./VaultSecrets";

describe("vault secret tests", () => {
  const base_url = "http://localhost:8200/v1"
  const token = "test"
  afterEach(() => {
    jest.restoreAllMocks()
  })

  test("make kv mount", async () => {
    jest.spyOn(global, 'fetch')
      .mockImplementationOnce(() =>
        Promise.resolve(
          {
            status: 204, json: jest.fn(()=> Promise.resolve({data:{"playground12/": {}}}))
          }
        ) as unknown as Promise<Response>
      )
      .mockImplementation(() =>
        Promise.resolve(
          {
            status: 200, json: jest.fn(()=> Promise.resolve({data:{"playground12/": {}}}))
          }
        ) as unknown as Promise<Response>
      )
    const res = createMountKv(
      {
        url: base_url,
        
        token: token
      },
      {
      mount: "playground12"
      }
    )
    expect((await res).status).toBe(200)
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
        mount: "bsSecret",
        name: "user_test",
        secrets: {
          "password": "yay",
        }
      }
    )
    expect((await res)?? {status:500}.status).toBe(204)
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



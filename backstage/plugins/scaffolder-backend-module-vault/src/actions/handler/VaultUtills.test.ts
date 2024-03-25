import { makeRequest } from "./vaultUtils";

describe("vault util tests", () => {
  const base_url = "http://localhost:8200/v1"
  const token = "token"
  afterEach(() => {
    jest.restoreAllMocks()
  })
  test("run a request", async () => {
    jest.spyOn(global, 'fetch')
      .mockImplementation(() =>
        Promise.resolve(
          {
            status: 204, json: Promise.resolve([])
          }
        ) as unknown as Promise<Response>
      )
    const res = makeRequest(
      {
        base: {
          url: base_url,
          token: token
        },
        method: "POST",
        endpoint: "/sys/mounts/playground4",
        body: {
          type: "kv"
        }
      }
    )
    expect((await res).status).toBe(204)
  })
})



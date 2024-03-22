import { getVoidLogger } from "@backstage/backend-common";
import { PassThrough } from 'stream';
import { vaultSecretGet } from "./vaultSecretGet";

describe('vault:secret:get', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })
  const mockContext = {
    workspacePath: '',
    logger: getVoidLogger(),
    logStream: new PassThrough(),
    output: jest.fn(),
    createTemporaryDirectory: jest.fn(),
  };

  const action = vaultSecretGet(
    {
      url: "http://localhost:8200/v1",
      token: "token"
    }
  );

  it('echo the string passed', async () => {
    jest.spyOn(global, 'fetch')
      .mockImplementation(() =>
        Promise.resolve(
          {
            status: 200, json: jest.fn(()=> Promise.resolve({data: {"foo": "bar"}}))
          }
        ) as unknown as Promise<Response>
      )
    const name = "test_with_action"
    const mount = "playground5"
    await action.handler({
      ...mockContext,
      input: {
        name: name,
        mount: mount
      },
    });
    expect(mockContext.output).toHaveBeenCalledWith(
      'secrets', {
        "foo": "bar",
      }
    )
  });
});
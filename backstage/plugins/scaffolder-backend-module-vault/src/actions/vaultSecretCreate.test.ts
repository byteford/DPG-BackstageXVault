import { getVoidLogger } from "@backstage/backend-common";
import { PassThrough } from 'stream';
import { vaultSecretCreate } from "./vaultSecretCreate";

describe('vault:secret:create', () => {
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

  const action = vaultSecretCreate(
    {
      url: "http://localhost:8200/v1",
      token: "token"
    }
  );

  it('echo the string passed', async () => {
    const spy = jest.spyOn(global, 'fetch')
      .mockImplementation(() =>
        Promise.resolve(
          {
            status: 204, json: Promise.resolve([])
          }
        ) as unknown as Promise<Response>
      )
    const name = "test_with_action"
    const mount = "playground5"
    const secrets = { "name": "A Value" }
    await action.handler({
      ...mockContext,
      input: {
        name: name,
        mount: mount,
        secrets: secrets
      },
    });
    expect(spy).toHaveBeenCalled()
  });
});
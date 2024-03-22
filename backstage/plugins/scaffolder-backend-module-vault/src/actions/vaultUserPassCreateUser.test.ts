import { getVoidLogger } from "@backstage/backend-common";
import { PassThrough } from 'stream';
import { vaultUserpassCreateUser } from "./vaultUserPassCreateUser";

describe('vault:userpass:createUser', () => {
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

  const action = vaultUserpassCreateUser(
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
    const mount = "test_mount"
    const username = "testuser"
    const secrets = "password"
    await action.handler({
      ...mockContext,
      input: {
        mount: mount,
        username: username,
        password: secrets
      },
    });
    expect(spy).toHaveBeenCalled()
  });
});
import { getVoidLogger } from "@backstage/backend-common";
import { PassThrough } from 'stream';
import { vaultSecretCreate } from "./vaultSecretCreate";
import { vaultAuthCreateUserPass } from "./vaultAuthCreateUserPass";

describe('vault:auth:createUserPass', () => {
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

  const action = vaultAuthCreateUserPass(
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
    await action.handler({
      ...mockContext,
      input: {
        mount: mount,
        listing_visibility: "unauth"
      },
    });
    expect(spy).toHaveBeenCalled()
  });
});
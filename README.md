# Devops Playground Writing custom actions for vault

For this playground we are going to be writing some custom actions to control hashicorp Vault.

Currently the dev cycle in backstage can be quite slow, so we are going to be following a Test Driven Development(TDD) aproach, where we will be writing some functions and testing them as we go. For brevity I have already created the file structure as will be using. But before we go in to that there is some basic set up that needs to happen.

> On the day all directories are from `/home/playground/workdir/DPG-BackstageXVault`
And all yarn commands need to be run in the backstage base folder

0. yarn install and setup vault

Run `sh vault_init.sh` This will install yarn and run `yarn install --dev`to set up backstage and then run some vault commands to get to server inishilised and configured with a EC2 auth method that we will use later in the proccess to connect from backstage to vault.

Now that is running lets talk about some of the files we care about. There is a lot to backstage, but we only need to touch part of it for this playground.

In the `backstage` folder is where all the backstage code lives. With in that there are 4 things we care about:

- `packages`- This is where our backstage website lives, in that folder there is `app` for the frontend and `backend` we will need to make a change to some of the backend code, to let use make use of the custom acitons we are creating

- `plugin` - This is where our code will live, we use some typescript linking to import that code in to the backend when we run the app

- `template` - This folder is where our template lives we are going to use to run our actions.

- `app-config.yaml` - This is where all the setting we can change for backstage live

1. set up `app-config.yaml`

Before we forget lets make a small change to the app-config file so that when we spin up backstage we can access it from our panda url.

Open `backstage/app-config.yaml`

Replace `<panda-adj>` with the first part of your url (the bit between `http://` and `-panda`)

That is the config set up. We can now get around to makeing the playground.

2. vaultUtils

All of the actions we are creating will call the vault API, to help with this we are going to create a utility function that will handle the call.

Open `backstage/plugins/scaffolder-backend-module-vault/src/actions/handler/vaultUtils.ts`

And paste in:

``` ts
import { VaultRequest } from "./types";

export async function makeRequest(req: VaultRequest) {
  const options = {
    method: req.method,
    headers: {
      "X-Vault-Token": req.base.token
    },
    body: JSON.stringify(req.body)
  };
  const res = fetch(req.base.url + req.endpoint, options);
  return await res;
}

```

To prove this works, if we run `yarn test vaultUtills` we should see that vaultUtiles passes.

3. vaultMountCreateKV

Now we have the uitl function set up lets create some actions. The first action we are going to create is one that creates a vault KV engine so we can store our secrets.

The first step we are going to do, to do this if create a handler. Open:
`backstage/plugins/scaffolder-backend-module-vault/src/actions/handler/vaultSecrets.ts`
and paste in :

```ts
import { VaultBase, VaultMount, VaultSecret } from "./types";
import { makeRequest } from "./vaultUtils";

export async function createMountKv(base: VaultBase, mount: VaultMount) {
  if (mount.token){
    base.token = mount.token;
  }
  let res = makeRequest(
    {
      base: base,
      method: "POST",
      endpoint: `/sys/mounts/${mount.mount}`,
      body: {
        type: "kv"
      }
    }
  );
  let created = false;
  do {
    res = makeRequest(
      {
        base: base,
        method: "GET",
        endpoint: `/sys/mounts`,
      }
    );
    const resp = await res;
    const body = await resp.json();
    if (Array.from(Object.keys(body.data)).includes(`${mount.mount}/`)) {
      created = true;
    }
  } while (!created);
  return await res;
}

```

You can run `yarn test vaultSecrets` now but you will only get 1 out of 3 tests pass as end the end all of our vaultSecret test code will be in the same place.

Now we have the handler time to create the action

open: `backstage/plugins/scaffolder-backend-module-vault/src/actions/vaultMountCreateKv.ts`

And Paste in:

```ts
import { createTemplateAction } from "@backstage/plugin-scaffolder-node"
import { VaultBase, VaultMount } from "./handler/types";
import { createMountKv } from "./handler/vaultSecrets";
export function vaultMountCreateKv(base: VaultBase) {
  return createTemplateAction<VaultMount>({
    id: "vault:mount:createKv",
    description: "An action to create vault secrets",
    schema: vaultMountCreateKvSchema(),
    async handler (ctx){
      const mount = ctx.input;
      createMountKv(base,mount);
    }
  })
}
function vaultMountCreateKvSchema() {
  return {
    input: {
      type: 'object',
      required: ['mount'],
      properties: {
        mount: {
          token: {
            title: 'token',
            description: 'token used to connect to vault',
            type: 'string',
          },
          title: 'mount',
          description: 'mount location for kv',
          type: 'string',
        }
      }
    }
  }
}
```

This is our first action so lets break down this code a little bit:

- `vaultMountCreateKv` is the function that backstage will run to load in to action. The input `base: VaultBase` is passed in and normally loaded in from the `app-config.yaml` file
- `VaultMount` is the type that is send from the template file to our code.
- `vaultMountCreateKvSchema` this is the schema it needs to match `VaultMount` with names and types of vars, but it more used for docs and formatting/ validation than in our code.
- `async handler (ctx)` this is what is called when our action is triggured via the pipeline.

Now if you run `yarn test vaultMountCreateKv` it should run the test code and pass

This test code (stored `backstage/plugins/scaffolder-backend-module-vault/src/actions/vaultMountCreateKv.ts`)

calls the functions that backstage does and uses `jest.fn()` to mock functions we dont call. and `jest.spyOn` to mock the vault api call

4. vaultSecretCreate

Now we have the code to create the kv engine. Lets write the code to load in a secret in to that engine.

Lets go back to the `backstage/plugins/scaffolder-backend-module-vault/src/actions/handler/vaultSecrets.ts` file and paste in the following code at the bottem of it:

```ts
export async function createSecret(base: VaultBase, secret: VaultSecret) {
  if (secret.token){
    base.token = secret.token;
  };
  let created = false;
  let resp;
  do {
    const res = makeRequest(
      {
        base: base,
        method: "POST",
        endpoint: `/${secret.mount}/${secret.name}`,
        body: secret.secrets
      }
    );
    const resp = await res;
    if (resp.status === 204) {
      created = true;
    }
  } while (!created);

  return await resp;
}
```

After this, if we run `yarn test vaultSecrets` again, we should get 2 passing tests. (still one failing but we will fix that in the next step)

But before we get to the last secret lets put in the code for this action:
Open: `backstage/plugins/scaffolder-backend-module-vault/src/actions/vaultSecretCreate.ts` and paste in :

```ts
import { createTemplateAction } from "@backstage/plugin-scaffolder-node"
import { VaultBase, VaultSecret } from "./handler/types";
import { createSecret } from "./handler/vaultSecrets";
export function vaultSecretCreate(base: VaultBase) {
  return createTemplateAction<VaultSecret>({
    id: "vault:secret:create",
    description: "An action to create vault secrets",
    schema: vaultSecretCreateSchema(),
    async handler (ctx){
      const secret = ctx.input;
      createSecret(base,secret);
    }
  })
}
function vaultSecretCreateSchema() {
  return {
    input: {
      type: 'object',
      required: ['mount', 'name'],
      properties: {
        token: {
          title: 'token',
          description: 'token used to connect to vault',
          type: 'string',
        },
        mount: {
          title: 'mount',
          description: 'mount location for secret',
          type: 'string',
        },
        name: {
          title: 'name',
          description: 'name of the secret',
          type: 'string',
        },
        secrets: {
          title: 'secrets',
          description: 'map of secrets to create',
          type: 'Map<string,string>',
        }
      }
    }
  };
}
```

This is very similar to the last action. as all our logic is in the handeler, this is just passing the vaules on in this example.

We can run the tests to prove this works with `yarn test vaultSecretCreate`

5. vaultSecretGet

Time for the last action thaty cares about secrets:

Open `backstage/plugins/scaffolder-backend-module-vault/src/actions/handler/vaultSecrets.ts` again and paste in to follwoing at the bottom of the page:

```ts
export async function getSecret(base: VaultBase, secret: VaultSecret) {
  if (secret.token){
    base.token = secret.token;
  }
  let resived = true;
  do{
  const res = makeRequest(
    {
      base: base,
      method: "GET",
      endpoint: `/${secret.mount}/${secret.name}`
    }
  );
  const resp = await res;
  if (resp.status === 200) {
    secret.secrets = (await resp.json()).data;
    resived = true;
  }
}while(!resived)
  return secret;
}
```

Now when we run `yarn test vaultSecrets` we should get 3 passing tests

Now lets write the action, but this one is a little diffrent than the last few as we want to return the secret to the template.
Open: `backstage/plugins/scaffolder-backend-module-vault/src/actions/vaultSecretGet.ts` and paste the following:

```ts
import { createTemplateAction } from "@backstage/plugin-scaffolder-node"
import { VaultBase, VaultSecret } from "./handler/types";
import { getSecret } from "./handler/vaultSecrets";
export function vaultSecretGet(base: VaultBase) {
  return createTemplateAction<VaultSecret>({
    id: "vault:secret:get",
    description: "An action to get vault secrets",
    schema: vaultSecretGetSchema(),
    async handler (ctx){
      let secret = ctx.input;
      secret = await getSecret(base,secret);

      ctx.output('secrets',secret.secrets);
    }
  })
}
function vaultSecretGetSchema() {
  return {
    input: {
      type: 'object',
      required: ['mount', 'name'],
      properties: {
        token: {
          title: 'token',
          description: 'token used to connect to vault',
          type: 'string',
        },
        mount: {
          title: 'mount',
          description: 'mount location for secret',
          type: 'string',
        },
        name: {
          title: 'name',
          description: 'name of the secret',
          type: 'string',
        }
      }
    },
    output: {
        type: 'object',
        properties:{
          secrets: {
            title: 'secrets',
            description: 'map of secrets',
            type: 'map<string,string>'
            }
        }
    }
  };
}
```

The main diffrences is we are now calling `ctx.output()` which lets us output a value under the key of the string we pass in, in this case it is `secrets`. This is also shown in the Schema where we now have an `output` block.

Lets again run `yarn test vaultSecretGet` to prove it all works

As we are getting an output we are doing something a bit diffrent with the testing, where we are checking that the output function is called with the secret we are expecting to be output.

6. vaultAuth

We have a few more actions to write before we can get to backstage, as we now all know this lets do them all at once, open `backstage/plugins/scaffolder-backend-module-vault/src/actions/handler/vaultAuth.ts` and paste in:

```ts
import { VaultAuth, VaultAws, VaultBase, VaultUserpass } from "./types"
import { makeRequest } from "./vaultUtils"

export async function createAuthUserpass(base: VaultBase, auth: VaultAuth) {
  if (auth.token){
    base.token = auth.token;
  };
  const res = makeRequest(
    {
      base: base,
      method: "POST",
      endpoint: `/sys/auth/${auth.mount}`,
      body: {
        type: "userpass",
        config: {
          listing_visibility: auth.listing_visibility ?? "hidden"
        }
      }
    }
  );

  return await res;
}

export async function createUserpassUser(base: VaultBase, userpass: VaultUserpass) {
  if (userpass.token){
    base.token = userpass.token;
  };
  let created = false;
  do {
    const res = makeRequest(
      {
        base: base,
        method: "POST",
        endpoint: `/auth/${userpass.mount}/users/${userpass.username}`,
        body: {
          password: userpass.password ?? "password",
          token_policies: userpass.policies
        }
      }
    );
    const resp = await res;
    if (resp.status === 204) {
      created = true;
    };
  } while (!created);
}

```

Now we can run `yarn test vaultAuth.test.ts`

There is 2 actions that use that file, lets start with `backstage/plugins/scaffolder-backend-module-vault/src/actions/vaultAuthCreateUserPass.ts`

Paste in the following:

```ts
import { createTemplateAction } from "@backstage/plugin-scaffolder-node"
import { VaultAuth, VaultBase} from "./handler/types";
import { createAuthUserpass } from "./handler/vaultAuth";
export function vaultAuthCreateUserPass(base: VaultBase) {
  return createTemplateAction<VaultAuth>({
    id: "vault:auth:createUserPass",
    description: "An action to create a userpass auth mount",
    schema: vaultAuthCreateUserPassSchema(),
    async handler (ctx){
      const auth = ctx.input;
      createAuthUserpass(base,auth);
    }
  })
};
function vaultAuthCreateUserPassSchema() {
  return {
    input: {
      type: 'object',
      required: ['mount', 'listing_visibility'],
      properties: {
        token: {
          title: 'token',
          description: 'token used to connect to vault',
          type: 'string',
        },
        mount: {
          title: 'mount',
          description: 'mount location for auth mount',
          type: 'string',
        },
        listing_visibility: {
          title: 'listing_visibility',
          description: 'listing_visibility of the auth mount',
          type: '"unauth" | "hidden"',
        },
      }
    }
  };
}
```

Then open `backstage/plugins/scaffolder-backend-module-vault/src/actions/vaultUserPassCreateUser.ts` and paste in:

```ts
import { createTemplateAction } from "@backstage/plugin-scaffolder-node"
import { VaultBase, VaultUserpass } from "./handler/types";
import { createUserpassUser } from "./handler/vaultAuth";
export function vaultUserpassCreateUser(base: VaultBase) {
  return createTemplateAction<VaultUserpass>({
    id: "vault:userpass:createUser",
    description: "An action to create a userpass user",
    schema: vaultUserpassCreateUserSchema(),
    async handler (ctx){
      const user = ctx.input;
      const res = await createUserpassUser(base,user);

      ctx.logger.error(JSON.stringify(res));
    }
  });
}
function vaultUserpassCreateUserSchema() {
  return {
    input: {
      type: 'object',
      required: ['mount', 'username'],
      properties: {
        mount: {
          token: {
            title: 'token',
            description: 'token used to connect to vault',
            type: 'string',
          },
          title: 'mount',
          description: 'mount location for userpass',
          type: 'string',
        },
        username: {
          title: 'username',
          description: 'username of the user',
          type: 'string',
        },
        password: {
          title: 'password',
          description: 'the users password',
          type: 'string',
        },
        policies: {
          title: 'policies',
          description: 'the policies for the users token',
          type: 'list(string)',
        }
      }
    }
  };
}
```

Now if you run `yarn test` all the tests should pass

7. vaultTokenCreate

You might notice that we havnt touched `backstage/plugins/scaffolder-backend-module-vault/src/actions/vaultTokenCreate.ts` but everything is passing. This is because I have already dont all the work for you. The handeler code in `backstage/plugins/scaffolder-backend-module-vault/src/actions/handler/VaultAWSAuth.ts` is one of the more complicated files as it has to interacted with the EC2 box we are running on.

8. Telling backstage about our actions

We need to do one more thing before we can run backstage, which is telling it what actions we want to run, and passing though ay config to them. To do this we go to `backstage/packages/backend/src/plugins/scaffolder.ts` and there is 2 blocks on commented code, which we can uncomment.

9. backstage

Now that that is working, time to look at our template file.
Open: `backstage/template/template.yaml` as copying yaml noramlly end up with errors, This file is already populated but it is worth talking about who it works.

But before that as backstage can take a bit to start lets turn that on. To help with debugging we are going to run the frontend and backend in 2 ternimals. So open 2 wetty instances, and in one go to the `backstage` directory, and run `yarn start` and in the other go to the `backstage` directory and run `yarn start-backend`

Now lets have a look at that template.

While the top of the template looks like a Kubernetes manifest it doesnt require Kubernetes to be used.

Inside the `spec` block is where the magic happens.

- `parameters` are values that the user has to fill out when they try to use a template.
- `step` are hopefully obvious, theses are the steps backstage runs in order.
  - `id`: this is the logical id that can be used to get the output from a step
  - `action`: this has to match the `id` of the action you which to run
  - `intput`: should match the schema of the action you are running.

Hopefully by now backstage is up. and we can go to the same url as wetty or coder. but change after `.org` to `:3000` and we should see backstage

On the left click on `Create`.

Then you should see one template, click `Choose` on that.

Type in some vaules and cick `create`

After this has run you can go to vault which is again the same url as wetty or coder. but change after `.org` to `:8200`.

you should see a tab with the same name as what you put in auth, and you should be now able to log in with the username and passwork you specified.
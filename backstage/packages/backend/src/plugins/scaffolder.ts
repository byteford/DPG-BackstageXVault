import { CatalogClient } from '@backstage/catalog-client';
import { createBuiltinActions, createRouter } from '@backstage/plugin-scaffolder-backend';
import { ScmIntegrations } from '@backstage/integration';
import { Router } from 'express';
import type { PluginEnvironment } from '../types';
import { vaultAuthCreateUserPass } from '../cutom_actions/vault/vaultAuthCreateUserPass';
import { vaultMountCreateKv } from "../cutom_actions/vault/vaultMountCreateKv";
import { vaultSecretCreate } from '../cutom_actions/vault/vaultSecretCreate';
import { vaultSecretGet } from '../cutom_actions/vault/vaultSecretGet';
import { vaultUserpassCreateUser } from '../cutom_actions/vault/vaultUserPassCreateUser';
import { vaultTokenCreate } from '../cutom_actions/vault/vaultTokenCreate';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  const catalogClient = new CatalogClient({
    discoveryApi: env.discovery,
  });
  const integrations = ScmIntegrations.fromConfig(env.config);
  const builtInActions = createBuiltinActions({
    catalogClient,
    integrations,
    config: env.config,
    reader: env.reader,
  });
  const vault_config  ={url:"http://localhost:8200/v1", token:"test"}
  const actions =[
    ...builtInActions,
    vaultAuthCreateUserPass(vault_config),
    vaultMountCreateKv(vault_config),
    vaultSecretCreate(vault_config),
    vaultSecretGet(vault_config),
    vaultUserpassCreateUser(vault_config),
    vaultTokenCreate(vault_config)
  ]

  return await createRouter({
    actions,
    logger: env.logger,
    config: env.config,
    database: env.database,
    reader: env.reader,
    catalogClient,
    identity: env.identity,
    permissions: env.permissions,
  });
}


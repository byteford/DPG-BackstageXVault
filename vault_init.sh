#!/bin/bash
set -ex
npm install yarn -g

cd backstage; yarn install --dev

# variable to run vault init
vault operator init -address=http://127.0.0.1:8200 -key-shares=1 -key-threshold=1 -format=json > /home/playground/.vault_creds

# Vault Unseal
vault operator unseal -address=http://127.0.0.1:8200 $(jq -r .unseal_keys_b64[0] /home/playground/.vault_creds)

export VAULT_TOKEN=$(cat /home/playground/.vault_creds | jq -r .root_token)

curl --location 'http://localhost:8200/v1/sys/auth/aws' \
--header "X-Vault-Token: $VAULT_TOKEN" \
--header 'Content-Type: application/json' \
--data '{
  "type": "aws"
}'

curl --location 'http://localhost:8200/v1/sys/policy/admin' \
--header "X-Vault-Token: $VAULT_TOKEN" \
--header 'Content-Type: application/json' \
--data '{
  "policy": "path \"*\" {capabilities = [\"create\", \"read\", \"update\", \"delete\", \"list\", \"sudo\"]}"
}
'
curl --location 'http://localhost:8200/v1/auth/aws/role/panda' \
--header "X-Vault-Token: $VAULT_TOKEN" \
--header 'Content-Type: application/json' \
--data "{ \
  \"auth_type\": \"ec2\",\
  \"bound_ec2_instance_id\": [\"$(ec2-metadata -i | sed -s 's/instance-id: //')\"],\
  \"policies\": [\"default\", \"admin\"]
}"
curl --location 'http://localhost:8200/v1/sys/auth/aws' \
--header 'X-Vault-Token: ' \
--header 'Content-Type: application/json' \
--data '{
  "type": "aws"
}'

curl --location 'http://funny-panda.devopsplayground.org:8200/v1/sys/policy/admin' \
--header 'X-Vault-Token: ' \
--header 'Content-Type: application/json' \
--data '{
  "policy": "path \"*\" {capabilities = [\"create\", \"read\", \"update\", \"delete\", \"list\", \"sudo\"]}"
}
'

curl --location 'http://funny-panda.devopsplayground.org:8200/v1/auth/aws/role/panda' \
--header 'X-Vault-Token: ' \
--header 'Content-Type: application/json' \
--data '{
  "auth_type": "ec2",
  "bound_ec2_instance_id": ["i-0c975f0ad228f16ed"],
  "policies": ["default", "admin"],
  "disallow_reauthentication": true
}'

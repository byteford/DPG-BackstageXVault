import { VaultBase, VaultAws } from "./types";
import { makeRequest } from "./vaultUtils";

export async function awsLogin(base: VaultBase, aws: VaultAws) {
  
    const optionstoken = {
      method: "PUT",
      headers: {
        "X-aws-ec2-metadata-token-ttl-seconds": "21600"
      }
    };
    let res = fetch("http://169.254.169.254/latest/api/token", optionstoken);
    
    const optionspkcs7 = {
      method: "GET",
      headers: {
        "X-aws-ec2-metadata-token": await (await res).text()
      }
    };
    res = fetch("http://169.254.169.254/latest/dynamic/instance-identity/pkcs7", optionspkcs7);
    
    const resp = await res;
    const body = await resp.text();
    
    const pkcs7  = (body.split('\n').join(''));
      const vaultRes = makeRequest(
        {
          base: base,
          method: "POST",
          endpoint: `/auth/${aws.mount}/login`,
          body: {
            "role": aws.role,
            "pkcs7": pkcs7,
            "nonce": "playground"
          }
        }
      );
      const vaultResp = await vaultRes;
      return await vaultResp.json();
  }
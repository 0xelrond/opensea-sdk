export const BASE_URL = `https://api.golom.io/api/v1/`;
export const V2_URL = `https://api.golom.io/api/v1/`;
export const GRAPH_URL = BASE_URL.replace("api/v1/", "graphql");
export const OPENSEA_URL = `https://api.opensea.io/api/v1/`;
export const REF_ADDRESS = `0xd71b8a3ea94df47e766db98a35eba3a5195f4b98`;
export const X_API_KEY = "2f6f419a083c46de9d83ce3dbe7db601";
export const MESSAGE_V1 =
  "Hi there from Golom! Sign this message to prove you have access to this wallet and we'll log you in. This won't cost you any Ether.";
const MESSAGE_V2 = `Welcome to Golom!

Click to sign in and accept the Golom Terms of Service: https://docs.golom.io/about/terms-of-service

This request will not trigger a blockchain transaction or cost any gas fees.

Your authentication status will reset after 24 hours.`;
export const SIGN_PARAMS = (nonce) => {
  return {
    domain: {
      chainId: 1,
      name: "Golom.io",
      version: "1",
    },
    message: {
      message: MESSAGE_V2,
      nonce: Number(nonce),
    },
    primaryType: "Message",
    types: {
      EIP712Domain: [
        { name: "name", type: "string" },
        { name: "version", type: "string" },
        { name: "chainId", type: "uint256" },
      ],
      // Refer to PrimaryType
      Message: [
        { name: "nonce", type: "uint32" },
        { name: "message", type: "string" },
      ],
    },
  };
};

export const ACTIVITY_POLLING_INTERVAL = 60000; // 1 min
export const LISTING_POLLING_INTERVAL = 300000; // 5 mins
export const OFFERS_POLLING_INTERVAL = 120000; // 2 mins

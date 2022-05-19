import { ethers } from "ethers";
import ERC721 from "./abis/ERC721";
import ERC1155 from "./abis/ERC1155";
import Exchange from "./abis/Exchange";
import Weth from "./abis/Weth";
import Wyvern from "./abis/Wyvern";
import WyvernProxyRegistry from "./abis/WyvernProxyRegistry";
import ERC721Exchange from "./abis/ERC721Exchange";

export { ERC721, Exchange, ERC1155 };

export function ERC721Contract(contractAddress, provider) {
  const web3Provider = new ethers.providers.Web3Provider(provider);
  return new ethers.Contract(ERC721, contractAddress, web3Provider);
}
export function ERC1155Contract(contractAddress, provider) {
  const web3Provider = new ethers.providers.Web3Provider(provider);
  return new ethers.Contract(ERC1155, contractAddress, web3Provider);
}
export const WETH_CONTRACT = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
export function WethContract(provider) {
  const web3Provider = new ethers.providers.Web3Provider(provider);
  return new ethers.Contract(Weth, WETH_CONTRACT, web3Provider);
}
// GOLOM exchnage
export const EXCHANGE_CONTRACT = "0x8e97B17ADca8177C01D73312c2a4b4626D7ad167";
export function ExchangeContract(provider) {
  const web3Provider = new ethers.providers.Web3Provider(provider);
  return new ethers.Contract(Exchange, EXCHANGE_CONTRACT, web3Provider);
}

export const WYVERN_CONTRACT = "0x7f268357a8c2552623316e2562d90e642bb538e5";
export function WyvernContract(provider) {
  const web3Provider = new ethers.providers.Web3Provider(provider);
  return new ethers.Contract(Wyvern, WYVERN_CONTRACT, web3Provider);
}
export const WYVERN_PROXY_REGISTRY_CONTRACT = `0xa5409ec958C83C3f309868babACA7c86DCB077c1`;
export function WyvernProxyRegistryContract(provider) {
  const web3Provider = new ethers.providers.Web3Provider(provider);
  return new ethers.Contract(
    WyvernProxyRegistry,
    WYVERN_PROXY_REGISTRY_CONTRACT,
    web3Provider
  );
}

export const ERC721_EXCHANGE_CONTRACT = `0xdb454bee1c617edefc2c4b1b2a5a9c1d5a342338`;
export function ERC721ExchangeContract(provider) {
  const web3Provider = new ethers.providers.Web3Provider(provider);
  return new ethers.Contract(
    ERC721Exchange,
    ERC721_EXCHANGE_CONTRACT,
    web3Provider
  );
}
export const ZEROX_PROXY_CONTRACT =
  "0x95E6F48254609A6ee006F7D493c8e5fB97094ceF";

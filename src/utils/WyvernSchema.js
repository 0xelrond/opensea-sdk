import { FunctionInputKind } from "wyvern-js/lib/types";

export const ERC721Schema = {
  version: 2,
  deploymentBlock: 0, // Not indexed (for now; need asset-specific indexing strategy)
  name: "ERC721",
  description: "Items conforming to the ERC721 spec, using transferFrom.",
  thumbnail: "https://opensea.io/static/images/opensea-icon.png",
  website: "http://erc721.org/",
  fields: [
    { name: "ID", type: "uint256", description: "Asset Token ID" },
    { name: "Address", type: "address", description: "Asset Contract Address" },
  ],
  assetFromFields: (fields) => ({
    id: fields.ID,
    address: fields.Address,
  }),
  assetToFields: (asset) => ({
    ID: asset.id,
    Address: asset.address,
  }),
  formatter: (asset) => {
    return {
      title: "ERC721 Asset: Token ID " + asset.id + " at " + asset.address,
      description: "",
      url: "",
      thumbnail: "",
      properties: [],
    };
  },
  functions: {
    transfer: (asset) => ({
      type: "function",
      name: "transferFrom",
      payable: false,
      constant: false,
      stateMutability: "nonpayable",
      target: asset.address,
      inputs: [
        { kind: FunctionInputKind.Owner, name: "_from", type: "address" },
        { kind: FunctionInputKind.Replaceable, name: "_to", type: "address" },
        {
          kind: FunctionInputKind.Asset,
          name: "_tokenId",
          type: "uint256",
          value: asset.id,
        },
      ],
      outputs: [],
    }),
    checkAndTransfer: (asset, validatorAddress, merkle) => ({
      type: "function",
      name: "matchERC721UsingCriteria",
      payable: false,
      constant: false,
      stateMutability: "nonpayable",
      target: validatorAddress,
      inputs: [
        { kind: FunctionInputKind.Owner, name: "from", type: "address" },
        { kind: FunctionInputKind.Replaceable, name: "to", type: "address" },
        {
          kind: FunctionInputKind.Asset,
          name: "token",
          type: "address",
          value: asset.address,
        },
        {
          kind: FunctionInputKind.Asset,
          name: "tokenId",
          type: "uint256",
          value: asset.id,
        },
        {
          kind: FunctionInputKind.Data,
          name: "root",
          type: "bytes32",
          value: merkle ? merkle.root : "",
        },
        {
          kind: FunctionInputKind.Data,
          name: "proof",
          type: "bytes32[]",
          value: merkle ? merkle.proof : "[]",
        },
      ],
      outputs: [],
    }),
    ownerOf: (asset) => ({
      type: "function",
      name: "ownerOf",
      payable: false,
      constant: true,
      stateMutability: "view",
      target: asset.address,
      inputs: [
        {
          kind: FunctionInputKind.Asset,
          name: "_tokenId",
          type: "uint256",
          value: asset.id,
        },
      ],
      outputs: [{ kind: "owner", name: "owner", type: "address" }],
    }),
    assetsOfOwnerByIndex: [],
  },
  events: {
    transfer: [],
  },
  hash: (asset) => asset.address + "-" + asset.id,
};

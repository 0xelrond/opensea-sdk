/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
/* eslint-disable prefer-const */
/* eslint-disable require-await */
/* eslint-disable eqeqeq */
import { WyvernProtocol } from "wyvern-js";
import { HowToCall, Network } from "wyvern-js/lib/types";
import * as ethABI from "ethereumjs-abi";
import { isValidAddress } from "ethereumjs-util";
import BigNumber from "bignumber.js";
import { parseEther } from "@ethersproject/units";

import axios from "axios";
import * as _ from "lodash";
import * as ethUtil from "ethereumjs-util";
import { ERC721Schema } from "./WyvernSchema";
import { PlatformType } from "@/constants/enums";
import { OPENSEA_URL, X_API_KEY } from "@/constants";
import { WyvernContract, WYVERN_CONTRACT } from "@/contracts";

const MIN_EXPIRATION_SECONDS = 10;
const ORDER_MATCHING_LATENCY_SECONDS = 60 * 60 * 24 * 7;
const NULL_ADDRESS = WyvernProtocol.NULL_ADDRESS;
const OPENSEA_FEE_RECIPIENT = "0x5b3256965e7c3cf26e11fcaf296dfc8807c01073";
const NULL_BLOCK_HASH =
  "0x0000000000000000000000000000000000000000000000000000000000000000";
const INVERSE_BASIS_POINT = 10000;
const DEFAULT_BUYER_FEE_BASIS_POINTS = 0;
const DEFAULT_SELLER_FEE_BASIS_POINTS = 250;
const OPENSEA_SELLER_BOUNTY_BASIS_POINTS = 250; // default 1 % we are using 2.5%
const DEFAULT_MAX_BOUNTY = DEFAULT_SELLER_FEE_BASIS_POINTS;
const STATIC_CALL_TX_ORIGIN_ADDRESS =
  "0xbff6ade67e3717101dd8d0a7f3de1bf6623a2ba8";
const MERKLE_VALIDATOR_MAINNET = "0xbaf2127b49fc93cbca6269fade0f7f31df4c88a7";
const MERKLE_VALIDATOR_RINKEBY = "0x45b594792a5cdc008d0de1c1d69faa3d16b3ddc1";
/// GOLOM FEES
const GOLOM_DEFAULT_FEES = 100;
const GOLOM_FEE_RECIPIENT = "0xcd105202276e97B531065a087ceCf8f0b76Ab737";
export const wyvern2_2ConfigByNetwork = {
  main: {
    wyvernExchangeContractAddress: "0x7be8076f4ea4a4ad08075c2508e481d6c946d12b",
    wyvernProxyRegistryContractAddress:
      "0xa5409ec958c83c3f309868babaca7c86dcb077c1",
    wyvernTokenTransferProxyContractAddress:
      "0xe5c783ee536cf5e63e792988335c4255169be4e1",
  },
  rinkeby: {
    wyvernExchangeContractAddress: "0x5206e78b21ce315ce284fb24cf05e0585a93b1d9",
    wyvernProxyRegistryContractAddress:
      "0xf57b2c51ded3a29e6891aba85459d600256cf317",
    wyvernTokenTransferProxyContractAddress:
      "0x82d102457854c985221249f86659c9d6cf12aa72",
  },
};

export const EIP_712_ORDER_TYPES = {
  EIP712Domain: [
    { name: "name", type: "string" },
    { name: "version", type: "string" },
    { name: "chainId", type: "uint256" },
    { name: "verifyingContract", type: "address" },
  ],
  Order: [
    { name: "exchange", type: "address" },
    { name: "maker", type: "address" },
    { name: "taker", type: "address" },
    { name: "makerRelayerFee", type: "uint256" },
    { name: "takerRelayerFee", type: "uint256" },
    { name: "makerProtocolFee", type: "uint256" },
    { name: "takerProtocolFee", type: "uint256" },
    { name: "feeRecipient", type: "address" },
    { name: "feeMethod", type: "uint8" },
    { name: "side", type: "uint8" },
    { name: "saleKind", type: "uint8" },
    { name: "target", type: "address" },
    { name: "howToCall", type: "uint8" },
    { name: "calldata", type: "bytes" },
    { name: "replacementPattern", type: "bytes" },
    { name: "staticTarget", type: "address" },
    { name: "staticExtradata", type: "bytes" },
    { name: "paymentToken", type: "address" },
    { name: "basePrice", type: "uint256" },
    { name: "extra", type: "uint256" },
    { name: "listingTime", type: "uint256" },
    { name: "expirationTime", type: "uint256" },
    { name: "salt", type: "uint256" },
    { name: "nonce", type: "uint256" },
  ],
};

export const EIP_712_WYVERN_DOMAIN_NAME = "Wyvern Exchange Contract";
export const EIP_712_WYVERN_DOMAIN_VERSION = "2.3";
function validateAndFormatWalletAddress(address) {
  return address.toLowerCase();
}

export const tokenFromJSON = (token) => {
  const fromJSON = {
    name: token.name,
    symbol: token.symbol,
    decimals: token.decimals,
    address: token.address,
    imageUrl: token.image_url,
    ethPrice: token.eth_price,
    usdPrice: token.usd_price,
  };

  return fromJSON;
};
export const merkleValidatorByNetwork = {
  main: MERKLE_VALIDATOR_MAINNET,
  rinkeby: MERKLE_VALIDATOR_RINKEBY,
};
export const orderFromJSON = (order) => {
  const createdDate = new Date(`${order.created_date}Z`);
  const fromJSON = {
    hash: order.order_hash || order.hash,
    cancelledOrFinalized: order.cancelled || order.finalized,
    markedInvalid: order.marked_invalid,
    metadata: order.metadata,
    quantity: new BigNumber(order.quantity || 1),
    exchange: order.exchange,
    makerAccount: order.maker,
    takerAccount: order.taker,
    // Use string address to conform to Wyvern Order schema
    maker: order.maker.address,
    taker: order.taker.address,
    makerRelayerFee: new BigNumber(order.maker_relayer_fee),
    takerRelayerFee: new BigNumber(order.taker_relayer_fee),
    makerProtocolFee: new BigNumber(order.maker_protocol_fee),
    takerProtocolFee: new BigNumber(order.taker_protocol_fee),
    makerReferrerFee: new BigNumber(order.maker_referrer_fee || 0),
    waitingForBestCounterOrder: order.fee_recipient.address == NULL_ADDRESS,
    feeMethod: order.fee_method,
    feeRecipientAccount: order.fee_recipient,
    feeRecipient: order.fee_recipient.address,
    side: order.side,
    saleKind: order.sale_kind,
    target: order.target,
    howToCall: order.how_to_call,
    calldata: order.calldata,
    replacementPattern: order.replacement_pattern,
    staticTarget: order.static_target,
    staticExtradata: order.static_extradata,
    paymentToken: order.payment_token,
    basePrice: new BigNumber(order.base_price),
    extra: new BigNumber(order.extra),
    currentBounty: new BigNumber(order.current_bounty || 0),
    currentPrice: new BigNumber(order.current_price || 0),

    createdTime: new BigNumber(Math.round(createdDate.getTime() / 1000)),
    listingTime: new BigNumber(order.listing_time),
    expirationTime: new BigNumber(order.expiration_time),

    salt: new BigNumber(order.salt),
    v: parseInt(order.v),
    r: order.r,
    s: order.s,

    paymentTokenContract: order.payment_token_contract
      ? tokenFromJSON(order.payment_token_contract)
      : undefined,
    asset: order.asset,
    assetBundle: order.asset_bundle,
  };

  // Use client-side price calc, to account for buyer fee (not added by server) and latency
  fromJSON.currentPrice = estimateCurrentPrice(fromJSON);
  return fromJSON;
};

export const orderFromGolomJSON = (order) => {
  const createdDate = new Date(`${order.created}`);
  const orderData = order.data;
  const metadata = {
    asset: {
      address: order.contract_address,
      id: order.token_id,
    },
    schema: "ERC721", // currently supporting erc721 only
  };

  const fromJSON = {
    hash: order.hex,
    cancelledOrFinalized: false,
    markedInvalid: order.valid,
    metadata,
    quantity: new BigNumber(1),
    exchange: orderData.exchange,
    // Use string address to conform to Wyvern Order schema
    maker: orderData.maker,
    taker: orderData.taker,
    makerRelayerFee: new BigNumber(orderData.makerRelayerFee),
    takerRelayerFee: new BigNumber(orderData.takerRelayerFee),
    makerProtocolFee: new BigNumber(orderData.makerProtocolFee),
    takerProtocolFee: new BigNumber(orderData.takerProtocolFee),
    makerReferrerFee: new BigNumber(0), // need to explore this field more
    waitingForBestCounterOrder: orderData.feeRecipient == NULL_ADDRESS,
    feeMethod: orderData.feeMethod,
    feeRecipient: orderData.feeRecipient,
    side: orderData.side,
    saleKind: orderData.saleKind,
    target: orderData.target,
    howToCall: orderData.howToCall,
    calldata: orderData.calldata,
    replacementPattern: orderData.replacementPattern,
    staticTarget: orderData.staticTarget,
    staticExtradata: orderData.staticExtradata,
    paymentToken: orderData.paymentToken,
    basePrice: new BigNumber(orderData.basePrice),
    extra: new BigNumber(orderData.extra),
    currentBounty: new BigNumber(0),
    currentPrice: new BigNumber(0),
    createdTime: new BigNumber(Math.round(createdDate.getTime() / 1000)),
    listingTime: new BigNumber(orderData.listingTime),
    expirationTime: new BigNumber(orderData.expirationTime),
    salt: new BigNumber(orderData.salt),
    v: parseInt(orderData.v),
    r: orderData.r,
    s: orderData.s,
    asset: order.asset,
  };

  // Use client-side price calc, to account for buyer fee (not added by server) and latency
  fromJSON.currentPrice = estimateCurrentPrice(fromJSON);
  return fromJSON;
};
const _getTimeParameters = (
  expirationTimestamp,
  listingTimestamp,
  waitingForBestCounterOrder = false
) => {
  // Validation
  const minExpirationTimestamp = Math.round(
    Date.now() / 1000 + MIN_EXPIRATION_SECONDS
  );
  const minListingTimestamp = Math.round(Date.now() / 1000);
  if (
    expirationTimestamp != 0 &&
    expirationTimestamp < minExpirationTimestamp
  ) {
    throw new Error(
      `Expiration time must be at least ${MIN_EXPIRATION_SECONDS} seconds from now, or zero (non-expiring).`
    );
  }
  if (listingTimestamp && listingTimestamp < minListingTimestamp) {
    throw new Error("Listing time cannot be in the past.");
  }
  if (
    listingTimestamp &&
    expirationTimestamp != 0 &&
    listingTimestamp >= expirationTimestamp
  ) {
    throw new Error("Listing time must be before the expiration time.");
  }
  if (waitingForBestCounterOrder && expirationTimestamp == 0) {
    throw new Error("English auctions must have an expiration time.");
  }
  if (waitingForBestCounterOrder && listingTimestamp) {
    throw new Error(`Cannot schedule an English auction for the future.`);
  }
  if (parseInt(expirationTimestamp.toString()) != expirationTimestamp) {
    throw new Error(`Expiration timestamp must be a whole number of seconds`);
  }

  if (waitingForBestCounterOrder) {
    listingTimestamp = expirationTimestamp;
    // Expire one week from now, to ensure server can match it
    // Later, this will expire closer to the listingTime
    expirationTimestamp = expirationTimestamp + ORDER_MATCHING_LATENCY_SECONDS;
  } else {
    // Small offset to account for latency
    listingTimestamp = listingTimestamp || Math.round(Date.now() / 1000 - 100);
  }

  return {
    listingTime: BigNumber(listingTimestamp),
    expirationTime: BigNumber(expirationTimestamp),
  };
};
export const encodeCall = (abi, parameters) => {
  const inputTypes = abi.inputs.map((i) => i.type);
  return (
    "0x" +
    Buffer.concat([
      ethABI.methodID(abi.name, inputTypes),
      ethABI.rawEncode(inputTypes, parameters),
    ]).toString("hex")
  );
};
const encodeDefaultCall = (abi, address) => {
  const parameters = abi.inputs.map((input) => {
    switch (input.kind) {
      case "replaceable":
        return WyvernProtocol.generateDefaultValue(input.type);
      case "owner":
        return address;
      case "asset":
      default:
        return input.value;
    }
  });
  return encodeCall(abi, parameters);
};
const encodeSell = (schema, asset, address, validatorAddress) => {
  const transfer =
    validatorAddress && schema.functions.checkAndTransfer
      ? schema.functions.checkAndTransfer(asset, validatorAddress)
      : schema.functions.transfer(asset);
  //   const transfer = schema.functions.transfer(asset);
  return {
    target: transfer.target,
    calldata: encodeDefaultCall(transfer, address),
    replacementPattern: WyvernProtocol.encodeReplacementPattern(transfer),
  };
};

const encodeBuy = (schema, asset, address, validatorAddress) => {
  //   const transfer = schema.functions.transfer(asset);
  const transfer =
    validatorAddress && schema.functions.checkAndTransfer
      ? schema.functions.checkAndTransfer(asset, validatorAddress)
      : schema.functions.transfer(asset);
  const replaceables = transfer.inputs.filter((i) => i.kind === "replaceable");
  const ownerInputs = transfer.inputs.filter((i) => i.kind === "owner");

  // Validate
  if (replaceables.length !== 1) {
    throw new Error(
      "Only 1 input can match transfer destination, but instead " +
        replaceables.length +
        " did"
    );
  }

  // Compute calldata
  const parameters = transfer.inputs.map((input) => {
    switch (input.kind) {
      case "replaceable":
        return address;
      case "owner":
        return WyvernProtocol.generateDefaultValue(input.type);
      default:
        try {
          return input.value.toString();
        } catch (e) {
          console.error(schema);
          console.error(asset);
          throw e;
        }
    }
  });
  const calldata = encodeCall(transfer, parameters);

  // Compute replacement pattern
  let replacementPattern = "0x";
  if (ownerInputs.length > 0) {
    replacementPattern = WyvernProtocol.encodeReplacementPattern(
      transfer,
      "owner"
    );
  }

  return {
    target: transfer.target,
    calldata,
    replacementPattern,
  };
};

// "metadata": {
//     "asset": {
//         "id": "5934",
//         "address": "0x66fca7555cd481545a5e66ba9a2bec1e256f98e7"
//     },
//     "schema": "ERC721"
// },
function getOrderHash(order) {
  const orderWithStringTypes = {
    ...order,
    maker: order.maker.toLowerCase(),
    taker: order.taker.toLowerCase(),
    feeRecipient: order.feeRecipient.toLowerCase(),
    side: order.side.toString(),
    saleKind: order.saleKind.toString(),
    howToCall: order.howToCall.toString(),
    feeMethod: order.feeMethod.toString(),
  };
  return WyvernProtocol.getOrderHashHex(orderWithStringTypes);
}
function makeMatchingOrder({
  order,
  accountAddress,
  recipientAddress,
  platform,
}) {
  accountAddress = validateAndFormatWalletAddress(accountAddress);
  recipientAddress = validateAndFormatWalletAddress(recipientAddress);
  const computeOrderParams = () => {
    const shouldValidate = order.target === merkleValidatorByNetwork.main;
    if ("asset" in order.metadata) {
      const schema = ERC721Schema; // currently supporting ERC721 only
      return order.side == 0
        ? encodeSell(
            schema,
            order.metadata.asset,
            recipientAddress,
            shouldValidate ? order.target : undefined
          )
        : encodeBuy(
            schema,
            order.metadata.asset,
            recipientAddress,
            shouldValidate ? order.target : undefined
          );
    } else {
      throw new Error("Invalid order metadata");
    }
  };

  const { target, calldata, replacementPattern } = computeOrderParams();
  const times = _getTimeParameters(0);
  // Compat for matching buy orders that have fee recipient still on them
  const feeRecipient =
    order.feeRecipient == NULL_ADDRESS
      ? platform == PlatformType.Opensea
        ? OPENSEA_FEE_RECIPIENT
        : GOLOM_FEE_RECIPIENT
      : NULL_ADDRESS;
  const matchingOrder = {
    exchange: order.exchange,
    maker: accountAddress,
    taker: order.maker,
    quantity: order.quantity,
    makerRelayerFee: order.makerRelayerFee,
    takerRelayerFee: order.takerRelayerFee,
    makerProtocolFee: order.makerProtocolFee,
    takerProtocolFee: order.takerProtocolFee,
    makerReferrerFee: order.makerReferrerFee,
    waitingForBestCounterOrder: false,
    feeMethod: order.feeMethod,
    feeRecipient,
    side: (order.side + 1) % 2,
    saleKind: 0, // 0 fixed price 1 ducch aucion
    target,
    howToCall: order.howToCall,
    calldata,
    replacementPattern,
    staticTarget: NULL_ADDRESS,
    staticExtradata: "0x",
    paymentToken: order.paymentToken,
    basePrice: order.basePrice,
    extra: BigNumber(0),
    listingTime: times.listingTime,
    expirationTime: times.expirationTime,
    salt: WyvernProtocol.generatePseudoRandomSalt(),
    metadata: order.metadata,
  };

  return matchingOrder;
  //   return {
  //     ...matchingOrder,
  //     hash: getOrderHash(matchingOrder)
  //   };
}
function assignOrdersToSides(order, matchingOrder) {
  const isSellOrder = order.side == 1;

  let buy;
  let sell;
  if (!isSellOrder) {
    buy = order;
    sell = {
      ...matchingOrder,
      v: buy.v,
      r: buy.r,
      s: buy.s,
    };
  } else {
    sell = order;
    buy = {
      ...matchingOrder,
      v: sell.v,
      r: sell.r,
      s: sell.s,
    };
  }

  return { buy, sell };
}
const _getMetadata = (order, referrerAddress) => {
  const referrer = referrerAddress || order.metadata.referrerAddress;
  if (referrer && isValidAddress(referrer)) {
    return `0x000000000000000000000000${referrer.substr(2)}`;
  }
  return undefined;
};
const _correctGasAmount = (estimation) => {
  return Math.ceil(estimation * 1.01);
};
function _getWyvernProtocolForOrder(order, useReadOnly) {
  if (
    order.exchange ===
    wyvern2_2ConfigByNetwork.main.wyvernExchangeContractAddress
  ) {
    return useReadOnly
      ? this._wyvern2_2ProtocolReadOnly
      : this._wyvern2_2Protocol;
  }
  return useReadOnly ? this._wyvernProtocolReadOnly : this._wyvernProtocol;
}
/**
 * Gets the price for the order using the contract
 * @param order The order to calculate the price for
 */
async function getCurrentPrice(order, wyvernExchange) {
  const currentPrice = await wyvernExchange.methods
    .calculateCurrentPrice_(
      [
        order.exchange,
        order.maker,
        order.taker,
        order.feeRecipient,
        order.target,
        order.staticTarget,
        order.paymentToken,
      ],
      [
        order.makerRelayerFee.toFixed(),
        order.takerRelayerFee.toFixed(),
        order.makerProtocolFee.toFixed(),
        order.takerProtocolFee.toFixed(),
        order.basePrice.toFixed(),
        order.extra.toFixed(),
        order.listingTime.toFixed(),
        order.expirationTime.toFixed(),
        order.salt.toFixed(),
      ],
      order.feeMethod,
      order.side,
      order.saleKind,
      order.howToCall,
      order.calldata,
      order.replacementPattern,
      order.staticExtradata
    )
    .call();
  return currentPrice;
}
/**
 * Estimates the price of an order
 * @param order The order to estimate price on
 * @param secondsToBacktrack The number of seconds to subtract on current time,
 *  to fix race conditions
 * @param shouldRoundUp Whether to round up fractional wei
 */
export function estimateCurrentPrice(
  order,
  secondsToBacktrack = 30,
  shouldRoundUp = false
) {
  // round up should be enabled
  let { basePrice, listingTime, expirationTime, extra } = order;
  const { side, takerRelayerFee, saleKind } = order;

  const now = new BigNumber(Math.round(Date.now() / 1000)).minus(
    secondsToBacktrack
  );
  basePrice = new BigNumber(basePrice);
  listingTime = new BigNumber(listingTime);
  expirationTime = new BigNumber(expirationTime);
  extra = new BigNumber(extra);

  let exactPrice = basePrice;
  // saleKind 0 : Fixed price 1: Duction acution
  if (saleKind === 0) {
    // Do nothing, price is correct
  } else if (saleKind === 1) {
    const diff = extra
      .times(now.minus(listingTime))
      .dividedBy(expirationTime.minus(listingTime));
    // side 0 : buy 1: sell
    exactPrice =
      side == 1
        ? /* Sell-side - start price: basePrice. End price: basePrice - extra. */
          basePrice.minus(diff)
        : /* Buy-side - start price: basePrice. End price: basePrice + extra. */
          basePrice.plus(diff);
  }

  // Add taker fee only for buyers
  if (side === 1 && !order.waitingForBestCounterOrder) {
    // Buyer fee increases sale price
    exactPrice = exactPrice.times(+takerRelayerFee / INVERSE_BASIS_POINT + 1);
  }
  return shouldRoundUp ? exactPrice.ceil() : exactPrice;
}
async function _getRequiredAmountForTakingSellOrder(sell, wyvernExchange) {
  const currentPrice = await getCurrentPrice(sell, wyvernExchange);
  const estimatedPrice = estimateCurrentPrice(sell);

  const maxPrice = BigNumber.max(currentPrice, estimatedPrice);

  // TODO Why is this not always a big number?
  sell.takerRelayerFee = BigNumber(sell.takerRelayerFee);
  const feePercentage = sell.takerRelayerFee.div(INVERSE_BASIS_POINT);
  const fee = feePercentage.times(maxPrice);
  return fee.plus(maxPrice); // use .ceil()
}
async function _atomicMatch({
  buy,
  sell,
  accountAddress,
  wyvernExchange,
  metadata = NULL_BLOCK_HASH,
}) {
  let value;
  // let shouldValidateBuy = true;
  // let shouldValidateSell = true;
  // provider;
  //   if (sell.maker.toLowerCase() == accountAddress.toLowerCase()) {
  //     // USER IS THE SELLER, only validate the buy order
  //     await this._sellOrderValidationAndApprovals({ order: sell, accountAddress });
  //     shouldValidateSell = false;
  //   } else if (buy.maker.toLowerCase() == accountAddress.toLowerCase()) {
  //     // USER IS THE BUYER, only validate the sell order
  //     await this._buyOrderValidationAndApprovals({ order: buy, counterOrder: sell, accountAddress });
  //     shouldValidateBuy = false;

  //     // If using ETH to pay, set the value of the transaction to the current price

  //   } else {
  //     // User is neither - matching service
  //   }
  if (buy.paymentToken == NULL_ADDRESS) {
    value = await _getRequiredAmountForTakingSellOrder(sell, wyvernExchange);
  }

  // await this._validateMatch({ buy, sell, accountAddress, shouldValidateBuy, shouldValidateSell });

  //   this._dispatch(EventType.MatchOrders, { buy, sell, accountAddress, matchMetadata: metadata });

  const txnData = { from: accountAddress, value };
  const args = [
    [
      buy.exchange,
      buy.maker,
      buy.taker,
      buy.feeRecipient,
      buy.target,
      buy.staticTarget,
      buy.paymentToken,
      sell.exchange,
      sell.maker,
      sell.taker,
      sell.feeRecipient,
      sell.target,
      sell.staticTarget,
      sell.paymentToken,
    ],
    [
      // exchange, maker, taker, feeRecipient, target, staticTarget, paymentToken,
      buy.makerRelayerFee.toString(),
      buy.takerRelayerFee.toString(),
      buy.makerProtocolFee.toString(),
      buy.takerProtocolFee.toString(),
      buy.basePrice.toString(),
      buy.extra.toString(),
      buy.listingTime.toString(),
      buy.expirationTime.toString(),
      buy.salt.toFixed(),
      sell.makerRelayerFee.toString(),
      sell.takerRelayerFee.toString(),
      sell.makerProtocolFee.toString(),
      sell.takerProtocolFee.toString(),
      sell.basePrice.toString(),
      sell.extra.toString(),
      sell.listingTime.toString(),
      sell.expirationTime.toString(),
      sell.salt.toFixed(),
    ],
    [
      buy.feeMethod,
      buy.side,
      buy.saleKind,
      buy.howToCall,
      sell.feeMethod,
      sell.side,
      sell.saleKind,
      sell.howToCall,
    ],
    buy.calldata,
    sell.calldata,
    buy.replacementPattern,
    sell.replacementPattern,
    buy.staticExtradata,
    sell.staticExtradata,
    [buy.v || 0, sell.v || 0],
    [
      buy.r || NULL_BLOCK_HASH,
      buy.s || NULL_BLOCK_HASH,
      sell.r || NULL_BLOCK_HASH,
      sell.s || NULL_BLOCK_HASH,
      metadata,
    ],
  ];

  // Estimate gas first
  // try {
  //   // Typescript splat doesn't typecheck
  //   // estimating gas from wyvern
  //   // args[0] = [
  //   //   '0x7be8076f4ea4a4ad08075c2508e481d6c946d12b',
  //   //   '0xafac92864611c564e7fa1a6c6d07b45807536943',
  //   //   '0xc4851dee24da2046e144d8f71b18c19bd75b73b4',
  //   //   '0x0000000000000000000000000000000000000000',
  //   //   '0x9d418c2cae665d877f909a725402ebd3a0742844',
  //   //   '0x0000000000000000000000000000000000000000',
  //   //   '0x0000000000000000000000000000000000000000',
  //   //   '0x7be8076f4ea4a4ad08075c2508e481d6c946d12b',
  //   //   '0xc4851dee24da2046e144d8f71b18c19bd75b73b4',
  //   //   '0x0000000000000000000000000000000000000000',
  //   //   '0x5b3256965e7c3cf26e11fcaf296dfc8807c01073',
  //   //   '0x9d418c2cae665d877f909a725402ebd3a0742844',
  //   //   '0x0000000000000000000000000000000000000000',
  //   //   '0x0000000000000000000000000000000000000000'
  //   // ];

  //   const gasEstimate = await wyvernExchange.methods
  //     .atomicMatch_(
  //       args[0],
  //       args[1],
  //       args[2],
  //       args[3],
  //       args[4],
  //       args[5],
  //       args[6],
  //       args[7],
  //       args[8],
  //       args[9],
  //       args[10]
  //     )
  //     .estimateGas(txnData);
  //   console.info(`Gas estimations are :${gasEstimate}`);
  //   txnData.gas = _correctGasAmount(gasEstimate);
  // } catch (error) {
  //   console.error(`Failed atomic match with args: `, args, error);
  //   throw new Error(error.message);
  // }
  console.info(`Fulfilling order with gas set to ${txnData.gas}`);
  // calling atomicMatch_ function here
  const atomicMatchMethod = wyvernExchange.methods.atomicMatch_(
    args[0],
    args[1],
    args[2],
    args[3],
    args[4],
    args[5],
    args[6],
    args[7],
    args[8],
    args[9],
    args[10]
  );
  return { atomicMatchMethod, txnData };
  // Then do the transaction
  // try {
  //   // .send(txnData);
  // } catch (error) {
  //   throw new Error(
  //     `Failed to authorize transaction: "${error.message ? error.message : 'user denied'}..."`
  //   );
  // }
  // return txHash;
}
const jsonToOrder = (golomOrder) => {
  // console.log(order, golomOrder);

  const { data, tokenId, contractAddress, created } = golomOrder;
  const createdDate = new Date(`${created}`);

  const metadata = {
    asset: {
      id: String(tokenId),
      address: contractAddress,
    },
    schema: "ERC721",
  };
  const fromJSON = {
    ...data,
    metadata,
    quantity: new BigNumber(1),
    makerRelayerFee: new BigNumber(data.makerRelayerFee),
    takerRelayerFee: new BigNumber(data.takerRelayerFee),
    makerProtocolFee: new BigNumber(data.makerProtocolFee),
    takerProtocolFee: new BigNumber(data.takerProtocolFee),
    makerReferrerFee: new BigNumber(data.makerReferrerFee),
    waitingForBestCounterOrder: data.feeRecipient == NULL_ADDRESS,
    basePrice: new BigNumber(data.basePrice),
    extra: new BigNumber(data.extra),
    currentBounty: new BigNumber(0),
    currentPrice: new BigNumber(0),

    createdTime: new BigNumber(Math.round(createdDate.getTime() / 1000)),
    listingTime: new BigNumber(data.listingTime),
    expirationTime: new BigNumber(data.expirationTime),
    salt: new BigNumber(data.salt),
    v: parseInt(data.v),
    paymentTokenContract: data.payment_token_contract
      ? tokenFromJSON(data.payment_token_contract)
      : undefined,
  };

  // Use client-side price calc, to account for buyer fee (not added by server) and latency
  fromJSON.currentPrice = estimateCurrentPrice(fromJSON);
  return fromJSON;
};

async function fulfillOrder({
  order,
  provider,
  accountAddress,
  recipientAddress,
  referrerAddress,
  platform = PlatformType.Opensea,
}) {
  console.info(
    `Account: ${accountAddress} | Recipient: ${recipientAddress} | Referrer: ${referrerAddress}`
  );
  // check if valid order
  order = jsonToOrder(order);
  const wyvernExchange = WyvernContract(provider);
  const isValid = await validateOrder({
    order,
    accountAddress,
    wyvernExchange,
  });
  const matchingOrder = makeMatchingOrder({
    order,
    accountAddress,
    recipientAddress: recipientAddress || accountAddress,
    platform,
  });
  const { buy, sell } = assignOrdersToSides(order, matchingOrder);
  const metadata = _getMetadata(order, referrerAddress);
  return await _atomicMatch({
    buy,
    sell,
    accountAddress,
    wyvernExchange,
    metadata,
  });
}

function getWyvernAsset(schema, asset, quantity = new BigNumber(1)) {
  const tokenId = asset.tokenId != null ? asset.tokenId.toString() : undefined;
  return schema.assetFromFields({
    ID: tokenId,
    Quantity: quantity.toString(),
    Address: asset.tokenAddress.toLowerCase(),
    Name: asset.name,
  });
}
async function computeFees({
  asset,
  side,
  accountAddress,
  platform,
  extraBountyBasisPoints = 0,
}) {
  let openseaBuyerFeeBasisPoints = DEFAULT_BUYER_FEE_BASIS_POINTS;
  let openseaSellerFeeBasisPoints = DEFAULT_SELLER_FEE_BASIS_POINTS;
  let devBuyerFeeBasisPoints = 0;
  let devSellerFeeBasisPoints = 0;
  let transferFee = new BigNumber(0);
  let transferFeeTokenAddress = null;
  let maxTotalBountyBPS = DEFAULT_MAX_BOUNTY;

  if (asset && platform == PlatformType.Opensea) {
    openseaBuyerFeeBasisPoints = +asset.openseaBuyerFeeBasisPoints;
    openseaSellerFeeBasisPoints = +asset.openseaSellerFeeBasisPoints;
    devBuyerFeeBasisPoints = +asset.devBuyerFeeBasisPoints;
    devSellerFeeBasisPoints = +asset.devSellerFeeBasisPoints;
    maxTotalBountyBPS = openseaSellerFeeBasisPoints;
  }

  // Compute transferFrom fees
  if (side == 1 && asset && platform == PlatformType.Opensea) {
    // Server-side knowledge
    // transferFee = asset.transferFee ? new BigNumber(asset.transferFee) : transferFee;
    // transferFeeTokenAddress = asset.transferFeePaymentToken
    //   ? asset.transferFeePaymentToken.address
    //   : transferFeeTokenAddress;
  }

  // Compute bounty
  const sellerBountyBasisPoints = side == 1 ? extraBountyBasisPoints : 0;

  // Check that bounty is in range of the opensea fee
  const bountyTooLarge =
    sellerBountyBasisPoints + OPENSEA_SELLER_BOUNTY_BASIS_POINTS >
    maxTotalBountyBPS;
  if (sellerBountyBasisPoints > 0 && bountyTooLarge) {
    let errorMessage = `Total bounty exceeds the maximum for this asset type (${
      maxTotalBountyBPS / 100
    }%).`;
    if (maxTotalBountyBPS >= OPENSEA_SELLER_BOUNTY_BASIS_POINTS) {
      errorMessage += ` Remember that OpenSea will add ${
        OPENSEA_SELLER_BOUNTY_BASIS_POINTS / 100
      }% for referrers with OpenSea accounts!`;
    }
    throw new Error(errorMessage);
  }

  return {
    totalBuyerFeeBasisPoints:
      openseaBuyerFeeBasisPoints + devBuyerFeeBasisPoints,
    totalSellerFeeBasisPoints:
      openseaSellerFeeBasisPoints + devSellerFeeBasisPoints,
    openseaBuyerFeeBasisPoints,
    openseaSellerFeeBasisPoints,
    devBuyerFeeBasisPoints,
    devSellerFeeBasisPoints,
    sellerBountyBasisPoints,
    transferFee,
    transferFeeTokenAddress,
  };
}

/**
 * Compute the `basePrice` and `extra` parameters to be used to price an order.
 * Also validates the expiration time and auction type.
 * @param tokenAddress Address of the ERC-20 token to use for trading.
 * Use the null address for ETH
 * @param expirationTime When the auction expires, or 0 if never.
 * @param startAmount The base value for the order, in the token's main units (e.g. ETH instead of wei)
 * @param endAmount The end value for the order, in the token's main units (e.g. ETH instead of wei). If unspecified, the order's `extra` attribute will be 0
 */
async function _getPriceParameters(
  orderSide,
  tokenAddress,
  expirationTime,
  startAmount,
  endAmount,
  waitingForBestCounterOrder = false,
  englishAuctionReservePrice
) {
  const priceDiff = endAmount != null ? startAmount - endAmount : 0;
  const paymentToken = tokenAddress.toLowerCase();
  // const isEther = tokenAddress == NULL_ADDRESS;
  // const { tokens } = await this.api.getPaymentTokens({ address: paymentToken });
  // const token = tokens[0];

  // Note: WyvernProtocol.toBaseUnitAmount(makeBigNumber(startAmount), token.decimals)
  // will fail if too many decimal places, so special-case ether
  // const basePrice = isEther
  //   ? new BigNumber(parseEther(startAmount)).round()
  //   : WyvernProtocol.toBaseUnitAmount(new BigNumber(startAmount), token.decimals);
  const basePrice = new BigNumber(parseEther(String(startAmount)));
  // const extra = isEther
  //   ? new BigNumber(parseEther(priceDiff)).decimalPlaces()
  //   : WyvernProtocol.toBaseUnitAmount(new BigNumber(priceDiff), token.decimals);
  // console.log(basePrice, priceDiff);
  const extra = new BigNumber(parseEther(String(priceDiff)));
  // const reservePrice = englishAuctionReservePrice
  //   ? isEther
  //     ? new BigNumber(parseEther(englishAuctionReservePrice))
  //     : WyvernProtocol.toBaseUnitAmount(new BigNumber(englishAuctionReservePrice), token.decimals)
  //   : undefined;
  const reservePrice = englishAuctionReservePrice
    ? new BigNumber(parseEther(englishAuctionReservePrice))
    : undefined;

  return { basePrice, extra, paymentToken, reservePrice };
}
function _validateFees(totalBuyerFeeBasisPoints, totalSellerFeeBasisPoints) {
  const maxFeePercent = INVERSE_BASIS_POINT / 100;

  if (
    totalBuyerFeeBasisPoints > INVERSE_BASIS_POINT ||
    totalSellerFeeBasisPoints > INVERSE_BASIS_POINT
  ) {
    throw new Error(
      `Invalid buyer/seller fees: must be less than ${maxFeePercent}%`
    );
  }

  if (totalBuyerFeeBasisPoints < 0 || totalSellerFeeBasisPoints < 0) {
    throw new Error(`Invalid buyer/seller fees: must be at least 0%`);
  }
}
function _getSellFeeParameters(
  totalBuyerFeeBasisPoints,
  totalSellerFeeBasisPoints,
  waitForHighestBid,
  sellerBountyBasisPoints = 0,
  platform
) {
  // just making basic check if fee is less than 100% and not negative
  _validateFees(totalBuyerFeeBasisPoints, totalSellerFeeBasisPoints);
  // Use buyer as the maker when it's an English auction, so Wyvern sets prices correctly
  const feeRecipient = waitForHighestBid ? NULL_ADDRESS : OPENSEA_FEE_RECIPIENT;

  // Swap maker/taker fees when it's an English auction,
  // since these sell orders are takers not makers
  const makerRelayerFee = waitForHighestBid
    ? new BigNumber(totalBuyerFeeBasisPoints)
    : new BigNumber(totalSellerFeeBasisPoints);
  const takerRelayerFee = waitForHighestBid
    ? new BigNumber(totalSellerFeeBasisPoints)
    : new BigNumber(totalBuyerFeeBasisPoints);

  return {
    makerRelayerFee,
    takerRelayerFee,
    makerProtocolFee: new BigNumber(0),
    takerProtocolFee: new BigNumber(0),
    makerReferrerFee: new BigNumber(sellerBountyBasisPoints),
    feeRecipient,
    feeMethod: 1, // 0 protocol fee ,1 split fee
  };
}
const StaticCheckTxOrigin = [
  {
    constant: true,
    inputs: [],
    name: "succeedIfTxOriginMatchesHardcodedAddress",
    outputs: [],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [{ name: "_specifiedAddress", type: "address" }],
    name: "succeedIfTxOriginMatchesSpecifiedAddress",
    outputs: [],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "owner",
    outputs: [{ name: "", type: "address" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "isOwner",
    outputs: [{ name: "", type: "bool" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [{ name: "_newHardcodedAddress", type: "address" }],
    name: "changeHardcodedAddress",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: false,
    inputs: [{ name: "newOwner", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "_hardcodedAddress", type: "address" }],
    payable: false,
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, name: "previousOwner", type: "address" },
      { indexed: false, name: "newOwner", type: "address" },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
];

export const getMethod = (abi, name) => {
  const methodAbi = abi.find((x) => x.type == "function" && x.name == name);
  if (!methodAbi) {
    throw new Error(`ABI ${name} not found`);
  }
  // Have to cast since there's a bug in
  // web3 types on the 'type' field
  return methodAbi;
};
async function _getStaticCallTargetAndExtraData({ useTxnOriginStaticCall }) {
  if (!useTxnOriginStaticCall) {
    // While testing, we will use dummy values for mainnet. We will remove this if-statement once we have pushed the PR once and tested on Rinkeby
    return {
      staticTarget: NULL_ADDRESS,
      staticExtradata: "0x",
    };
  }

  if (useTxnOriginStaticCall) {
    return {
      staticTarget: STATIC_CALL_TX_ORIGIN_ADDRESS,
      staticExtradata: encodeCall(
        getMethod(
          StaticCheckTxOrigin,
          "succeedIfTxOriginMatchesHardcodedAddress"
        ),
        []
      ),
    };
  } else {
    // Noop - no checks
    return {
      staticTarget: NULL_ADDRESS,
      staticExtradata: "0x",
    };
  }
}
export const assetContractFromJSON = (assetContract) => {
  return {
    name: assetContract.name,
    description: assetContract.description,
    type: assetContract.assetContract_type,
    schemaName: assetContract.schema_name,
    address: assetContract.address,
    tokenSymbol: assetContract.symbol,
    buyerFeeBasisPoints: +assetContract.buyer_fee_basis_points,
    sellerFeeBasisPoints: +assetContract.seller_fee_basis_points,
    openseaBuyerFeeBasisPoints: +assetContract.opensea_buyer_fee_basis_points,
    openseaSellerFeeBasisPoints: +assetContract.opensea_seller_fee_basis_points,
    devBuyerFeeBasisPoints: +assetContract.dev_buyer_fee_basis_points,
    devSellerFeeBasisPoints: +assetContract.dev_seller_fee_basis_points,
    imageUrl: assetContract.image_url,
    externalLink: assetContract.external_link,
    wikiLink: assetContract.wiki_link,
  };
};
export const collectionFromJSON = (collection) => {
  const createdDate = new Date(`${collection.created_date}Z`);

  return {
    createdDate,
    name: collection.name,
    description: collection.description,
    slug: collection.slug,
    editors: collection.editors,
    hidden: collection.hidden,
    featured: collection.featured,
    featuredImageUrl: collection.featured_image_url,
    displayData: collection.display_data,
    paymentTokens: (collection.payment_tokens || []).map(tokenFromJSON),
    openseaBuyerFeeBasisPoints: +collection.opensea_buyer_fee_basis_points,
    openseaSellerFeeBasisPoints: +collection.opensea_seller_fee_basis_points,
    devBuyerFeeBasisPoints: +collection.dev_buyer_fee_basis_points,
    devSellerFeeBasisPoints: +collection.dev_seller_fee_basis_points,
    payoutAddress: collection.payout_address,
    imageUrl: collection.image_url,
    largeImageUrl: collection.large_image_url,
    stats: collection.stats,
    traitStats: collection.traits,
    externalLink: collection.external_url,
    wikiLink: collection.wiki_url,
  };
};
export const userFromJSON = (user) => {
  return {
    username: user.username,
  };
};

export const accountFromJSON = (account) => {
  return {
    address: account.address,
    config: account.config,
    profileImgUrl: account.profile_img_url,
    user: account.user ? userFromJSON(account.user) : null,
  };
};
export const transactionFromJSON = (transaction) => {
  return {
    fromAccount: accountFromJSON(transaction.from_account),
    toAccount: accountFromJSON(transaction.to_account),
    createdDate: new Date(`${transaction.created_date}Z`),
    modifiedDate: new Date(`${transaction.modified_date}Z`),
    transactionHash: transaction.transaction_hash,
    transactionIndex: transaction.transaction_index,
    blockNumber: transaction.block_number,
    blockHash: transaction.block_hash,
    timestamp: new Date(`${transaction.timestamp}Z`),
  };
};

export const assetEventFromJSON = (assetEvent) => {
  return {
    eventType: assetEvent.event_type,
    eventTimestamp: assetEvent.event_timestamp,
    auctionType: assetEvent.auction_type,
    totalPrice: assetEvent.total_price,
    transaction: assetEvent.transaction
      ? transactionFromJSON(assetEvent.transaction)
      : null,
    paymentToken: assetEvent.payment_token
      ? tokenFromJSON(assetEvent.payment_token)
      : null,
  };
};

export const assetFromJSON = (asset) => {
  const isAnimated = asset.image_url && asset.image_url.endsWith(".gif");
  const isSvg = asset.image_url && asset.image_url.endsWith(".svg");
  const fromJSON = {
    tokenId: asset.token_id.toString(),
    tokenAddress: asset.asset_contract.address,
    name: asset.name,
    description: asset.description,
    owner: asset.owner,
    assetContract: assetContractFromJSON(asset.asset_contract),
    collection: collectionFromJSON(asset.collection),
    orders: asset.orders ? asset.orders.map(orderFromJSON) : null,
    sellOrders: asset.sell_orders ? asset.sell_orders.map(orderFromJSON) : null,
    buyOrders: asset.buy_orders ? asset.buy_orders.map(orderFromJSON) : null,

    isPresale: asset.is_presale,
    // Don't use previews if it's a special image
    imageUrl:
      isAnimated || isSvg
        ? asset.image_url
        : asset.image_preview_url || asset.image_url,
    imagePreviewUrl: asset.image_preview_url,
    imageUrlOriginal: asset.image_original_url,
    imageUrlThumbnail: asset.image_thumbnail_url,

    externalLink: asset.external_link,
    openseaLink: asset.permalink,
    traits: asset.traits,
    numSales: asset.num_sales,
    lastSale: asset.last_sale ? assetEventFromJSON(asset.last_sale) : null,
    backgroundColor: asset.background_color
      ? `#${asset.background_color}`
      : null,

    transferFee: asset.transfer_fee ? new BigNumber(asset.transfer_fee) : null,
    transferFeePaymentToken: asset.transfer_fee_payment_token
      ? tokenFromJSON(asset.transfer_fee_payment_token)
      : null,
  };
  // If orders were included, put them in sell/buy order groups
  if (fromJSON.orders && !fromJSON.sellOrders) {
    fromJSON.sellOrders = fromJSON.orders.filter((o) => o.side == 1);
  }
  if (fromJSON.orders && !fromJSON.buyOrders) {
    fromJSON.buyOrders = fromJSON.orders.filter((o) => o.side == 0);
  }
  return fromJSON;
};
/**
 * Fetch an asset from the API, throwing if none is found
 * @param tokenAddress Address of the asset's contract
 * @param tokenId The asset's token ID, or null if ERC-20
 * @param retries Number of times to retry if the service is unavailable for any reason
 */
async function getAsset({ tokenAddress, tokenId }) {
  const { data } = await axios(
    `${OPENSEA_URL}asset/${tokenAddress}/${tokenId || 0}/`
  );
  return assetFromJSON(data);
}
async function _makeSellOrder({
  asset,
  quantity,
  accountAddress,
  startAmount,
  endAmount,
  listingTime,
  expirationTime,
  waitForHighestBid,
  englishAuctionReservePrice = 0,
  paymentTokenAddress,
  extraBountyBasisPoints, // this is for extra fee
  buyerAddress,
  platform,
  openSeaAsset, // holds fee
}) {
  accountAddress = validateAndFormatWalletAddress(accountAddress);
  const schema = ERC721Schema; // currently supporting ERC721 only
  const quantityBN = new BigNumber(1);
  const wyAsset = getWyvernAsset(schema, asset, quantityBN);

  let totalSellerFeeBasisPoints = GOLOM_DEFAULT_FEES; // in bps
  if (asset.tokenAddress == "0xf07468ead8cf26c752c676e43c814fee9c8cf402") {
    totalSellerFeeBasisPoints = 0;
  }
  let totalBuyerFeeBasisPoints = 0;
  let sellerBountyBasisPoints = 0;
  // TODO: No need to fetch asset again we can use values from _token.vue directly
  if (platform == PlatformType.Opensea) {
    // { totalSellerFeeBasisPoints, totalBuyerFeeBasisPoints, sellerBountyBasisPoints }
    const fees = await computeFees({
      asset: openSeaAsset,
      side: 1,
      extraBountyBasisPoints,
      platform,
    }); // 1 for sell 0 for buy
    totalSellerFeeBasisPoints = fees.totalSellerFeeBasisPoints;
    totalBuyerFeeBasisPoints = fees.totalBuyerFeeBasisPoints;
    sellerBountyBasisPoints = fees.sellerBountyBasisPoints;
  }

  const { target, calldata, replacementPattern } = encodeSell(
    schema,
    wyAsset,
    accountAddress,
    waitForHighestBid ? undefined : merkleValidatorByNetwork.main
  );
  console.log(endAmount);
  const orderSaleKind = endAmount != null && endAmount !== startAmount ? 1 : 0; // 0 fixed price 1 ducch aucion

  const { basePrice, extra, paymentToken, reservePrice } =
    await _getPriceParameters(
      1,
      paymentTokenAddress,
      expirationTime,
      startAmount,
      endAmount,
      waitForHighestBid,
      englishAuctionReservePrice
    );
  const times = _getTimeParameters(
    expirationTime,
    listingTime,
    waitForHighestBid
  );

  let {
    makerRelayerFee,
    takerRelayerFee,
    makerProtocolFee,
    takerProtocolFee,
    makerReferrerFee,
    feeRecipient,
    feeMethod,
  } = _getSellFeeParameters(
    totalBuyerFeeBasisPoints,
    totalSellerFeeBasisPoints,
    waitForHighestBid,
    sellerBountyBasisPoints
  );
  if (platform != PlatformType.Opensea) {
    feeRecipient = GOLOM_FEE_RECIPIENT;
  }

  const { staticTarget, staticExtradata } =
    await _getStaticCallTargetAndExtraData({
      useTxnOriginStaticCall: waitForHighestBid,
    });

  return {
    exchange: WYVERN_CONTRACT,
    maker: accountAddress,
    taker: buyerAddress, // for private listing
    quantity: quantityBN,
    makerRelayerFee,
    takerRelayerFee,
    makerProtocolFee,
    takerProtocolFee,
    makerReferrerFee,
    waitingForBestCounterOrder: waitForHighestBid,
    englishAuctionReservePrice: reservePrice
      ? new BigNumber(reservePrice)
      : undefined,
    feeMethod,
    feeRecipient,
    side: 1,
    saleKind: orderSaleKind,
    target,
    howToCall:
      target === merkleValidatorByNetwork.main
        ? HowToCall.DelegateCall
        : HowToCall.Call,
    calldata,
    replacementPattern,
    staticTarget,
    staticExtradata,
    paymentToken,
    basePrice,
    extra,
    listingTime: times.listingTime,
    expirationTime: times.expirationTime,
    salt: WyvernProtocol.generatePseudoRandomSalt(),
    metadata: {
      asset: wyAsset,
      schema: schema.name,
    },
  };
}
async function validateOrderParams({ order, accountAddress, wyvernExchange }) {
  // Check sell parameters

  const sellValid = await wyvernExchange.methods
    .validateOrderParameters_(
      [
        order.exchange,
        order.maker,
        order.taker,
        order.feeRecipient,
        order.target,
        order.staticTarget,
        order.paymentToken,
      ],
      [
        order.makerRelayerFee.toFixed(),
        order.takerRelayerFee.toFixed(),
        order.makerProtocolFee.toFixed(),
        order.takerProtocolFee.toFixed(),
        order.basePrice.toFixed(),
        order.extra.toFixed(),
        order.listingTime.toFixed(),
        order.expirationTime.toFixed(),
        order.salt.toFixed(),
      ],
      order.feeMethod,
      order.side,
      order.saleKind,
      order.howToCall,
      order.calldata,
      order.replacementPattern,
      order.staticExtradata
    )
    .call({ from: accountAddress });
  if (!sellValid) {
    console.error(order);
    throw new Error(
      `Failed to validate sell order parameters. Make sure you're on the right network!`
    );
  }
  return sellValid;
}
async function validateOrder({ order, accountAddress, wyvernExchange }) {
  // Check sell parameters

  const sellValid = await wyvernExchange.methods
    .validateOrder_(
      [
        order.exchange,
        order.maker,
        order.taker,
        order.feeRecipient,
        order.target,
        order.staticTarget,
        order.paymentToken,
      ],
      [
        order.makerRelayerFee.toFixed(),
        order.takerRelayerFee.toFixed(),
        order.makerProtocolFee.toFixed(),
        order.takerProtocolFee.toFixed(),
        order.basePrice.toFixed(),
        order.extra.toFixed(),
        order.listingTime.toFixed(),
        order.expirationTime.toFixed(),
        order.salt.toFixed(),
      ],
      order.feeMethod,
      order.side,
      order.saleKind,
      order.howToCall,
      order.calldata,
      order.replacementPattern,
      order.staticExtradata,
      order.v,
      order.r,
      order.s
    )
    .call({ from: accountAddress });
  if (!sellValid) {
    // eslint-disable-next-line no-throw-literal
    throw {
      message: new Error(
        `Failed to validate sell order parameters. It looks like this listing is invalid.`
      ),
      code: "InvalidOrder",
    };
    // TODO: call order invalidate API
  }
  return sellValid;
}
// sourced from 0x.js:
// https://github.com/ProjectWyvern/wyvern-js/blob/39999cb93ce5d80ea90b4382182d1bd4339a9c6c/src/utils/signature_utils.ts
async function parseSignatureHex(signature) {
  // HACK: There is no consensus on whether the signatureHex string should be formatted as
  // v + r + s OR r + s + v, and different clients (even different versions of the same client)
  // return the signature params in different orders. In order to support all client implementations,
  // we parse the signature in both ways, and evaluate if either one is a valid signature.
  const validVParamValues = [27, 28];

  const ecSignatureRSV = _parseSignatureHexAsRSV(signature);
  if (_.includes(validVParamValues, ecSignatureRSV.v)) {
    return ecSignatureRSV;
  }

  // For older clients
  const ecSignatureVRS = _parseSignatureHexAsVRS(signature);
  if (_.includes(validVParamValues, ecSignatureVRS.v)) {
    return ecSignatureVRS;
  }

  throw new Error("Invalid signature");

  function _parseSignatureHexAsVRS(signatureHex) {
    const signatureBuffer = ethUtil.toBuffer(signatureHex);
    let v = signatureBuffer[0];
    if (v < 27) {
      v += 27;
    }
    const r = signatureBuffer.slice(1, 33);
    const s = signatureBuffer.slice(33, 65);
    const ecSignature = {
      v,
      r: ethUtil.bufferToHex(r),
      s: ethUtil.bufferToHex(s),
    };
    return ecSignature;
  }

  function _parseSignatureHexAsRSV(signatureHex) {
    const { v, r, s } = ethUtil.fromRpcSig(signatureHex);
    const ecSignature = {
      v,
      r: ethUtil.bufferToHex(r),
      s: ethUtil.bufferToHex(s),
    };
    return ecSignature;
  }
}
async function personalSignAsync(provider, message, signerAddress) {
  return new Promise((resolve, reject) => {
    const callback = async (err, signature) => {
      if (err) reject(err);

      if (signature.error) {
        reject(signature.error.message);
      }
      resolve(parseSignatureHex(signature.result));
      // // console.log(result);
      // const d = signature.result;
      // let v = d.slice(-2);
      // let r = d.slice(2, -66);
      // let s = d.slice(-66, -2);

      // let actualsignature = v + r + s + '03';

      // // const dhs = await this.contractInstace.methods
      // //   .setApprovalForAll(OPERATOR_ADDRESS, true)
      // //   .send({ from: this.metamask.metaMaskAddress });
      // resolve(`0x${actualsignature}`);
    };
    // console.log(orderHex, metaMaskAddress);
    provider.sendAsync(
      {
        method: "personal_sign",
        params: [message, signerAddress],
        from: signerAddress,
      },
      callback
    );
  });
}
export async function signTypedDataAsync(provider, message, signerAddress) {
  let signature;
  console.log(signerAddress);
  return new Promise((resolve, reject) => {
    const callback = async (err, result) => {
      console.log(err);
      if (err) reject(err);
      if (result.error) {
        reject(result.error.message);
      }
      // eslint-disable-next-line prefer-promise-reject-errors
      if (result.error) return reject("ERROR", result);
      // console.log(result);
      // const d = result.result;

      // let v = d.slice(-2);
      // let r = d.slice(2, -66);
      // let s = d.slice(-66, -2);

      // let actualsignature = v + r + s + '03';
      resolve(parseSignatureHex(result.result));
    };
    const stringified = JSON.stringify({ ...message });

    try {
      // Using sign typed data V4 works with a stringified message, used by browser providers i.e. Metamask
      provider.sendAsync(
        {
          method: "eth_signTypedData_v4",
          params: [signerAddress, stringified],
          from: signerAddress,
          id: new Date().getTime(),
        },
        callback
      );
    } catch (error) {
      console.log(error);
      // Fallback to normal sign typed data for node providers, without using stringified message
      // https://github.com/coinbase/coinbase-wallet-sdk/issues/60
      provider.sendAsync(
        {
          method: "eth_signTypedData",
          params: [signerAddress, message],
          from: signerAddress,
          id: new Date().getTime(),
        },
        callback
      );
    }
  });
}
async function _authorizeOrder({ order, provider, nonce }) {
  // 2.2 Sign order flow
  const signerAddress = order.maker;
  // console.log(order, nonce);
  if (
    order.exchange ===
      wyvern2_2ConfigByNetwork.main.wyvernExchangeContractAddress &&
    order.hash
  ) {
    const message = order.hash;
    // v1
    return await personalSignAsync(provider, message, signerAddress);
  }
  // 2.3 Sign order flow using EIP-712

  // We need to manually specify each field because OS orders can contain unrelated data
  const orderForSigning = {
    maker: order.maker,
    exchange: order.exchange,
    taker: order.taker,
    makerRelayerFee: order.makerRelayerFee.toString(),
    takerRelayerFee: order.takerRelayerFee.toString(),
    makerProtocolFee: order.makerProtocolFee.toString(),
    takerProtocolFee: order.takerProtocolFee.toString(),
    feeRecipient: order.feeRecipient,
    feeMethod: order.feeMethod,
    side: order.side,
    saleKind: order.saleKind,
    target: order.target,
    howToCall: order.howToCall,
    calldata: order.calldata,
    replacementPattern: order.replacementPattern,
    staticTarget: order.staticTarget,
    staticExtradata: order.staticExtradata,
    paymentToken: order.paymentToken,
    basePrice: order.basePrice.toString(),
    extra: order.extra.toString(),
    listingTime: order.listingTime.toString(),
    expirationTime: order.expirationTime.toString(),
    salt: order.salt.toString(),
  };

  // We don't JSON.stringify as certain wallet providers sanitize this data
  // https://github.com/coinbase/coinbase-wallet-sdk/issues/60
  const message = {
    types: EIP_712_ORDER_TYPES,
    domain: {
      name: EIP_712_WYVERN_DOMAIN_NAME,
      version: EIP_712_WYVERN_DOMAIN_VERSION,
      chainId: 1,
      verifyingContract: order.exchange,
    },
    primaryType: "Order",
    message: { ...orderForSigning, nonce },
  };
  const ecSignature = await signTypedDataAsync(
    provider,
    message,
    signerAddress
  );
  return { ...ecSignature, nonce };
}
/**
 * Convert an order to JSON, hashing it as well if necessary
 * @param order order (hashed or unhashed)
 */
const orderToJSON = (order) => {
  const asJSON = {
    exchange: order.exchange.toLowerCase(),
    maker: order.maker.toLowerCase(),
    taker: order.taker.toLowerCase(),
    makerRelayerFee: order.makerRelayerFee.toString(),
    takerRelayerFee: order.takerRelayerFee.toString(),
    makerProtocolFee: order.makerProtocolFee.toString(),
    takerProtocolFee: order.takerProtocolFee.toString(),
    makerReferrerFee: order.makerReferrerFee.toString(),
    feeMethod: order.feeMethod,
    feeRecipient: order.feeRecipient.toLowerCase(),
    side: order.side,
    saleKind: order.saleKind,
    target: order.target.toLowerCase(),
    howToCall: order.howToCall,
    calldata: order.calldata,
    replacementPattern: order.replacementPattern,
    staticTarget: order.staticTarget.toLowerCase(),
    staticExtradata: order.staticExtradata,
    paymentToken: order.paymentToken.toLowerCase(),
    quantity: order.quantity.toString(),
    basePrice: order.basePrice.toString(),
    englishAuctionReservePrice: order.englishAuctionReservePrice
      ? order.englishAuctionReservePrice.toString()
      : undefined,
    extra: order.extra.toString(),
    createdTime: order.createdTime ? order.createdTime.toString() : undefined,
    listingTime: order.listingTime.toString(),
    expirationTime: order.expirationTime.toString(),
    salt: order.salt.toString(),

    metadata: order.metadata,

    v: order.v,
    r: order.r,
    s: order.s,
    nonce: order.nonce,
  };
  return asJSON;
};
async function postOrder(order, retries = 2) {
  try {
    const { data } = await axios.post(
      `https://api.opensea.io/wyvern/v1/orders/post/`,
      order,
      {
        headers: {
          "x-api-key": X_API_KEY,
        },
      }
    );
    return data;
  } catch (error) {
    throw new Error(error);
  }
}
/**
 * Convert an order to JSON for golom, hashing it as well if necessary
 * @param order order (hashed or unhashed)
 */
const orderToGolomJSON = (order) => {
  const asJSON = {
    exchange: order.exchange.toLowerCase(),
    maker: { address: order.maker.toLowerCase() },
    taker: { address: order.taker.toLowerCase() },
    maker_relayer_fee: order.makerRelayerFee.toString(),
    taker_relayer_fee: order.takerRelayerFee.toString(),
    maker_protocol_fee: order.makerProtocolFee.toString(),
    taker_protocol_fee: order.takerProtocolFee.toString(),
    makerReferrerFee: order.makerReferrerFee.toString(),
    fee_method: order.feeMethod,
    fee_recipient: { address: order.feeRecipient.toLowerCase() },
    side: order.side,
    sale_kind: order.saleKind,
    target: order.target.toLowerCase(),
    how_to_call: order.howToCall,
    calldata: order.calldata,
    replacement_pattern: order.replacementPattern,
    static_target: order.staticTarget.toLowerCase(),
    static_extradata: order.staticExtradata,
    payment_token: order.paymentToken.toLowerCase(),
    quantity: order.quantity.toString(),
    base_price: order.basePrice.toString(),
    englishAuctionReservePrice: order.englishAuctionReservePrice
      ? order.englishAuctionReservePrice.toString()
      : undefined,
    extra: order.extra.toString(),
    createdTime: order.createdTime ? order.createdTime.toString() : undefined,
    listing_time: order.listingTime.toString(),
    expiration_time: order.expirationTime.toString(),
    salt: order.salt.toString(),
    metadata: order.metadata,
    v: order.v,
    r: order.r,
    s: order.s,
    prefixed_hash: order.hash,
  };
  return asJSON;
};
/**
 * Validate and post an order to the OpenSea orderbook.
 * @param order The order to post. Can either be signed by the maker or pre-approved on the Wyvern contract using approveOrder. See https://github.com/ProjectWyvern/wyvern-ethereum/blob/master/contracts/exchange/Exchange.sol#L178
 * @returns The order as stored by the orderbook
 */
async function validateAndPostOrder({ order, platform }) {
  // Validation is called server-side

  return platform == PlatformType.Opensea
    ? orderToJSON(order)
    : orderToGolomJSON(order);
}

function cancelOSOrder({ provider, order }) {
  const wyvernExchange = WyvernContract(provider);
  // const cancelHash = wyvernExchange.methods
  //   .hashToSign_(
  //     [
  //       order.exchange,
  //       order.maker,
  //       order.taker,
  //       order.feeRecipient,
  //       order.target,
  //       order.staticTarget,
  //       order.paymentToken
  //     ],
  //     [
  //       order.makerRelayerFee,
  //       order.takerRelayerFee,
  //       order.makerProtocolFee,
  //       order.takerProtocolFee,
  //       order.basePrice,
  //       order.extra,
  //       order.listingTime,
  //       order.expirationTime,
  //       order.salt
  //     ],
  //     order.feeMethod,
  //     order.side,
  //     order.saleKind,
  //     order.howToCall,
  //     order.calldata,
  //     order.replacementPattern,
  //     order.staticExtradata
  //   )
  //   .call();
  // console.log(cancelHash);
  return wyvernExchange.methods.cancelOrder_(
    [
      order.exchange,
      order.maker,
      order.taker,
      order.feeRecipient,
      order.target,
      order.staticTarget,
      order.paymentToken,
    ],
    [
      order.makerRelayerFee,
      order.takerRelayerFee,
      order.makerProtocolFee,
      order.takerProtocolFee,
      order.basePrice,
      order.extra,
      order.listingTime,
      order.expirationTime,
      order.salt,
    ],
    order.feeMethod,
    order.side,
    order.saleKind,
    order.howToCall,
    order.calldata,
    order.replacementPattern,
    order.staticExtradata,
    order.v || 0,
    order.r || NULL_BLOCK_HASH,
    order.s || NULL_BLOCK_HASH
  );
}

async function createSellOrder({
  provider,
  asset,
  accountAddress,
  startAmount,
  endAmount,
  quantity = 1,
  listingTime,
  expirationTime = 0,
  waitForHighestBid = false,
  englishAuctionReservePrice,
  paymentTokenAddress,
  extraBountyBasisPoints = 0,
  buyerAddress,
  fees,
  platform = PlatformType.Opensea,
  buyerEmail,
}) {
  const order = await _makeSellOrder({
    asset,
    quantity,
    accountAddress,
    startAmount,
    endAmount,
    listingTime,
    expirationTime,
    waitForHighestBid,
    englishAuctionReservePrice,
    paymentTokenAddress: paymentTokenAddress || NULL_ADDRESS,
    extraBountyBasisPoints,
    platform,
    openSeaAsset: fees,
    buyerAddress: buyerAddress || NULL_ADDRESS,
  });
  const wyvernExchange = WyvernContract(provider);
  await validateOrderParams({ order, accountAddress, wyvernExchange });

  const hashedOrder = {
    ...order,
    hash: getOrderHash(order),
  };
  const nonce = Number(
    await wyvernExchange.methods.nonces(accountAddress).call()
  );
  let signature;
  try {
    signature = await _authorizeOrder({ provider, order: hashedOrder, nonce });
  } catch (error) {
    console.error(error);
    throw new Error("You declined to authorize your auction");
  }
  const orderWithSignature = {
    ...hashedOrder,
    ...signature,
  };
  return validateAndPostOrder({ order: orderWithSignature, platform });
}

export { fulfillOrder, createSellOrder, cancelOSOrder };

// maker:
// 0xafac92864611c564e7fa1a6c6d07b45807536943
// exchange:
// 0x7f268357a8c2552623316e2562d90e642bb538e5
// taker:
// 0x0000000000000000000000000000000000000000
// makerRelayerFee:
// 500
// takerRelayerFee:
// 0
// makerProtocolFee:
// 0
// takerProtocolFee:
// 0
// feeRecipient:
// 0x5b3256965e7c3cf26e11fcaf296dfc8807c01073
// feeMethod:
// 1
// side:
// 1
// saleKind:
// 0
// target:
// 0xbaf2127b49fc93cbca6269fade0f7f31df4c88a7
// howToCall:
// 1
// calldata:
// 0xfb16a595000000000000000000000000afac92864611c564e7fa1a6c6d07b45807536943000000000000000000000000000000000000000000000000000000000000000000000000000000000000000079fcdef22feed20eddacbb2587640e45491b757f0000000000000000000000000000000000000000000000000000000000000eb5000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000c00000000000000000000000000000000000000000000000000000000000000000
// replacementPattern:
// 0x000000000000000000000000000000000000000000000000000000000000000000000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// staticTarget:
// 0x0000000000000000000000000000000000000000
// staticExtradata:
// 0x
// paymentToken:
// 0x0000000000000000000000000000000000000000
// basePrice:
// 6000000000000000000
// extra:
// 0
// listingTime:
// 1645298828
// expirationTime:
// 1645903716
// salt:
// 87906966303110818969546189067137492865825614986988195802067881988151729727179
// nonce:
// 0

// basePrice: "6000000000000000000"
// calldata: "0xfb16a595000000000000000000000000afac92864611c564e7fa1a6c6d07b45807536943000000000000000000000000000000000000000000000000000000000000000000000000000000000000000079fcdef22feed20eddacbb2587640e45491b757f0000000000000000000000000000000000000000000000000000000000000eb5000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000c00000000000000000000000000000000000000000000000000000000000000000"
// exchange: "0x7f268357a8c2552623316e2562d90e642bb538e5"
// expirationTime: "1645903716"
// extra: "0"
// feeMethod: 1
// feeRecipient: "0x5b3256965e7c3cf26e11fcaf296dfc8807c01073"
// howToCall: 1
// listingTime: "1645298816"
// maker: "0xafac92864611c564e7fa1a6c6d07b45807536943"
// makerProtocolFee: "0"
// makerReferrerFee: "0"
// makerRelayerFee: "500"
// metadata: {asset: {id: "3765", address: "0x79fcdef22feed20eddacbb2587640e45491b757f"}, schema: "ERC721"}
// nonce: 0
// paymentToken: "0x0000000000000000000000000000000000000000"
// quantity: "1"
// r: "0x0c70bd3052b0da178141b84e7bdbe511acc5f7f601281850cd5f93f145c9bbb5"
// replacementPattern: "0x000000000000000000000000000000000000000000000000000000000000000000000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"
// s: "0x7a2bf43b7b616073bf2486d2890b674f9587f68f59a84e4d7fff55842bbe9b60"
// saleKind: 0
// salt: "87577974536160270209585191401103724053896633202437364720132507693990122512257"
// side: 1
// staticExtradata: "0x"
// staticTarget: "0x0000000000000000000000000000000000000000"
// taker: "0x0000000000000000000000000000000000000000"
// takerProtocolFee: "0"
// takerRelayerFee: "0"
// target: "0xbaf2127b49fc93cbca6269fade0f7f31df4c88a7"
// v: 28

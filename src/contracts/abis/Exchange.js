export default [
  {
    inputs: [],
    stateMutability: 'nonpayable',
    type: 'constructor'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'maker',
        type: 'address'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'newNonce',
        type: 'uint256'
      }
    ],
    name: 'NonceIncremented',
    type: 'event'
  },
  {
    stateMutability: 'payable',
    type: 'fallback'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'leaf',
        type: 'uint256'
      },
      {
        internalType: 'bytes32',
        name: 'root',
        type: 'bytes32'
      },
      {
        internalType: 'bytes32[]',
        name: 'proof',
        type: 'bytes32[]'
      }
    ],
    name: '_verifyProof',
    outputs: [],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'collection',
            type: 'address'
          },
          {
            internalType: 'uint256',
            name: 'tokenId',
            type: 'uint256'
          },
          {
            internalType: 'address',
            name: 'signer',
            type: 'address'
          },
          {
            internalType: 'uint256',
            name: 'orderType',
            type: 'uint256'
          },
          {
            internalType: 'uint256',
            name: 'totalAmt',
            type: 'uint256'
          },
          {
            components: [
              {
                internalType: 'uint256',
                name: 'paymentAmt',
                type: 'uint256'
              },
              {
                internalType: 'address',
                name: 'paymentAddress',
                type: 'address'
              }
            ],
            internalType: 'struct Molotrader.Payment',
            name: 'exchange',
            type: 'tuple'
          },
          {
            components: [
              {
                internalType: 'uint256',
                name: 'paymentAmt',
                type: 'uint256'
              },
              {
                internalType: 'address',
                name: 'paymentAddress',
                type: 'address'
              }
            ],
            internalType: 'struct Molotrader.Payment',
            name: 'prePayment',
            type: 'tuple'
          },
          {
            internalType: 'bool',
            name: 'isERC721',
            type: 'bool'
          },
          {
            internalType: 'uint256',
            name: 'tokenAmt',
            type: 'uint256'
          },
          {
            internalType: 'uint256',
            name: 'refererrAmt',
            type: 'uint256'
          },
          {
            internalType: 'bytes32',
            name: 'root',
            type: 'bytes32'
          },
          {
            internalType: 'address',
            name: 'reservedAddress',
            type: 'address'
          },
          {
            internalType: 'uint256',
            name: 'nonce',
            type: 'uint256'
          },
          {
            internalType: 'uint256',
            name: 'deadline',
            type: 'uint256'
          },
          {
            internalType: 'uint8',
            name: 'v',
            type: 'uint8'
          },
          {
            internalType: 'bytes32',
            name: 'r',
            type: 'bytes32'
          },
          {
            internalType: 'bytes32',
            name: 's',
            type: 'bytes32'
          }
        ],
        internalType: 'struct Molotrader.Order',
        name: 'o',
        type: 'tuple'
      }
    ],
    name: 'cancelOrder',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'distributor',
    outputs: [
      {
        internalType: 'contract Distributor',
        name: '',
        type: 'address'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'collection',
            type: 'address'
          },
          {
            internalType: 'uint256',
            name: 'tokenId',
            type: 'uint256'
          },
          {
            internalType: 'address',
            name: 'signer',
            type: 'address'
          },
          {
            internalType: 'uint256',
            name: 'orderType',
            type: 'uint256'
          },
          {
            internalType: 'uint256',
            name: 'totalAmt',
            type: 'uint256'
          },
          {
            components: [
              {
                internalType: 'uint256',
                name: 'paymentAmt',
                type: 'uint256'
              },
              {
                internalType: 'address',
                name: 'paymentAddress',
                type: 'address'
              }
            ],
            internalType: 'struct Molotrader.Payment',
            name: 'exchange',
            type: 'tuple'
          },
          {
            components: [
              {
                internalType: 'uint256',
                name: 'paymentAmt',
                type: 'uint256'
              },
              {
                internalType: 'address',
                name: 'paymentAddress',
                type: 'address'
              }
            ],
            internalType: 'struct Molotrader.Payment',
            name: 'prePayment',
            type: 'tuple'
          },
          {
            internalType: 'bool',
            name: 'isERC721',
            type: 'bool'
          },
          {
            internalType: 'uint256',
            name: 'tokenAmt',
            type: 'uint256'
          },
          {
            internalType: 'uint256',
            name: 'refererrAmt',
            type: 'uint256'
          },
          {
            internalType: 'bytes32',
            name: 'root',
            type: 'bytes32'
          },
          {
            internalType: 'address',
            name: 'reservedAddress',
            type: 'address'
          },
          {
            internalType: 'uint256',
            name: 'nonce',
            type: 'uint256'
          },
          {
            internalType: 'uint256',
            name: 'deadline',
            type: 'uint256'
          },
          {
            internalType: 'uint8',
            name: 'v',
            type: 'uint8'
          },
          {
            internalType: 'bytes32',
            name: 'r',
            type: 'bytes32'
          },
          {
            internalType: 'bytes32',
            name: 's',
            type: 'bytes32'
          }
        ],
        internalType: 'struct Molotrader.Order',
        name: 'o',
        type: 'tuple'
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256'
      },
      {
        internalType: 'address',
        name: 'referrer',
        type: 'address'
      },
      {
        components: [
          {
            internalType: 'uint256',
            name: 'paymentAmt',
            type: 'uint256'
          },
          {
            internalType: 'address',
            name: 'paymentAddress',
            type: 'address'
          }
        ],
        internalType: 'struct Molotrader.Payment',
        name: 'p',
        type: 'tuple'
      }
    ],
    name: 'fillAsk',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'collection',
            type: 'address'
          },
          {
            internalType: 'uint256',
            name: 'tokenId',
            type: 'uint256'
          },
          {
            internalType: 'address',
            name: 'signer',
            type: 'address'
          },
          {
            internalType: 'uint256',
            name: 'orderType',
            type: 'uint256'
          },
          {
            internalType: 'uint256',
            name: 'totalAmt',
            type: 'uint256'
          },
          {
            components: [
              {
                internalType: 'uint256',
                name: 'paymentAmt',
                type: 'uint256'
              },
              {
                internalType: 'address',
                name: 'paymentAddress',
                type: 'address'
              }
            ],
            internalType: 'struct Molotrader.Payment',
            name: 'exchange',
            type: 'tuple'
          },
          {
            components: [
              {
                internalType: 'uint256',
                name: 'paymentAmt',
                type: 'uint256'
              },
              {
                internalType: 'address',
                name: 'paymentAddress',
                type: 'address'
              }
            ],
            internalType: 'struct Molotrader.Payment',
            name: 'prePayment',
            type: 'tuple'
          },
          {
            internalType: 'bool',
            name: 'isERC721',
            type: 'bool'
          },
          {
            internalType: 'uint256',
            name: 'tokenAmt',
            type: 'uint256'
          },
          {
            internalType: 'uint256',
            name: 'refererrAmt',
            type: 'uint256'
          },
          {
            internalType: 'bytes32',
            name: 'root',
            type: 'bytes32'
          },
          {
            internalType: 'address',
            name: 'reservedAddress',
            type: 'address'
          },
          {
            internalType: 'uint256',
            name: 'nonce',
            type: 'uint256'
          },
          {
            internalType: 'uint256',
            name: 'deadline',
            type: 'uint256'
          },
          {
            internalType: 'uint8',
            name: 'v',
            type: 'uint8'
          },
          {
            internalType: 'bytes32',
            name: 'r',
            type: 'bytes32'
          },
          {
            internalType: 'bytes32',
            name: 's',
            type: 'bytes32'
          }
        ],
        internalType: 'struct Molotrader.Order',
        name: 'o',
        type: 'tuple'
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256'
      },
      {
        internalType: 'address',
        name: 'referrer',
        type: 'address'
      },
      {
        components: [
          {
            internalType: 'uint256',
            name: 'paymentAmt',
            type: 'uint256'
          },
          {
            internalType: 'address',
            name: 'paymentAddress',
            type: 'address'
          }
        ],
        internalType: 'struct Molotrader.Payment',
        name: 'p',
        type: 'tuple'
      }
    ],
    name: 'fillBid',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'collection',
            type: 'address'
          },
          {
            internalType: 'uint256',
            name: 'tokenId',
            type: 'uint256'
          },
          {
            internalType: 'address',
            name: 'signer',
            type: 'address'
          },
          {
            internalType: 'uint256',
            name: 'orderType',
            type: 'uint256'
          },
          {
            internalType: 'uint256',
            name: 'totalAmt',
            type: 'uint256'
          },
          {
            components: [
              {
                internalType: 'uint256',
                name: 'paymentAmt',
                type: 'uint256'
              },
              {
                internalType: 'address',
                name: 'paymentAddress',
                type: 'address'
              }
            ],
            internalType: 'struct Molotrader.Payment',
            name: 'exchange',
            type: 'tuple'
          },
          {
            components: [
              {
                internalType: 'uint256',
                name: 'paymentAmt',
                type: 'uint256'
              },
              {
                internalType: 'address',
                name: 'paymentAddress',
                type: 'address'
              }
            ],
            internalType: 'struct Molotrader.Payment',
            name: 'prePayment',
            type: 'tuple'
          },
          {
            internalType: 'bool',
            name: 'isERC721',
            type: 'bool'
          },
          {
            internalType: 'uint256',
            name: 'tokenAmt',
            type: 'uint256'
          },
          {
            internalType: 'uint256',
            name: 'refererrAmt',
            type: 'uint256'
          },
          {
            internalType: 'bytes32',
            name: 'root',
            type: 'bytes32'
          },
          {
            internalType: 'address',
            name: 'reservedAddress',
            type: 'address'
          },
          {
            internalType: 'uint256',
            name: 'nonce',
            type: 'uint256'
          },
          {
            internalType: 'uint256',
            name: 'deadline',
            type: 'uint256'
          },
          {
            internalType: 'uint8',
            name: 'v',
            type: 'uint8'
          },
          {
            internalType: 'bytes32',
            name: 'r',
            type: 'bytes32'
          },
          {
            internalType: 'bytes32',
            name: 's',
            type: 'bytes32'
          }
        ],
        internalType: 'struct Molotrader.Order',
        name: 'o',
        type: 'tuple'
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256'
      },
      {
        internalType: 'bytes32[]',
        name: 'proof',
        type: 'bytes32[]'
      },
      {
        internalType: 'address',
        name: 'referrer',
        type: 'address'
      },
      {
        components: [
          {
            internalType: 'uint256',
            name: 'paymentAmt',
            type: 'uint256'
          },
          {
            internalType: 'address',
            name: 'paymentAddress',
            type: 'address'
          }
        ],
        internalType: 'struct Molotrader.Payment',
        name: 'p',
        type: 'tuple'
      }
    ],
    name: 'fillCriteriaBid',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'incrementNonce',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address'
      }
    ],
    name: 'nonces',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_distributor',
        type: 'address'
      }
    ],
    name: 'setDistributor',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'collection',
            type: 'address'
          },
          {
            internalType: 'uint256',
            name: 'tokenId',
            type: 'uint256'
          },
          {
            internalType: 'address',
            name: 'signer',
            type: 'address'
          },
          {
            internalType: 'uint256',
            name: 'orderType',
            type: 'uint256'
          },
          {
            internalType: 'uint256',
            name: 'totalAmt',
            type: 'uint256'
          },
          {
            components: [
              {
                internalType: 'uint256',
                name: 'paymentAmt',
                type: 'uint256'
              },
              {
                internalType: 'address',
                name: 'paymentAddress',
                type: 'address'
              }
            ],
            internalType: 'struct Molotrader.Payment',
            name: 'exchange',
            type: 'tuple'
          },
          {
            components: [
              {
                internalType: 'uint256',
                name: 'paymentAmt',
                type: 'uint256'
              },
              {
                internalType: 'address',
                name: 'paymentAddress',
                type: 'address'
              }
            ],
            internalType: 'struct Molotrader.Payment',
            name: 'prePayment',
            type: 'tuple'
          },
          {
            internalType: 'bool',
            name: 'isERC721',
            type: 'bool'
          },
          {
            internalType: 'uint256',
            name: 'tokenAmt',
            type: 'uint256'
          },
          {
            internalType: 'uint256',
            name: 'refererrAmt',
            type: 'uint256'
          },
          {
            internalType: 'bytes32',
            name: 'root',
            type: 'bytes32'
          },
          {
            internalType: 'address',
            name: 'reservedAddress',
            type: 'address'
          },
          {
            internalType: 'uint256',
            name: 'nonce',
            type: 'uint256'
          },
          {
            internalType: 'uint256',
            name: 'deadline',
            type: 'uint256'
          },
          {
            internalType: 'uint8',
            name: 'v',
            type: 'uint8'
          },
          {
            internalType: 'bytes32',
            name: 'r',
            type: 'bytes32'
          },
          {
            internalType: 'bytes32',
            name: 's',
            type: 'bytes32'
          }
        ],
        internalType: 'struct Molotrader.Order',
        name: 'o',
        type: 'tuple'
      }
    ],
    name: 'validateOrder',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256'
      },
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32'
      },
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  }
];

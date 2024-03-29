export default [
  { inputs: [], stateMutability: 'nonpayable', type: 'constructor' },
  {
    anonymous: false,
    inputs: [{ indexed: true, internalType: 'bytes32', name: 'id', type: 'bytes32' }],
    name: 'Offercancelled',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'from', type: 'address' },
      { indexed: true, internalType: 'address', name: 'to', type: 'address' },
      { indexed: true, internalType: 'bytes32', name: 'id', type: 'bytes32' },
      { indexed: false, internalType: 'uint256', name: 'amt', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'feeAmt', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'royaltyAmt', type: 'uint256' },
      { indexed: false, internalType: 'address', name: 'royaltyAddress', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'isany', type: 'uint256' }
    ],
    name: 'Offerfilled',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [{ indexed: true, internalType: 'bytes32', name: 'id', type: 'bytes32' }],
    name: 'Ordercancelled',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'from', type: 'address' },
      { indexed: true, internalType: 'address', name: 'to', type: 'address' },
      { indexed: true, internalType: 'bytes32', name: 'id', type: 'bytes32' },
      { indexed: false, internalType: 'uint256', name: 'amt', type: 'uint256' },
      { indexed: false, internalType: 'address', name: 'referrer', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'feeAmt', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'royaltyAmt', type: 'uint256' },
      { indexed: false, internalType: 'address', name: 'royaltyAddress', type: 'address' },
      { indexed: false, internalType: 'address', name: 'buyerAddress', type: 'address' }
    ],
    name: 'Orderfilled',
    type: 'event'
  },
  {
    inputs: [
      { internalType: 'address[3]', name: '_addressArgs', type: 'address[3]' },
      { internalType: 'uint256[7]', name: '_uintArgs', type: 'uint256[7]' }
    ],
    name: 'cancelOffer',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address[5]', name: '_addressArgs', type: 'address[5]' },
      { internalType: 'uint256[6]', name: '_uintArgs', type: 'uint256[6]' }
    ],
    name: 'cancelOrder',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'uint8', name: 'v', type: 'uint8' },
      { internalType: 'bytes32', name: 'r', type: 'bytes32' },
      { internalType: 'bytes32', name: 's', type: 'bytes32' },
      { internalType: 'address[3]', name: '_addressArgs', type: 'address[3]' },
      { internalType: 'uint256[7]', name: '_uintArgs', type: 'uint256[7]' }
    ],
    name: 'matchOffer',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'uint8', name: 'v', type: 'uint8' },
      { internalType: 'bytes32', name: 'r', type: 'bytes32' },
      { internalType: 'bytes32', name: 's', type: 'bytes32' },
      { internalType: 'address[5]', name: '_addressArgs', type: 'address[5]' },
      { internalType: 'uint256[6]', name: '_uintArgs', type: 'uint256[6]' }
    ],
    name: 'matchOrder',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address[3]', name: '_addressArgs', type: 'address[3]' },
      { internalType: 'uint256[7]', name: '_uintArgs', type: 'uint256[7]' }
    ],
    name: 'offerHash',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'pure',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'uint8', name: 'v', type: 'uint8' },
      { internalType: 'bytes32', name: 'r', type: 'bytes32' },
      { internalType: 'bytes32', name: 's', type: 'bytes32' },
      { internalType: 'address[3]', name: '_addressArgs', type: 'address[3]' },
      { internalType: 'uint256[7]', name: '_uintArgs', type: 'uint256[7]' }
    ],
    name: 'offerStatus',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    name: 'offerhashes',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address[5]', name: '_addressArgs', type: 'address[5]' },
      { internalType: 'uint256[6]', name: '_uintArgs', type: 'uint256[6]' }
    ],
    name: 'orderHash',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'pure',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'uint8', name: 'v', type: 'uint8' },
      { internalType: 'bytes32', name: 'r', type: 'bytes32' },
      { internalType: 'bytes32', name: 's', type: 'bytes32' },
      { internalType: 'address[5]', name: '_addressArgs', type: 'address[5]' },
      { internalType: 'uint256[6]', name: '_uintArgs', type: 'uint256[6]' }
    ],
    name: 'orderStatus',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    name: 'orderhashes',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  }
];

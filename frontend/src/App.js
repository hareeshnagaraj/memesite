import React, { useState } from "react";
import { Contract } from "ethers";
import { JsonRpcProvider } from "ethers/providers";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_projects",
        type: "address",
      },
      {
        internalType: "bytes32",
        name: "_projectId",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "_withdrawalAddress",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "subProjectId",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "escrow",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "bytes",
        name: "castHash",
        type: "bytes",
      },
    ],
    name: "SubProjectCreated",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "tokenAddress",
        type: "address",
      },
      {
        internalType: "address",
        name: "caster",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "escrowAmount",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "castHash",
        type: "bytes",
      },
    ],
    name: "createProject",
    outputs: [
      {
        internalType: "bytes32",
        name: "subProjectId",
        type: "bytes32",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "projectId",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "projects",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    name: "subProjects",
    outputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "escrow",
        type: "uint256",
      },
      {
        internalType: "bytes32",
        name: "subProjectId",
        type: "bytes32",
      },
      {
        internalType: "bytes",
        name: "castHash",
        type: "bytes",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "withdrawTokens",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "withdrawalAddress",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
]

const App = () => {
  const [address, setAddress] = useState("0x532f27101965dd16442e59d40670faf5ebb142e4");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const projectContractAddress = process.env.REACT_APP_PROJECT_CONTRACT_ADDRESS;

  const fetchTokenData = async () => {
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      alert("Invalid Ethereum address.");
      return;
    }

    setLoading(true);
    setData(null);

    console.log("initializing...now")
    const provider = new JsonRpcProvider(process.env.REACT_APP_L2_RPC_URL);
    console.log("initialized provider")
    const ERC20_ABI = [
      "function symbol() view returns (string)",
      "function decimals() view returns (uint8)",
    ];

    try {
      const testContract = new Contract(projectContractAddress, _abi, provider);
      console.log(testContract);

    } catch (error) {
      console.error("Error fetching project data:", error);
    }
    try {
      const tokenContract = new Contract(address, ERC20_ABI, provider);

      const [symbol, decimals] = await Promise.all([
        tokenContract.symbol(),
        tokenContract.decimals(),
      ]);

      const requestString = `https://api.coingecko.com/api/v3/coins/base/contract/${address}`;
      console.log(requestString);
      const response = await fetch(requestString);
      console.log(`response loaded ${JSON.stringify(response)}`);
      const tokenData = await response.json();
      const priceUSD = tokenData.market_data?.current_price?.usd || "N/A";
      const imageUrl = tokenData.image?.small || null;


      setData({ 
        symbol, 
        decimals, 
        priceUSD,
        imageUrl 
      });
    } catch (error) {
      console.error("Error fetching token data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Memecoin Explorer</h1>
      <div>
        <input 
          value={address} 
          onChange={(e) => setAddress(e.target.value)} 
          placeholder="Enter token address..."
        />
        <button onClick={fetchTokenData}>Fetch</button>
      </div>
      {data && (
        <div className="token-info">
          {data.imageUrl && (
            <img 
              src={data.imageUrl} 
              alt={`${data.symbol} logo`} 
              style={{ width: '64px', height: '64px' }}
            />
          )}
          <p>Symbol: {data.symbol}</p>
          <p>Decimals: {data.decimals}</p>
          <p>Price (USD): ${data.priceUSD}</p>
        </div>
      )}
    </div>
  );
};

export default App;

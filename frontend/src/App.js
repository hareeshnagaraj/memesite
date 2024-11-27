import React, { useState } from "react";
import { Contract } from "ethers";
import { JsonRpcProvider } from "ethers/providers";

const App = () => {
  const [address, setAddress] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

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
      const tokenContract = new Contract(address, ERC20_ABI, provider);

      const [symbol, decimals] = await Promise.all([
        tokenContract.symbol(),
        tokenContract.decimals(),
      ]);

      const requestString = `https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${address}&vs_currencies=usd`
      console.log(requestString)
      const response = await fetch(requestString);
      console.log(`response loaded ${JSON.stringify(response)}`)
      const priceData = await response.json();
      const priceUSD = priceData[address.toLowerCase()]?.usd || "N/A";

      setData({ symbol, decimals, priceUSD });
    } catch (error) {
      console.error("Error fetching token data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Memecoin App</h1>
      <input value={address} onChange={(e) => setAddress(e.target.value)} />
      <button onClick={fetchTokenData}>Fetch</button>
      {data && (
        <div>
          <p>Symbol: {data.symbol}</p>
          <p>Decimals: {data.decimals}</p>
          <p>Price (USD): {data.priceUSD}</p>
        </div>
      )}
    </div>
  );
};

export default App;

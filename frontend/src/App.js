import React, { useState } from "react";
import { Contract } from "ethers";
import { JsonRpcProvider } from "ethers/providers";

const App = () => {
  // BRETT is our default
  const [address, setAddress] = useState("0x532f27101965dd16442e59d40670faf5ebb142e4");
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
    <div>
      <h1>Memecoin App</h1>
      <input value={address} onChange={(e) => setAddress(e.target.value)} />
      <button onClick={fetchTokenData}>Fetch</button>
      {data && (
        <div>
          {data.imageUrl && (
            <img 
              src={data.imageUrl} 
              alt={`${data.symbol} logo`} 
              style={{ width: '32px', height: '32px', marginRight: '10px' }}
            />
          )}
          <p>Symbol: {data.symbol}</p>
          <p>Decimals: {data.decimals}</p>
          <p>Price (USD): {data.priceUSD}</p>
        </div>
      )}
    </div>
  );
};

export default App;

"use client";
import { useState, useEffect } from 'react';
import { parseEther } from 'viem';
import { publicClient, getWalletClient } from '@/lib/client';

const REGISTRY_ABI = [{
  name: 'getProfile',
  type: 'function',
  stateMutability: 'view',
  inputs: [{ name: '_user', type: 'address' }],
  outputs: [{ name: 'username', type: 'string' }, { name: 'metadataCID', type: 'string' }],
}] as const;

const SPLITTER_ABI = [{
  name: 'supportCreator',
  type: 'function',
  stateMutability: 'payable',
  inputs: [{ name: '_creator', type: 'address' }],
  outputs: [],
}] as const;

interface PostProps {
  post: {
    author: `0x${string}`;
    content: string;
    imageCID: string;
    timestamp: bigint;
  };
  userAccount: string;
}

export default function VentureCard({ post, userAccount }: PostProps) {
  const [authorHandle, setAuthorHandle] = useState<string>('anonymous');
  const [amount, setAmount] = useState<string>("10"); // Default to 10
  const [isInvesting, setIsInvesting] = useState(false);

  useEffect(() => {
    const getHandle = async () => {
      try {
        const result = await publicClient.readContract({
          address: process.env.NEXT_PUBLIC_REGISTRY_ADDR as `0x${string}`,
          abi: REGISTRY_ABI,
          functionName: 'getProfile',
          args: [post.author],
        });
        if (result && result[0]) setAuthorHandle(result[0]);
      } catch (e) { console.error("Handle error"); }
    };
    getHandle();
  }, [post.author]);

  const investXDC = async () => {
    if (!amount || parseFloat(amount) <= 0) return alert("Enter an amount");
    setIsInvesting(true);
    try {
      const client = await getWalletClient();
      if (!client) return;

      const hash = await client.writeContract({
        address: process.env.NEXT_PUBLIC_SPLITTER_ADDR as `0x${string}`,
        abi: SPLITTER_ABI,
        functionName: 'supportCreator',
        args: [post.author],
        value: parseEther(amount), // Uses your custom input
        account: userAccount as `0x${string}`,
      });

      alert(`Sent ${amount} XDC to @${authorHandle}!`);
    } catch (e) { alert("Check balance and try again."); } 
    finally { setIsInvesting(false); }
  };

  return (
    <div className="bg-zinc-900 rounded-[2.5rem] border border-zinc-800 overflow-hidden shadow-2xl transition-all hover:border-zinc-700 mb-8">
      {/* Header */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-blue-400 rounded-full flex items-center justify-center font-black text-white">
          {authorHandle[0].toUpperCase()}
        </div>
        <div>
          <p className="text-white font-bold italic">@{authorHandle}</p>
          <p className="text-zinc-500 text-[10px] font-mono">{post.author.slice(0, 10)}...</p>
        </div>
      </div>

      {/* Image */}
      {post.imageCID && (
        <div className="w-full bg-black aspect-square overflow-hidden border-y border-zinc-800">
          <img 
            src={`https://gateway.pinata.cloud/ipfs/${post.imageCID}`} 
            className="w-full h-full object-cover" 
            alt="Content"
          />
        </div>
      )}

      {/* Footer & Custom Amount Input */}
      <div className="p-8">
        <p className="text-zinc-300 text-lg mb-8">{post.content}</p>

        <div className="flex gap-2 p-2 bg-black rounded-3xl border border-zinc-800">
          <input 
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="flex-1 bg-transparent pl-4 text-white font-bold outline-none"
            placeholder="Amount..."
          />
          <button 
            onClick={investXDC}
            disabled={isInvesting}
            className="bg-white text-black px-8 py-3 rounded-2xl font-black uppercase text-xs hover:bg-blue-600 hover:text-white transition-all"
          >
            {isInvesting ? "SENDING..." : "SUPPORT"}
          </button>
        </div>
        <p className="text-center text-[9px] text-zinc-600 mt-4 uppercase font-bold tracking-widest">
           95% to creator • 5% protocol fee
        </p>
      </div>
    </div>
  );
}
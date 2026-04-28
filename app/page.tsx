"use client";
import { useState, useEffect, useCallback } from 'react';
import { publicClient, getWalletClient } from '@/lib/client';
import ClaimHandle from '@/components/ClaimHandle';
import ProfileHeader from '@/components/ProfileHeader';
import CreatePost from '@/components/CreatePost';
import VentureCard from '@/components/VentureCard';

interface Post {
  id: bigint;
  author: `0x${string}`;
  content: string;
  mediaHash: string;
  totalInvested: bigint;
  timestamp: bigint;
}

export default function Home() {
  const [account, setAccount] = useState<string | null>(null);
  const [hasHandle, setHasHandle] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewedProfile, setViewedProfile] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // 1. Fetch Posts Logic
  const fetchPosts = useCallback(async () => {
    const postAddr = process.env.NEXT_PUBLIC_POSTS_ADDR;
    if (!postAddr || postAddr === '0x0000000000000000000000000000000000000000') return;
    
    try {
      const data = await publicClient.readContract({
        address: postAddr as `0x${string}`,
        abi: [{ name: 'getAllPosts', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'tuple[]', components: [{ name: 'id', type: 'uint256' }, { name: 'author', type: 'address' }, { name: 'content', type: 'string' }, { name: 'mediaHash', type: 'string' }, { name: 'totalInvested', type: 'uint256' }, { name: 'timestamp', type: 'uint256' }] }] }],
        functionName: 'getAllPosts',
      });
      setPosts([...(data as Post[])].reverse());
    } catch (e) {
      console.error("Feed error:", e);
    }
  }, []);

  // 2. Check Handle Logic
  const checkHandle = async (address: string) => {
    try {
      const profile = await publicClient.readContract({
        address: process.env.NEXT_PUBLIC_REGISTRY_ADDR as `0x${string}`,
        abi: [{ name: 'getProfile', type: 'function', stateMutability: 'view', inputs: [{ name: '_user', type: 'address' }], outputs: [{ name: 'username', type: 'string' }] }],
        functionName: 'getProfile',
        args: [address as `0x${string}`],
      }) as string;
      setHasHandle(!!profile);
    } catch (e) {
      setHasHandle(false);
    }
  };

  // 3. Manual Wallet Connection (Prevents silent blocking)
  const connectWallet = async () => {
    setIsConnecting(true);
    try {
      const client = await getWalletClient();
      if (!client) {
        alert("Please install a wallet like MetaMask!");
        return;
      }
      // Requesting addresses triggers the wallet popup
      const [addr] = await client.requestAddresses();
      if (addr) {
        setAccount(addr);
        await checkHandle(addr);
        await fetchPosts();
      }
    } catch (e) {
      console.error("Connection failed", e);
    } finally {
      setIsConnecting(false);
    }
  };

  // 4. Search & Portfolio Logic
  useEffect(() => {
    const searchHandle = async () => {
      if (!searchQuery) {
        setViewedProfile(null);
        return;
      }
      try {
        const addr = await publicClient.readContract({
          address: process.env.NEXT_PUBLIC_REGISTRY_ADDR as `0x${string}`,
          abi: [{ name: 'usernameToAddress', type: 'function', stateMutability: 'view', inputs: [{ name: '', type: 'string' }], outputs: [{ name: '', type: 'address' }] }],
          functionName: 'usernameToAddress',
          args: [searchQuery],
        }) as `0x${string}`;

        if (addr && addr !== '0x0000000000000000000000000000000000000000') {
          setViewedProfile(addr);
        }
      } catch (e) {
        console.error("Search error", e);
      }
    };
    const delay = setTimeout(searchHandle, 500);
    return () => clearTimeout(delay);
  }, [searchQuery]);

  // Load feed on mount
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const displayPosts = viewedProfile
    ? posts.filter(p => p.author.toLowerCase() === viewedProfile.toLowerCase())
    : posts;

  return (
    <main className="min-h-screen bg-black text-white p-6 pb-24">
      <div className="max-w-xl mx-auto">
        <header className="flex flex-col mb-12 gap-6">
          <div className="flex justify-between items-center">
            <h1 
              onClick={() => { setViewedProfile(null); setSearchQuery(""); }} 
              className="text-4xl font-black italic tracking-tighter cursor-pointer hover:opacity-80 transition-opacity"
            >
              HARD FORK
            </h1>
          </div>
          
          <div className="relative">
            <input 
              type="text"
              placeholder="Search creator handle..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 p-5 rounded-[2rem] text-white outline-none focus:border-blue-600 transition-all font-medium"
            />
          </div>
        </header>

        {!account ? (
          <button 
            onClick={connectWallet}
            disabled={isConnecting}
            className="w-full py-20 border-2 border-dashed border-zinc-800 rounded-[3rem] text-zinc-500 font-bold hover:border-blue-600 hover:text-blue-600 transition-all active:scale-[0.98]"
          >
            {isConnecting ? "Waking up Wallet..." : "Connect Wallet"}
          </button>
        ) : (
          <div className="space-y-8">
            {!viewedProfile ? (
               <>
                {hasHandle ? <ProfileHeader account={account} /> : <ClaimHandle account={account} onSuccess={() => checkHandle(account)} />}
                <CreatePost account={account} onSuccess={fetchPosts} />
               </>
            ) : (
              <div className="flex items-center justify-between mb-4">
                <button 
                  onClick={() => { setViewedProfile(null); setSearchQuery(""); }}
                  className="text-blue-500 font-black text-xs uppercase tracking-widest hover:text-white transition-all"
                >
                  ← Back to Main Feed
                </button>
                <span className="text-zinc-600 text-xs font-bold uppercase tracking-widest">
                  Viewing Portfolio
                </span>
              </div>
            )}

            <div className="space-y-8">
              {displayPosts.length > 0 ? (
                displayPosts.map((p, i) => (
                  <VentureCard key={i} post={{...p, imageCID: p.mediaHash}} userAccount={account} />
                ))
              ) : (
                <div className="text-center py-20 bg-zinc-900/50 rounded-[3rem] border border-dashed border-zinc-800 text-zinc-600 uppercase font-black text-sm tracking-widest">
                  {viewedProfile ? "This creator has no content" : "The feed is empty"}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
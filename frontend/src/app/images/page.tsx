'use client';
import React, { useState, useEffect } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { parseAbi } from 'viem';
import WalletConnect from '@/components/WalletConnect';
import VaultRetrievalForm from '@/components/VaultRetrievalForm';
import Link from 'next/link';

const VAULT_CONTRACT_ADDRESS = '0x6E5AfD22Fc36C3e5AD5B92df590534566A2ce4c6';
const VAULT_CONTRACT_ABI = parseAbi([
  "function getVaultStatus(bytes32 vaultId) external view returns (bool isOpen, uint unlockTime)",
  "function getPermittedWallets(bytes32 vaultId) external view returns (address[] memory)",
  "function getVaultCID(bytes32 vaultId) external view returns (string memory)" // NEW: Fetch IPFS CID
]);

export default function ImagesPage() {
  const { address } = useAccount();
  const [vaultId, setVaultId] = useState<`0x${string}`>('0x');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [images, setImages] = useState<string[]>([]); // NEW: Store retrieved images

  // Read vault status (EXISTING)
  const { 
    data: vaultStatus,
    refetch: refetchVaultStatus
  } = useReadContract({
    address: VAULT_CONTRACT_ADDRESS,
    abi: VAULT_CONTRACT_ABI,
    functionName: 'getVaultStatus',
    args: [vaultId],
    query: { enabled: false }
  });

  // Read permitted wallets (EXISTING)
  const { 
    data: permittedWallets,
    refetch: refetchPermittedWallets
  } = useReadContract({
    address: VAULT_CONTRACT_ADDRESS,
    abi: VAULT_CONTRACT_ABI,
    functionName: 'getPermittedWallets',
    args: [vaultId],
    query: { enabled: false }
  });

  // NEW: Fetch IPFS CID (NEW)
  const { 
    data: vaultCID,
    refetch: refetchVaultCID
  } = useReadContract({
    address: VAULT_CONTRACT_ADDRESS,
    abi: VAULT_CONTRACT_ABI,
    functionName: 'getVaultCID',
    args: [vaultId],
    query: { enabled: false }
  });

  // NEW: Fetch images from IPFS (NEW)
  const fetchImagesFromIPFS = async (cid: string) => {
    try {
      const response = await fetch(`https://ipfs.io/ipfs/${cid}`);
      const data = await response.json();
      setImages(data.images || []); // Assuming the CID points to a JSON with { images: [...] }
    } catch (err) {
      setError("Failed to fetch images from IPFS");
    }
  };

  // EXISTING: Handle vault status check (now also fetches CID)
  const handleGetVaultStatus = async () => {
    if (!vaultId || vaultId === '0x') {
      setError('Please enter a valid vault ID');
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      await Promise.all([
        refetchVaultStatus(),
        refetchPermittedWallets(),
        refetchVaultCID() // NEW: Also fetch CID
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch vault status');
    } finally {
      setIsLoading(false);
    }
  };

  // NEW: When CID is available, fetch images
  useEffect(() => {
    if (vaultCID) {
      fetchImagesFromIPFS(vaultCID);
    }
  }, [vaultCID]);

  // EXISTING: Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // EXISTING: Format time remaining
  const formatTimeRemaining = (unlockTime: number) => {
    const now = Date.now();
    const diff = unlockTime * 1000 - now;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    const hours = Math.ceil(diff / (1000 * 60 * 60));
    
    if (days > 30) {
      const months = Math.floor(days / 30);
      return `${months} month${months > 1 ? 's' : ''} remaining`;
    } else if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} remaining`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} remaining`;
    } else {
      return 'Unlocked now';
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* EXISTING: Header/Navigation */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <Link 
            href="/"
            className="flex items-center px-4 py-2.5 bg-white text-indigo-600 rounded-lg shadow-sm hover:bg-indigo-50 transition-all duration-200 border border-indigo-100 hover:shadow-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Home
          </Link>
          <div className="w-full sm:w-auto">
            <WalletConnect />
          </div>
        </div>

        {/* EXISTING: Main Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 transition-all hover:shadow-2xl">
          {/* EXISTING: Card Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-blue-500 p-6 text-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold">Time Capsule Vault</h1>
                <p className="opacity-90 mt-1">Secure your memories on the blockchain</p>
              </div>
            </div>
          </div>

          {/* EXISTING: Card Body */}
          <div className="p-6 md:p-8">
            {/* EXISTING: Vault ID Input Section */}
            <div className="mb-10">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Enter your Vault ID to check status
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={vaultId}
                    onChange={(e) => setVaultId(e.target.value as `0x${string}`)}
                    className="w-full px-5 py-3.5 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-700 placeholder-gray-400"
                    placeholder="0x1234...abcd"
                  />
                  {vaultId && vaultId !== '0x' && (
                    <button 
                      onClick={() => copyToClipboard(vaultId)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 text-gray-400 hover:text-indigo-600 transition-colors"
                      title="Copy to clipboard"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                    </button>
                  )}
                </div>
                <button
                  onClick={handleGetVaultStatus}
                  disabled={isLoading}
                  className="px-6 py-3.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors duration-200 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-lg min-w-[150px]"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Checking...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Check Status
                    </>
                  )}
                </button>
              </div>
              {copied && (
                <div className="mt-2 text-sm text-indigo-600 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Vault ID copied to clipboard!
                </div>
              )}
            </div>

            {/* EXISTING: Vault Status Display */}
            {vaultStatus && (
              <div className="mb-10">
                <h2 className="text-xl font-semibold mb-6 text-gray-800 border-b pb-2">Vault Information</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* EXISTING: Status Card */}
                  <div className="bg-gradient-to-br from-gray-50 to-white p-5 rounded-xl shadow-sm border border-gray-200 hover:border-indigo-200 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${vaultStatus[0] ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                        {vaultStatus[0] ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Current Status</h3>
                        <p className={`text-lg font-bold ${vaultStatus[0] ? 'text-green-600' : 'text-amber-600'}`}>
                          {vaultStatus[0] ? 'Vault Open' : 'Vault is Locked'}
                        </p>
                        <p className="mt-2 text-sm text-gray-600">
                          {vaultStatus[0] 
                            ? 'Your time capsule contents are now accessible'
                            : 'Your memories are securely locked until the unlock date'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* EXISTING: Unlock Time Card */}
                  <div className="bg-gradient-to-br from-gray-50 to-white p-5 rounded-xl shadow-sm border border-gray-200 hover:border-indigo-200 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Unlock Time</h3>
                        <p className="text-lg font-bold text-gray-800">
                          {new Date(Number(vaultStatus[1]) * 1000).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        <p className={`mt-2 text-sm font-medium ${vaultStatus[0] ? 'text-green-600' : 'text-blue-600'}`}>
                          {vaultStatus[0] 
                            ? 'Unlocked ' + formatTimeRemaining(Number(vaultStatus[1]))
                            : formatTimeRemaining(Number(vaultStatus[1]))}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          {/* Vault Retrieval Form Card */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Retrieve Your Vault</h2>
                <VaultRetrievalForm />
              </div>
              
            {/* NEW: Image Gallery (if vault is open & images exist) */}
            {vaultStatus?.[0] && images.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-6 text-gray-800 border-b pb-2">Your Memories</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {images.map((img, index) => (
                    <div key={index} className="rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                      <img 
                        src={img} 
                        alt={`Memory ${index + 1}`} 
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-3 bg-white">
                        <p className="text-sm text-gray-600">Memory #{index + 1}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* EXISTING: Permitted Wallets Display */}
            {permittedWallets && permittedWallets.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-6 text-gray-800 border-b pb-2">Authorized Access</h2>
                <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                  <div className="grid grid-cols-12 bg-gray-100 px-4 py-3 text-sm font-medium text-gray-700">
                    <div className="col-span-1">#</div>
                    <div className="col-span-9">Wallet Address</div>
                    <div className="col-span-2 text-right">Actions</div>
                  </div>
                  <ul className="divide-y divide-gray-200">
                    {permittedWallets.map((wallet, index) => (
                      <li key={index} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                        <div className="grid grid-cols-12 items-center">
                          <div className="col-span-1">
                            <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                              {index + 1}
                            </span>
                          </div>
                          <div className="col-span-9">
                            <code className="font-mono text-sm text-gray-700 break-all">
                              {wallet}
                            </code>
                          </div>
                          <div className="col-span-2 text-right">
                            <button 
                              onClick={() => copyToClipboard(wallet)}
                              className="p-1.5 text-gray-400 hover:text-indigo-600 transition-colors"
                              title="Copy address"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* EXISTING: Error Message */}
            {error && (
              <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg flex items-start gap-3">
                <div className="flex-shrink-0 pt-0.5">
                  <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-red-800">Error fetching vault data</h3>
                  <p className="text-sm text-red-700 mt-1">
                    {error}
                  </p>
                  <button 
                    onClick={() => setError(null)}
                    className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* EXISTING: Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Time Capsule Vault • Secure your memories on the blockchain</p>
        </div>
      </div>
    </main>
  );
}

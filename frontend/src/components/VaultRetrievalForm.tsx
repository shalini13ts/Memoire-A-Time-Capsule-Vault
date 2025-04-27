'use client';
import React, { useState } from 'react';
import { useWriteContract } from 'wagmi';
import Image from 'next/image';

export default function VaultRetrievalForm() {
  const { writeContractAsync } = useWriteContract();
  const [vaultId, setVaultId] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);

  const handleRetrieve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vaultId) return alert('Vault ID is required');
  
    try {
      const res = await fetch(`http://localhost:3001/vault/${vaultId}/tx`);
      if (!res.ok) throw new Error(await res.text());
  
      const txRequest = await res.json();
      const txHash = await writeContractAsync(txRequest);
  
      console.log('✅ Vault retrieved, txHash:', txHash);
      setStatus(`✅ Vault retrieved. [View on Etherscan](https://sepolia.etherscan.io/tx/${txHash})`);
  
      // Get list of CIDs from backend
      const cidRes = await fetch(`http://localhost:3001/vault/tx/${txHash}/cids`);
      const cids: string[] = await cidRes.json();
  
      const urls = cids.map(cid => `https://gateway.pinata.cloud/ipfs/${cid}`);
      setImages(urls);
    } catch (err) {
      console.error('❌ Retrieval failed:', err);
      setStatus('❌ Vault retrieval failed. Check console.');
    }
  }; 

  return (
    <form onSubmit={handleRetrieve} className="space-y-4 mt-8">
      <label htmlFor="vaultId" className="block text-sm font-medium text-gray-700">
        Vault ID
      </label>
      <input
        type="text"
        id="vaultId"
        value={vaultId}
        onChange={(e) => setVaultId(e.target.value)}
        className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm text-gray-900"
        placeholder="0x..."
        required
      />
      <button
        type="submit"
        className="w-full py-2 px-4 rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
      >
        Retrieve Vault
      </button>
      {status && (
        <div className="mt-4 text-sm text-gray-700 bg-gray-50 p-4 rounded border break-words">
          <p><strong>✅ Vault Retrieved</strong></p>
          <p>
            <strong>🔗 Transaction Hash:</strong>{' '}
            <a
              href={`https://sepolia.etherscan.io/tx/${status}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline break-all"
            >
              {status}
            </a>
          </p>
        </div>
      )}
      {images.length > 0 && (
        <div className="mt-4 grid grid-cols-1 gap-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Retrieved Images:</p>
            {images.map((url, idx) => (
            <Image
                key={idx}
                src={url}
                alt={`Vault image ${idx + 1}`}
                width={300}
                height={300}
                className="rounded-md border"
            />
            ))}
        </div>
        )}
    </form>
  );
}
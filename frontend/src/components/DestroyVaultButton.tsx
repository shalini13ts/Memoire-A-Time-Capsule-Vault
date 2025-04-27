'use client';
import React, { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseAbi } from 'viem';

interface DestroyVaultButtonProps {
  vaultId: `0x${string}`;
  onSuccess?: () => void;
}

const DestroyVaultButton: React.FC<DestroyVaultButtonProps> = ({ vaultId, onSuccess }) => {
  const { address } = useAccount();
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { 
    data: hash,
    writeContract,
    isPending,
    error: writeError 
  } = useWriteContract();
  
  const { isLoading: isConfirmingTx, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const handleDestroyVault = async () => {
    if (!address) {
      setError('Please connect your wallet');
      return;
    }

    if (!confirm('Are you sure you want to destroy this vault? This action cannot be undone.')) {
      return;
    }

    try {
      setIsConfirming(true);
      setError(null);
      await writeContract({
        address: '0x6E5AfD22Fc36C3e5AD5B92df590534566A2ce4c6',
        abi: parseAbi([
          "function destroyVault(bytes32 vaultId) external"
        ]),
        functionName: 'destroyVault',
        args: [vaultId],
      });
    } catch (err) {
      setIsConfirming(false);
      setError(err instanceof Error ? err.message : 'Failed to destroy vault');
    }
  };

  React.useEffect(() => {
    if (writeError) {
      setError(writeError.message);
      setIsConfirming(false);
    }
  }, [writeError]);

  React.useEffect(() => {
    if (isConfirmed) {
      setIsConfirming(false);
      onSuccess?.();
    }
  }, [isConfirmed, onSuccess]);

  return (
    <div className="flex flex-col items-end">
      <button
        onClick={handleDestroyVault}
        disabled={isPending || isConfirming}
        className="px-3 py-1 bg-red-100 text-red-700 rounded-md text-sm font-medium hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? 'Preparing...' : isConfirming ? 'Destroying...' : 'Destroy Vault'}
      </button>
      {error && (
        <div className="text-red-500 text-xs mt-1 max-w-[200px] text-right">
          {error}
        </div>
      )}
    </div>
  );
};

export default DestroyVaultButton;
'use client';
import React from 'react';
import { useAccount, useReadContract } from 'wagmi';
import DestroyVaultButton from './DestroyVaultButton';

const UserVaultsList = () => {
  const { address } = useAccount();
  const [refreshKey, setRefreshKey] = React.useState(0);
  
  const { data: vaultSummaries, isLoading, error, refetch } = useReadContract({
    address: '0x6E5AfD22Fc36C3e5AD5B92df590534566A2ce4c6', // Replace with your contract address
    abi: [
      {
        "inputs": [{"name":"owner","type":"address"}],
        "name": "getVaultSummaries",
        "outputs": [
          {"name":"","type":"bytes32[]"},
          {"name":"","type":"string[]"}
        ],
        "stateMutability": "view",
        "type": "function"
      }
    ],
    functionName: 'getVaultSummaries',
    args: [address || '0x'],
  });

  const handleDestroySuccess = () => {
    refetch(); // Refresh the list after destruction
  };

  if (!address) return <div>Connect your wallet</div>;
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const [vaultIds, vaultNames] = vaultSummaries || [[], []];

  return (
    <div className="space-y-3">
      {vaultIds.length > 0 ? (
        vaultIds.map((id, index) => (
          <div 
            key={index} 
            className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-blue-50 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="font-mono text-sm text-gray-600 mb-1">ID: {id}</div>
                <div className="font-medium text-lg text-gray-800">
                  {vaultNames[index] || 'Unnamed Vault'}
                </div>
              </div>
              <DestroyVaultButton 
                vaultId={id} 
                onSuccess={handleDestroySuccess}
              />
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-8 text-gray-500">
          You don't have any vaults yet. Create your first time capsule!
        </div>
      )}
    </div>
  );
};

export default UserVaultsList;
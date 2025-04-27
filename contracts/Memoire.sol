// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title MemoireVault
 * @author 
 * @notice A decentralized, time-locked vault system allowing users to securely store 
 *         content identifiers (CIDs) on-chain with permissioned retrieval after a defined unlock time.
 * @dev Implements strict ownership, controlled access permissions, and time-locked retrieval mechanisms.
 */
contract MemoireVault {
    /// @notice Maximum permissible unlock period (10 years)
    uint constant MAX_UNLOCK_PERIOD = 3650 days; 

    /**
     * @dev Struct representing an individual vault.
     * @param owner Address of the vault creator and owner.
     * @param name Human-readable name for vault identification.
     * @param cids Array of content identifiers (e.g., IPFS hashes).
     * @param unlockTime UNIX timestamp after which the vault contents can be retrieved.
     * @param retrieved Flag indicating whether the vault contents have been retrieved.
     * @param permitted Mapping of wallet addresses permitted to retrieve the vault after unlock.
     * @param permittedWallets Array of explicitly permitted wallet addresses for easier enumeration.
     */
    struct Vault {
        address owner;
        string name;
        string[] cids;
        uint unlockTime;
        mapping(address => bool) permitted;
        address[] permittedWallets;
    }

    mapping(bytes32 => Vault) private vaults;
    mapping(address => bytes32[]) private userVaults;

    event VaultCreated(bytes32 indexed vaultId, address indexed owner, string name, uint unlockTime);
    event VaultRetrieved(bytes32 indexed vaultId, address indexed retriever, string[] cids);
    event WalletPermitted(bytes32 indexed vaultId, address indexed wallet);
    event WalletRevoked(bytes32 indexed vaultId, address indexed wallet);
    event UnlockTimeExtended(bytes32 indexed vaultId, uint newUnlockTime);
    event VaultDestroyed(bytes32 indexed vaultId);


    /**
     * @dev Restricts function access to the vault owner.
     * @param vaultId Identifier of the vault being accessed.
     */
    modifier onlyOwner(bytes32 vaultId) {
        require(msg.sender == vaults[vaultId].owner, "Only owner can execute");
        _;
    }

    /**
     * @notice Creates a new time-locked vault.
     * @param name The human-readable name of the vault.
     * @param cids An array of content identifiers (CIDs) associated with the vault.
     * @param unlockTime UNIX timestamp after which the vault can be retrieved.
     */
    function createVault(string calldata name, string[] calldata cids, uint unlockTime) external {
        require(bytes(name).length > 0, "Vault name cannot be empty");
        require(cids.length > 0, "At least one CID is required");
        require(unlockTime > block.timestamp, "Unlock time must be in the future");
        require(unlockTime <= block.timestamp + MAX_UNLOCK_PERIOD, "Unlock time too far in future");

        bytes32 vaultId = keccak256(abi.encodePacked(name, msg.sender));
        Vault storage v = vaults[vaultId];
        require(v.owner == address(0), "Vault already exists with this name");

        v.owner = msg.sender;
        v.name = name;
        v.unlockTime = unlockTime;
    
        for (uint i = 0; i < cids.length; i++) {
            require(bytes(cids[i]).length > 0, "CID cannot be empty");
            v.cids.push(cids[i]);
        }

        userVaults[msg.sender].push(vaultId);
        emit VaultCreated(vaultId, msg.sender, name, unlockTime);
    }

    /**
     * @notice Retrieves the CIDs stored in a vault after unlock time has passed.
     * @dev Marks the vault as retrieved upon successful access.
     * @param vaultId The identifier of the vault to retrieve.
     * @return cids The content identifiers stored in the vault.
     */
    function retrieveVault(bytes32 vaultId) external returns (string[] memory) {
        Vault storage v = vaults[vaultId];
        require(msg.sender == v.owner || v.permitted[msg.sender], "Access denied");
        require(block.timestamp >= v.unlockTime, "Vault still locked");

        emit VaultRetrieved(vaultId, msg.sender, v.cids);
        return v.cids;
    }

    /**
     * @notice Permits a wallet to access a vault after the unlock time.
     * @param vaultId The identifier of the vault.
     * @param wallet The wallet address to grant permission to.
     */
    function permitWallet(bytes32 vaultId, address wallet) external onlyOwner(vaultId) {
        require(wallet != address(0), "Invalid address");
        require(!vaults[vaultId].permitted[wallet], "Wallet already permitted");

        vaults[vaultId].permitted[wallet] = true;
        vaults[vaultId].permittedWallets.push(wallet);
        emit WalletPermitted(vaultId, wallet);
    }

    /**
     * @notice Revokes a wallet's permission to access a vault.
     * @param vaultId The identifier of the vault.
     * @param wallet The wallet address to revoke permission from.
     */
    function revokeWallet(bytes32 vaultId, address wallet) external onlyOwner(vaultId) {
        require(vaults[vaultId].permitted[wallet], "Wallet not permitted");

        vaults[vaultId].permitted[wallet] = false;

        address[] storage permittedList = vaults[vaultId].permittedWallets;
        for (uint i = 0; i < permittedList.length; i++) {
            if (permittedList[i] == wallet) {
                permittedList[i] = permittedList[permittedList.length - 1];
                permittedList.pop();
                break;
            }
        }

        emit WalletRevoked(vaultId, wallet);
    }

    /**
     * @notice Returns the list of vault IDs owned by a specific user.
     * @param user The address of the vault owner.
     * @return An array of vault identifiers.
     */
    function getVaultIds(address user) external view returns (bytes32[] memory) {
        return userVaults[user];
    }

    /**
     * @notice Checks if a vault is currently open for retrieval.
     * @param vaultId The identifier of the vault.
     * @return True if open, false if still locked.
     */
    function isVaultOpen(bytes32 vaultId) external view returns (bool) {
        return block.timestamp >= vaults[vaultId].unlockTime;
    }

    /**
     * @notice Returns a vault's open status and unlock time.
     * @param vaultId The identifier of the vault.
     * @return isOpen True if vault is open, false otherwise.
     * @return unlockTime The unlock timestamp.
     */
    function getVaultStatus(bytes32 vaultId) external view returns (bool isOpen, uint unlockTime) {
        isOpen = block.timestamp >= vaults[vaultId].unlockTime;
        unlockTime = vaults[vaultId].unlockTime;
    }

    /**
     * @notice Extends a vault's unlock time.
     * @param vaultId The identifier of the vault.
     * @param newUnlockTime New unlock timestamp.
     */
    function extendUnlockTime(bytes32 vaultId, uint newUnlockTime) external onlyOwner(vaultId) {
        require(newUnlockTime > block.timestamp, "Unlock time must be in the future");
        require(newUnlockTime <= block.timestamp + MAX_UNLOCK_PERIOD, "Unlock time too far in future");
        require(newUnlockTime > vaults[vaultId].unlockTime, "New unlock time must be later");

        vaults[vaultId].unlockTime = newUnlockTime;
        emit UnlockTimeExtended(vaultId, newUnlockTime);
    }

    /**
     * @notice Destroys a vault before it unlocks.
     * @param vaultId The identifier of the vault.
     */
    function destroyVault(bytes32 vaultId) external onlyOwner(vaultId) {
        require(block.timestamp < vaults[vaultId].unlockTime, "Cannot destroy unlocked vault");

        bytes32[] storage ids = userVaults[msg.sender];
        for (uint i = 0; i < ids.length; i++) {
            if (ids[i] == vaultId) {
                ids[i] = ids[ids.length - 1];
                ids.pop();
                break;
            }
        }

        delete vaults[vaultId];
        emit VaultDestroyed(vaultId);
    }

    /**
     * @notice Returns the list of permitted wallets for a vault.
     * @param vaultId The identifier of the vault.
     * @return An array of permitted wallet addresses.
     */
    function getPermittedWallets(bytes32 vaultId) external view returns (address[] memory) {
        return vaults[vaultId].permittedWallets;
    }

    /**
     * @notice Retrieves a summary list of vault IDs and names owned by a specific address.
     * @param owner The address of the vault owner.
     * @return An array of vault identifiers and corresponding names.
     */
    function getVaultSummaries(address owner) external view returns (bytes32[] memory, string[] memory) {
        bytes32[] storage ids = userVaults[owner];
        string[] memory names = new string[](ids.length);

        for (uint i = 0; i < ids.length; i++) {
            names[i] = vaults[ids[i]].name;
        }

        return (ids, names);
    }
}

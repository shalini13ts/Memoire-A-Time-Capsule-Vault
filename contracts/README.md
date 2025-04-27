# 🧠 Memoire - A Decentralized Time Capsule

Memoire is an EVM-based decentralized application for storing time-locked encrypted memories on-chain. It uses IPFS for content storage and includes smart contract-based access control and time locking mechanisms.

## 📦 Project Structure

```
.
├── contracts/
│   └── Memoire.sol          # Smart contract
├── scripts/
│   └── deploy.ts            # TypeScript deployment script using viem
├── test/
│   └── Memoire.test.ts      # Unit tests (if any)
├── hardhat.config.ts        # Hardhat config file
├── .env                     # Environment variables (private)
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR-USERNAME/Memoire.git
cd Memoire
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory and add:

```env
PRIVATE_KEY=your_private_key
RPC_URL=https://your-evm-node-url
```

> ⚠️ Never share your private key or commit `.env` to version control. Use `.gitignore` to exclude it.

---

## 📜 Deploying the Contract (TypeScript + viem)

Make sure the environment variables are set, then run:

```bash
npx tsx scripts/deploy.ts
```

This will compile the contract and deploy it to the network defined in your `.env`.

---

## 🛠 Hardhat Commands

### Compile Contracts

```bash
npx hardhat compile
```

### Run Tests

```bash
npx hardhat test
```

### Deploy Contract

```bash
npx tsx scripts/deploy.ts
```

---

## 🔐 Environment & Security

This project uses `.env` to manage secrets. Ensure your `.gitignore` includes:

```
.env
node_modules
```

---

## ✨ Built With

- [Hardhat](https://hardhat.org/) - Ethereum development environment
- [TypeScript](https://www.typescriptlang.org/)
- [viem](https://viem.sh/) - Modern Ethereum client library
- [IPFS](https://ipfs.tech/) - Decentralized storage

---

## 👥 Team

This project is built by **Group 7** in the Encode Bootcamp 💡  


---

## 📄 License

This project is licensed under the MIT License. See `LICENSE` for details.

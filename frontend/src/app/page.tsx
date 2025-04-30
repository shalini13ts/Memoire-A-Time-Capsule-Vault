'use client';
import React from 'react';
import WalletConnect from '../components/WalletConnect';
import TimeCapsuleForm from '../components/TimeCapsuleForm';
import VaultRetrievalForm from '../components/VaultRetrievalForm';
import UserVaultsList from '../components/UserVaultsList';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            Time Capsule Vault
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-xl text-gray-600">
            Preserve your memories securely on the blockchain
          </p>
          {/* Add this link to navigate to images page */}
          <div className="mt-6">
            <Link 
              href="/images"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Click here if you have a vault 
            </Link>
          </div>
        </header>

        {/* Rest of your existing code remains the same */}
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Forms */}
          <div className="space-y-8">
            {/* Wallet Connect Card */}
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
              <WalletConnect />
            </div>

            {/* Forms Section */}
            <div className="space-y-6">
              {/* Time Capsule Form Card */}
              <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Create New Time Capsule</h2>
                <TimeCapsuleForm />
              </div>

              
            </div>
          </div>

          {/* Right Column - Vault List */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 h-fit sticky top-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Your Vaults</h2>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                Protected
              </span>
            </div>
            <UserVaultsList />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} Time Capsule Vault. All rights reserved.</p>
        </footer>
      </div>
    </main>
  );
}

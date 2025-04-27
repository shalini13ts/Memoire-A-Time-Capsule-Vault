'use client';
import React from 'react';
import RetrieveImages from '@/components/RetrieveImages';
import WalletConnect from '@/components/WalletConnect';
import Link from 'next/link';

export default function ImagesPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <Link 
          href="/"
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
        >
          ← Back to Home
        </Link>
        <WalletConnect />
      </div>
      <RetrieveImages />
    </main>
  );
} 
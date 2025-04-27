'use client';
import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import Image from 'next/image';
import ImageModal from './ImageModal';

interface ImageData {
  url: string;
  title?: string;
  date?: string;
  description?: string;
}

export default function RetrieveImages() {
  const { address, isConnected } = useAccount();
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);

  const fetchImages = async () => {
    if (!address) return;
    setLoading(true);
    try {
      // TODO: Implement actual image retrieval from wallet/contract
      // This is a placeholder for demonstration
      const mockImages: ImageData[] = [
        {
          url: 'https://picsum.photos/200/300',
          title: 'Memory #1',
          date: '2024-04-20',
          description: 'A beautiful moment captured in time'
        },
        {
          url: 'https://picsum.photos/200/300',
          title: 'Memory #2',
          date: '2024-04-19',
          description: 'Another special moment'
        },
        {
          url: 'https://picsum.photos/200/300',
          title: 'Memory #3',
          date: '2024-04-18',
          description: 'Cherished memory'
        }
      ];
      setImages(mockImages);
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected && address) {
      fetchImages();
    }
  }, [isConnected, address]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Your Time Capsule Images</h2>
        {isConnected && (
          <button
            onClick={fetchImages}
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Refreshing...' : 'Refresh Images'}
          </button>
        )}
      </div>
      
      {!isConnected ? (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">Please connect your wallet to view images</p>
        </div>
      ) : loading ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Loading images...</p>
        </div>
      ) : images.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No images found in your time capsules</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative aspect-square group">
              <Image
                src={image.url}
                alt={image.title || `Time capsule image ${index + 1}`}
                fill
                className="object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity rounded-lg flex items-center justify-center">
                <button 
                  onClick={() => setSelectedImage(image)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity px-4 py-2 bg-white text-gray-800 rounded-md"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedImage && (
        <ImageModal
          isOpen={!!selectedImage}
          onClose={() => setSelectedImage(null)}
          imageUrl={selectedImage.url}
          title={selectedImage.title}
          date={selectedImage.date}
          description={selectedImage.description}
        />
      )}
    </div>
  );
} 
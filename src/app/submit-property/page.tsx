import React from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function SubmitPropertyPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4">
        <h1 className="text-2xl font-bold">Submit Property for Free Page</h1>
      </main>
      <Footer />
    </div>
  );
}
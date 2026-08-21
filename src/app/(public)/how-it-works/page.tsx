import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { HowItWorks } from '@/components/landing/HowItWorks';

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA]">
      <Navbar />
      <main className="flex-1 py-6">
        <HowItWorks />
      </main>
      <Footer />
    </div>
  );
}

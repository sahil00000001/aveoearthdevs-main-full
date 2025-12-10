import React from 'react';
import HeroSection from '@/components/HeroSection';
import CategoryBubbles from '@/components/CategoryBubbles';
import GoGreenSection from '@/components/GoGreenSection';
import DatabaseStatus from '@/components/DatabaseStatus'
import DatabaseTest from '@/components/DatabaseTest';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <main>
        <HeroSection />
        <CategoryBubbles />
        <GoGreenSection />
        <div className="container mx-auto px-4 py-8">
          <DatabaseStatus />
          <DatabaseTest />
        </div>
      </main>
    </div>
  );
};

export default Index;

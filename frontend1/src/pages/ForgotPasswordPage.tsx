import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const ForgotPasswordPage = () => {
  return (
    <div className="container mx-auto px-4 py-12 max-w-md">
      <h1 className="text-3xl font-bold mb-4">Forgot Password</h1>
      <p className="text-muted-foreground mb-6">Enter your email to receive a reset link.</p>
      <div className="space-y-4">
        <Input type="email" placeholder="you@example.com" />
        <Button className="w-full">Send reset link</Button>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;




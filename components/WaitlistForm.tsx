'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardHeader, CardContent, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/Form';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { Checkbox } from './ui/Checkbox';
import { RadioGroup, RadioGroupItem } from './ui/RadioGroup';
import { Sparkles, Rocket, TrendingUp, Shield, Target, Lock } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  walletAddress: z.string().optional(),
  role: z.string().min(1, 'Please select your role'),
  features: z.array(z.string()).optional(),
  willPay: z.string().min(1, 'Please indicate payment interest'),
  additionalInfo: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const features = [
  { id: 'analytics', label: 'Advanced Analytics' },
  { id: 'verified', label: 'Verified Markets' },
  { id: 'dashboard', label: 'VC Dashboard' },
  { id: 'markets', label: 'More Markets' },
  { id: 'ai', label: 'AI Prediction Engine' },
];

export function WaitlistForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      walletAddress: '',
      role: '',
      features: [],
      willPay: '',
      additionalInfo: '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit waitlist entry');
      }

      setSubmitSuccess(true);
      form.reset();
      
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);
    setIsLoggingIn(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: adminUsername, password: adminPassword }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Login failed');
      }

      // Redirect to admin waitlist page
      router.push('/admin/waitlist');
    } catch (error) {
      setAdminError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#1a1a1a]">
      <main className="flex-1">
        <div className="container mx-auto px-6 py-16">
          {/* Hero Section */}
          <div className="max-w-4xl mx-auto text-center mb-16">
            <div className="inline-block mb-6">
              <div className="bg-gradient-to-r from-[#3772FF] to-[#8B5CF6] p-4 border-4 border-black neobrutal-shadow">
                <Sparkles className="h-12 w-12 text-white" />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black mb-6 text-white">
              SHIP OR DIE PRO
            </h1>
            
            <p className="text-2xl md:text-3xl font-bold text-blue-500 mb-6">
              Early Access Waitlist
            </p>
            
            <p className="text-xl text-gray-300 font-medium max-w-3xl mx-auto">
              Get early access to advanced prediction tools, founder verification, and pro analytics. 
              Ideal for founders, traders, and VCs.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
            <Card>
              <TrendingUp className="h-10 w-10 text-blue-500 mb-4" />
              <h3 className="text-xl font-black mb-2">Advanced Analytics</h3>
              <p className="text-sm text-gray-300 font-medium">
                Deep insights into market trends, startup performance, and prediction accuracy.
              </p>
            </Card>

            <Card>
              <Shield className="h-10 w-10 text-blue-500 mb-4" />
              <h3 className="text-xl font-black mb-2">Verified Markets</h3>
              <p className="text-sm text-gray-300 font-medium">
                Access curated, verified prediction markets with institutional-grade data.
              </p>
            </Card>

            <Card>
              <Target className="h-10 w-10 text-blue-500 mb-4" />
              <h3 className="text-xl font-black mb-2">Pro Execution Tools</h3>
              <p className="text-sm text-gray-300 font-medium">
                Portfolio tracking, custom alerts, and automated signals for smarter bets.
              </p>
            </Card>
          </div>

          {/* Waitlist Form */}
          <Card className="max-w-3xl mx-auto p-8 border-4 border-black neobrutal-shadow">
            {submitSuccess && (
              <div className="mb-6 p-4 bg-green-500 border-4 border-black">
                <p className="text-sm text-white font-black uppercase">
                  ✓ You're on the list! We'll notify you when Ship or Die PRO launches.
                </p>
              </div>
            )}

            {submitError && (
              <div className="mb-6 p-4 bg-red-500 border-4 border-black">
                <p className="text-sm text-white font-black uppercase">
                  ✗ {submitError}
                </p>
              </div>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Your Name *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter your full name"
                          className="border-4 border-black neobrutal-shadow bg-[#2a2a2a] text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Email Address *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="your@email.com"
                          className="border-4 border-black neobrutal-shadow bg-[#2a2a2a] text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="walletAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Wallet Address (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="0x..."
                          className="border-4 border-black neobrutal-shadow bg-[#2a2a2a] text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Are you a: *</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="space-y-3"
                        >
                          <div className="flex items-center space-x-3">
                            <RadioGroupItem value="founder" id="founder" className="border-2 border-black" />
                            <label htmlFor="founder" className="font-medium cursor-pointer text-white text-base">Founder</label>
                          </div>
                          <div className="flex items-center space-x-3">
                            <RadioGroupItem value="investor" id="investor" className="border-2 border-black" />
                            <label htmlFor="investor" className="font-medium cursor-pointer text-white text-base">Investor</label>
                          </div>
                          <div className="flex items-center space-x-3">
                            <RadioGroupItem value="vc-accelerator" id="vc-accelerator" className="border-2 border-black" />
                            <label htmlFor="vc-accelerator" className="font-medium cursor-pointer text-white text-base">VC / Accelerator</label>
                          </div>
                          <div className="flex items-center space-x-3">
                            <RadioGroupItem value="trader" id="trader" className="border-2 border-black" />
                            <label htmlFor="trader" className="font-medium cursor-pointer text-white text-base">Trader</label>
                          </div>
                          <div className="flex items-center space-x-3">
                            <RadioGroupItem value="community-member" id="community-member" className="border-2 border-black" />
                            <label htmlFor="community-member" className="font-medium cursor-pointer text-white text-base">Community Member</label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="features"
                  render={() => (
                    <FormItem>
                      <FormLabel className="text-white">
                        What features interest you most? (Select all that apply)
                      </FormLabel>
                      <div className="space-y-3 mt-2">
                        {features.map((feature) => (
                          <FormField
                            key={feature.id}
                            control={form.control}
                            name="features"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-3">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(feature.id)}
                                    onCheckedChange={(checked) => {
                                      const currentFeatures = field.value || [];
                                      return checked
                                        ? field.onChange([...currentFeatures, feature.id])
                                        : field.onChange(currentFeatures.filter((f: string) => f !== feature.id));
                                    }}
                                    className="border-2 border-black"
                                  />
                                </FormControl>
                                <FormLabel className="font-medium cursor-pointer !normal-case !font-normal text-white text-base">
                                  {feature.label}
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="willPay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Would you pay for premium features? *</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="space-y-3"
                        >
                          <div className="flex items-center space-x-3">
                            <RadioGroupItem value="yes" id="yes" className="border-2 border-black" />
                            <label htmlFor="yes" className="font-medium cursor-pointer text-white text-base">Yes</label>
                          </div>
                          <div className="flex items-center space-x-3">
                            <RadioGroupItem value="maybe" id="maybe" className="border-2 border-black" />
                            <label htmlFor="maybe" className="font-medium cursor-pointer text-white text-base">Maybe</label>
                          </div>
                          <div className="flex items-center space-x-3">
                            <RadioGroupItem value="no" id="no" className="border-2 border-black" />
                            <label htmlFor="no" className="font-medium cursor-pointer text-white text-base">No</label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="additionalInfo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">
                        Anything else you'd like to use Ship or Die PRO for?
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          className="border-4 border-black neobrutal-shadow min-h-[120px] bg-[#2a2a2a] text-white"
                          placeholder="Share your thoughts..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  size="lg"
                  className="w-full border-4 border-black neobrutal-shadow font-bold uppercase text-base"
                  disabled={isSubmitting}
                >
                  <Rocket className="mr-2 h-5 w-5" />
                  {isSubmitting ? 'Joining Waitlist...' : 'Join the Waitlist'}
                </Button>
              </form>
            </Form>
          </Card>

          {/* Footer Section with View Waitlist Button */}
          <div className="max-w-3xl mx-auto mt-16 text-center">
            <Card className="p-8 border-4 border-black neobrutal-shadow bg-gradient-to-r from-[#3772FF]/10 to-[#8B5CF6]/10">
              <div className="flex flex-col items-center gap-4">
                <p className="text-lg font-bold text-white">
                  Already signed up? View the waitlist
                </p>
                <Button
                  onClick={() => setShowAdminLogin(true)}
                  variant="outline"
                  className="border-4 border-black neobrutal-shadow font-bold uppercase"
                >
                  <Lock className="mr-2 h-5 w-5" />
                  View Waitlist (Admin)
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </main>

      {/* Admin Login Modal */}
      {showAdminLogin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full p-8 border-4 border-black neobrutal-shadow relative">
            <button
              onClick={() => {
                setShowAdminLogin(false);
                setAdminError(null);
                setAdminUsername('');
                setAdminPassword('');
              }}
              className="absolute top-4 right-4 text-white hover:text-gray-300 text-2xl font-bold"
            >
              ×
            </button>
            
            <CardHeader>
              <CardTitle className="text-3xl font-black uppercase text-center text-white">
                Admin Login
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleAdminLogin} className="space-y-6">
                {adminError && (
                  <div className="p-4 bg-red-500 border-4 border-black">
                    <p className="text-sm text-white font-black uppercase">{adminError}</p>
                  </div>
                )}

                <Input
                  label="Username"
                  type="text"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  required
                  placeholder="Enter username"
                  className="border-4 border-black neobrutal-shadow bg-[#2a2a2a] text-white"
                />

                <Input
                  label="Password"
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  required
                  placeholder="Enter password"
                  className="border-4 border-black neobrutal-shadow bg-[#2a2a2a] text-white"
                />

                <Button
                  type="submit"
                  className="w-full border-4 border-black neobrutal-shadow font-bold uppercase"
                  disabled={isLoggingIn}
                >
                  {isLoggingIn ? 'Logging in...' : 'Login'}
                </Button>

                <div className="p-4 bg-blue-500 border-4 border-black">
                  <p className="text-xs text-white font-bold">
                    Default credentials: username=admin, password=admin123
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}


import { CreateStartupForm } from '@/components/CreateStartupForm';

export default function CreateStartupPage() {
  return (
    <div className="container mx-auto px-6 py-16 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-5xl md:text-6xl font-black mb-4">Create Startup</h1>
        <p className="text-xl text-muted-foreground font-medium">
          Register your startup on-chain to start creating markets
        </p>
      </div>
      <CreateStartupForm />
    </div>
  );
}


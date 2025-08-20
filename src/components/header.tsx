import { Scissors } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-card py-4 shadow-sm">
      <div className="container mx-auto flex items-center justify-center gap-3 px-4 sm:px-6 lg:px-8">
        <Scissors className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight text-foreground font-headline">
          CapiloFlow
        </h1>
      </div>
    </header>
  );
}

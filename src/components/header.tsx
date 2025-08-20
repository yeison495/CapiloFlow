import { Scissors } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

export default function Header() {
  return (
    <header className="bg-card py-4 shadow-sm">
      <div className="container mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Scissors className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-headline">
            CapiloFlow
          </h1>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}

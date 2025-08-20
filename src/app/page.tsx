'use client';

import { useState, useEffect, useMemo } from 'react';
import type { IncomeEntry } from '@/types';
import { getWeekRange, getPreviousWeekRange } from '@/lib/date-utils';
import { DollarSign, CalendarDays, Scissors } from 'lucide-react';
import Header from '@/components/header';
import SummaryCard from '@/components/summary-card';
import PayoutCard from '@/components/payout-card';
import IncomeForm from '@/components/income-form';
import DailyEntriesList from '@/components/daily-entries-list';

export default function Home() {
  const [entries, setEntries] = useState<IncomeEntry[]>([]);
  const [today, setToday] = useState<Date | null>(null);

  useEffect(() => {
    setToday(new Date());
    try {
      const savedEntries = localStorage.getItem('capiloflow-entries');
      if (savedEntries) {
        setEntries(JSON.parse(savedEntries));
      }
    } catch (error) {
      console.error("Failed to parse entries from localStorage", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('capiloflow-entries', JSON.stringify(entries));
    } catch (error) {
      console.error("Failed to save entries to localStorage", error);
    }
  }, [entries]);
  
  const handleAddIncome = (income: { amount: number; description: string }) => {
    const newEntry: IncomeEntry = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      ...income,
    };
    setEntries((prevEntries) => [...prevEntries, newEntry]);
  };

  const handleDeleteIncome = (id: string) => {
    setEntries((prevEntries) => prevEntries.filter(entry => entry.id !== id));
  };

  const { todayTotal, weekTotal, previousWeekTotal, todayEntries, isSaturday } = useMemo(() => {
    if (!today) {
      return { todayTotal: 0, weekTotal: 0, previousWeekTotal: 0, todayEntries: [], isSaturday: false };
    }

    const todayStart = new Date(today);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    const todayEntries = entries.filter((entry) => {
      const entryDate = new Date(entry.timestamp);
      return entryDate >= todayStart && entryDate <= todayEnd;
    });

    const todayTotal = todayEntries.reduce((sum, entry) => sum + entry.amount, 0);

    const currentWeek = getWeekRange(today);
    const weekEntries = entries.filter((entry) => {
      const entryDate = new Date(entry.timestamp);
      return entryDate >= currentWeek.start && entryDate <= currentWeek.end;
    });
    const weekTotal = weekEntries.reduce((sum, entry) => sum + entry.amount, 0);

    const isTodaySaturday = today.getDay() === 6;

    let prevWeekTotal = 0;
    if (isTodaySaturday) {
      const previousWeek = getPreviousWeekRange(today);
      const previousWeekEntries = entries.filter((entry) => {
        const entryDate = new Date(entry.timestamp);
        return entryDate >= previousWeek.start && entryDate <= previousWeek.end;
      });
      prevWeekTotal = previousWeekEntries.reduce((sum, entry) => sum + entry.amount, 0);
    }

    return {
      todayTotal,
      weekTotal,
      previousWeekTotal: prevWeekTotal,
      todayEntries,
      isSaturday: isTodaySaturday,
    };
  }, [entries, today]);

  if (!today) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Scissors className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <SummaryCard title="Ingresos de Hoy" value={todayTotal} icon={<DollarSign className="h-6 w-6 text-primary" />} />
          <SummaryCard title="Total de la Semana" value={weekTotal} icon={<CalendarDays className="h-6 w-6 text-primary" />} />
          {isSaturday && <PayoutCard amount={previousWeekTotal} />}
        </div>
        
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <IncomeForm onAddIncome={handleAddIncome} />
          </div>
          <div className="lg:col-span-3">
            <DailyEntriesList entries={todayEntries} onDelete={handleDeleteIncome} />
          </div>
        </div>
      </main>
    </div>
  );
}

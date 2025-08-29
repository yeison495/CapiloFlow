'use client';

import { useState, useEffect } from 'react';
import type { IncomeEntry } from '@/types';
import { getWeekRange, getPreviousWeekRange } from '@/lib/date-utils';
import { DollarSign, CalendarDays, Scissors, Calendar as CalendarIcon } from 'lucide-react';
import Header from '@/components/header';
import SummaryCard from '@/components/summary-card';
import PayoutCard from '@/components/payout-card';
import IncomeForm from '@/components/income-form';
import DailyEntriesList from '@/components/daily-entries-list';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { db } from '@/lib/firebase';
import { collection, addDoc, onSnapshot, deleteDoc, doc, Timestamp } from 'firebase/firestore';

export default function Home() {
  const [entries, setEntries] = useState<IncomeEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "entries"), (snapshot) => {
      const newEntries: IncomeEntry[] = snapshot.docs
      .filter(doc => doc.exists() && doc.data().timestamp) // Ensure doc and timestamp exist
      .map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          amount: data.amount,
          description: data.description,
          // Safely handle timestamp conversion
          timestamp: (data.timestamp as Timestamp).toMillis(),
        };
      });
      setEntries(newEntries);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);


  const handleAddIncome = async (income: { amount: number; description: string }) => {
    const newEntry = {
      ...income,
      // Use server timestamp for consistency
      timestamp: Timestamp.fromDate(selectedDate),
    };

    try {
      await addDoc(collection(db, "entries"), newEntry);
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  const handleDeleteIncome = async (id: string) => {
    try {
      await deleteDoc(doc(db, "entries", id));
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
  };

  const getStartOfDay = (date: Date) => {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    return start;
  };
  
  const getEndOfDay = (date: Date) => {
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    return end;
  };

  // --- START: Refactored Logic ---
  const dayStart = getStartOfDay(selectedDate).getTime();
  const dayEnd = getEndOfDay(selectedDate).getTime();
  
  const selectedDateEntries = entries.filter((entry) => {
    const entryTimestamp = entry.timestamp;
    return entryTimestamp >= dayStart && entryTimestamp <= dayEnd;
  });

  const selectedDateTotal = selectedDateEntries.reduce((sum, entry) => sum + entry.amount, 0);

  const currentWeek = getWeekRange(selectedDate);
  const weekEntries = entries.filter((entry) => {
    const entryDate = new Date(entry.timestamp);
    return entryDate >= currentWeek.start && entryDate <= currentWeek.end;
  });
  const weekTotal = weekEntries.reduce((sum, entry) => sum + entry.amount, 0);

  const isSaturday = selectedDate.getDay() === 6;

  let previousWeekTotal = 0;
  if (isSaturday) {
    const previousWeek = getPreviousWeekRange(selectedDate);
    const previousWeekEntries = entries.filter((entry) => {
      const entryDate = new Date(entry.timestamp);
      return entryDate >= previousWeek.start && entryDate <= previousWeek.end;
    });
    previousWeekTotal = previousWeekEntries.reduce((sum, entry) => sum + entry.amount, 0);
  }
  // --- END: Refactored Logic ---

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Scissors className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const selectedDayIsToday = new Date().toDateString() === selectedDate.toDateString();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <h2 className="text-2xl font-bold">Resumen</h2>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className="w-[280px] justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP", { locale: es }) : <span>Elige una fecha</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                initialFocus
                locale={es}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <SummaryCard title={selectedDayIsToday ? "Ingresos de Hoy" : "Ingresos del Día"} value={selectedDateTotal} icon={<DollarSign className="h-6 w-6 text-primary" />} />
          <SummaryCard title="Total de la Semana" value={weekTotal} icon={<CalendarDays className="h-6 w-6 text-primary" />} />
          {isSaturday && <PayoutCard amount={previousWeekTotal} />}
        </div>
        
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <IncomeForm onAddIncome={handleAddIncome} />
          </div>
          <div className="lg:col-span-3">
            <DailyEntriesList entries={selectedDateEntries} onDelete={handleDeleteIncome} selectedDate={selectedDate} />
          </div>
        </div>
      </main>
    </div>
  );
}

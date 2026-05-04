'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface SearchInputProps {
  onSearch: (value: string) => void;
  placeholder?: string;
  defaultValue?: string;
}

export function SearchInput({ onSearch, placeholder = 'Search...', defaultValue = '' }: SearchInputProps) {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(value);
    }, 500);
    return () => clearTimeout(timer);
  }, [value, onSearch]);

  return (
    <div className="relative w-full max-w-2xl hidden md:block">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="pl-11 h-10 rounded-lg bg-zinc-50 border-none focus-visible:ring-1 focus-visible:ring-emerald-500 transition-all text-sm"
      />
    </div>
  );
}

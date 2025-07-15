'use client';

import type { Dictionary } from '@/i18n/get-dictionary';
import React, { createContext, useContext } from 'react';

const DictionaryContext = createContext<Dictionary | null>(null);

export function DictionaryProvider({
  dictionary,
  children,
}: {
  dictionary: Dictionary;
  children: React.ReactNode;
}) {
  return (
    <DictionaryContext.Provider value={dictionary}>
      {children}
    </DictionaryContext.Provider>
  );
}

export const useDictionary = () => {
  const context = useContext(DictionaryContext);
  if (context === null) {
    throw new Error('useDictionary must be used within a DictionaryProvider');
  }
  return context;
};

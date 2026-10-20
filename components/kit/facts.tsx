'use client';

import { createContext, useContext } from 'react';
import type { Facts } from '@/lib/posts';

const FactsContext = createContext<Facts>({});

export function FactsProvider({ facts, children }: { facts: Facts; children: React.ReactNode }) {
  return <FactsContext.Provider value={facts}>{children}</FactsContext.Provider>;
}

/** The post's facts.json, for showing fact values inside interactive components. */
export function useFacts(): Facts {
  return useContext(FactsContext);
}

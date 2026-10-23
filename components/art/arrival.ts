'use client';

import { createContext, useContext } from 'react';

/**
 * False while the portal into /art is still playing. Pieces wait for it, so a
 * WebGL piece never competes with the portal animation for frames.
 */
export const ArrivalContext = createContext(true);
export const useArrived = () => useContext(ArrivalContext);

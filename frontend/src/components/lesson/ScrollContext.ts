import { createContext, RefObject } from 'react';

export const ScrollContext = createContext<RefObject<HTMLElement | null>>({ current: null });

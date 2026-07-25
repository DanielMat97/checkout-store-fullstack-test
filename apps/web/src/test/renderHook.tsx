import { renderHook as rtlRenderHook, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import type { ReactNode } from 'react';
import checkoutReducer, { type CheckoutState } from '../store/checkoutSlice';

export function createTestStore(preloaded?: { checkout: Partial<CheckoutState> }) {
  return configureStore({
    reducer: { checkout: checkoutReducer },
    preloadedState: preloaded
      ? {
          checkout: {
            ...checkoutReducer(undefined, { type: '@@INIT' }),
            ...preloaded.checkout,
          },
        }
      : undefined,
  });
}

export function renderHook<T>(
  useHook: () => T,
  options?: {
    route?: string;
    store?: ReturnType<typeof createTestStore>;
  },
) {
  const store = options?.store ?? createTestStore();
  const route = options?.route ?? '/';

  const wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/product/:productId/checkout" element={children} />
          <Route path="/product/:productId" element={children} />
          <Route path="*" element={children} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );

  const rendered = rtlRenderHook(useHook, { wrapper });
  return { ...rendered, store };
}

export { waitFor };

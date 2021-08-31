import React from 'react';
import './App.css';
import ConfiguredApolloProvider from './containers/ApolloProvider'
import { StoreProvider } from './containers/store/Store';
import { PolkadotProvider } from './hooks/usePolkadot';
import { Dashboard } from './pages/Dashboard';
import { DashboardDataProvider } from './hooks/useDashboardData';

function App() {
  return (
    <ConfiguredApolloProvider>
      <StoreProvider>
        <PolkadotProvider>
          <DashboardDataProvider>
              <Dashboard/>
          </DashboardDataProvider>
        </PolkadotProvider>
      </StoreProvider>
    </ConfiguredApolloProvider>
  );
}

export default App;
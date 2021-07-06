import React from 'react';
import './App.css';
import ConfiguredApolloProvider from './containers/ApolloProvider'
import { StoreProvider } from './containers/store/Store';
import { PolkadotProvider } from './hooks/usePolkadot';
import { Dashboard } from './pages/Dashboard';
import TestDashboard from './pages/TestDashboard';
function App() {
  return (
    <ConfiguredApolloProvider>
      <StoreProvider>
        <PolkadotProvider>
          <Dashboard/>
        </PolkadotProvider>
      </StoreProvider>
    </ConfiguredApolloProvider>
  );
}

export default App;
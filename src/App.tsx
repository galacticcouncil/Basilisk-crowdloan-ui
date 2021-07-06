import React from 'react';
import './App.css';
import ConfiguredApolloProvider from './containers/ApolloProvider'
import { StoreProvider } from './containers/store/Store';
import { PolkadotProvider } from './hooks/usePolkadot';
import TestDashboard from './pages/TestDashboard';
function App() {
  return (
    <ConfiguredApolloProvider>
      <StoreProvider>
        <PolkadotProvider>
          <TestDashboard/>
        </PolkadotProvider>
      </StoreProvider>
    </ConfiguredApolloProvider>
  );
}

export default App;
import React from 'react';
import './App.css';
import ConfiguredApolloProvider from './containers/ApolloProvider'
import { StoreProvider } from './containers/store/Store';
import { PolkadotProvider } from './hooks/usePolkadot';
import { Dashboard } from './pages/Dashboard';
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
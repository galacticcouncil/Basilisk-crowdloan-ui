import React from 'react';
import './App.css';
import ConfiguredApolloProvider from './containers/ApolloProvider'
import { StoreProvider } from './containers/store/Store';
import TestDashboard from './pages/TestDashboard';

function App() {
  return (
    <ConfiguredApolloProvider>
      <StoreProvider>
        <TestDashboard/>
      </StoreProvider>
    </ConfiguredApolloProvider>
  );
}

export default App;
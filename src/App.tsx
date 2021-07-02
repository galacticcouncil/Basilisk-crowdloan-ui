import React from 'react';
import './App.css';
import ConfiguredApolloProvider from './containers/ApolloProvider'
import { StoreProvider } from './containers/store/Store';
import Dashboard from './pages/Dashboard'

function App() {
  return (
   <ConfiguredApolloProvider>
     <StoreProvider>
       <Dashboard/>
     </StoreProvider>
   </ConfiguredApolloProvider>
  );
}

export default App;
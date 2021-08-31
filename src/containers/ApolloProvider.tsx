import {
    ApolloClient,
    InMemoryCache,
    ApolloProvider,
} from '@apollo/client'

import config from '../config'

const client = new ApolloClient({
    uri: config.processorUrl,
    cache: new InMemoryCache(),
    defaultOptions: {
        watchQuery: {
            fetchPolicy: 'network-only'
        },
        query: {
            fetchPolicy: 'network-only'
        }
    }
})

type props = {}
const ConfiguredApolloProvider = ({children}: React.PropsWithChildren<props>) => (
    <ApolloProvider client={client}>
        {children}
    </ApolloProvider>
);
export default ConfiguredApolloProvider;
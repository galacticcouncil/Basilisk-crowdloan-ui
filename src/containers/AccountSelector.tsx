import { usePolkaDotContext } from './../hooks/usePolkadot';
export type Props = {
    onAccountSelect: any,
};

export const AccountSelector = ({onAccountSelect}: Props) => {
    const { accounts, setActiveAccount } = usePolkaDotContext();
    
    const handleAccountOnClick = (address: string) => {
        setActiveAccount(address);
        onAccountSelect()
    }

    return <div>
        <h1>Accounts</h1>
        {accounts.map(account => (
            <div
                key={account.address}
                onClick={_ => handleAccountOnClick(account.address)}
            >
                <p>{account.meta.name}</p>
                <p>{account.address}</p>
            </div>
        ))}
    </div>
}
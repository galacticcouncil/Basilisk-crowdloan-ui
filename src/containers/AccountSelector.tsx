import { useRef } from 'react';
import { useClickAway } from 'react-use';
import { usePolkaDotContext } from '../hooks/usePolkadot';
import './AccountSelector.scss';

export type Props = {
    onAccountSelect: any,
};

export const AccountSelector = ({onAccountSelect}: Props) => {
    const { accounts, setActiveAccount } = usePolkaDotContext();
    
    const handleAccountOnClick = (address: string) => {
        setActiveAccount(address);
        onAccountSelect()
    }

    const ref = useRef(null);
    useClickAway(ref, () => {
        onAccountSelect();
    })

    const noAccount = undefined;

    return <div className="bsx-account-selector">
        <div className="bsx-account-selector-backdrop">
            <div className="bsx-account-selector-modal" ref={ref}>
                <div className="title">Select an account</div>
                {
                    accounts && accounts.length 
                        ? accounts.map(account => (
                                <div
                                    className="account"
                                    key={account.address}
                                    onClick={_ => handleAccountOnClick(account.address)}
                                >
                                    <p className="name">{account.meta.name}</p>
                                    <p className="address">{account.address}</p>
                                </div>
                            ))
                        : <div className="bsx-loading-accounts">Loading accounts</div>
                }
                
                {/* <div
                    className="account no-account"
                    // please don't hurt me
                    onClick={_ => handleAccountOnClick(noAccount as unknown as string)}
                >
                        <p className="name"> Reset account selection </p>
                </div> */}

                <div>
                </div>
            </div>
        </div>
    </div>
}
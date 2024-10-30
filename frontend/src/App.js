import React, { useState, useEffect } from 'react';
//import { ethers } from 'ethers'; // Import ethers
import { providers, utils } from 'ethers';
import PaymentSystemABI from './PaymentSystemABI.json';

const paymentSystemAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Your contract address

function App() {
    const [amount, setAmount] = useState("");
    const [recipient, setRecipient] = useState("");
    const [balance, setBalance] = useState("0");
    const [account, setAccount] = useState(null); // State to hold connected account
    const [provider, setProvider] = useState(null); // State to hold provider

    useEffect(() => {
        const connectMetaMask = async () => {
            if (window.ethereum) {
                const newProvider = new ethers.BrowserProvider(window.ethereum);
                const accounts = await newProvider.send("eth_requestAccounts", []);
                const signer = newProvider.getSigner();

                setProvider(newProvider); // Store the provider
                setAccount(accounts[0]); // Set the first account as the connected account
                getBalance(signer); // Get balance after connecting
            } else {
                alert("Please install MetaMask!");
            }
        };

        connectMetaMask();

        // Listen for account changes
        window.ethereum.on('accountsChanged', async (accounts) => {
            if (accounts.length > 0) {
                setAccount(accounts[0]);
                // Create a new signer each time the account changes
                if (provider) {
                    const signer = provider.getSigner(); // Use the existing provider
                    await getBalance(signer); // Update balance
                }
            } else {
                setAccount(null);
                setBalance("0");
            }
        });

        // Listen for network changes
        window.ethereum.on('chainChanged', () => {
            window.location.reload(); // Reload the page on network change
        });

        // Cleanup listeners on component unmount
        return () => {
            window.ethereum.removeListener('accountsChanged', () => {});
            window.ethereum.removeListener('chainChanged', () => {});
        };

    }, []);

    const getBalance = async (signer) => {
        if (!signer) {
            console.error("Signer is not available");
            return;
        }

        try {
            const contract = new ethers.Contract(paymentSystemAddress, PaymentSystemABI, signer);
            const bal = await contract.balances(await signer.getAddress());
            setBalance(ethers.utils.formatEther(bal));
        } catch (error) {
            console.error("Failed to fetch balance:", error);
            alert("Failed to fetch balance. Check console for details.");
        }
    };

    const sendPayment = async () => {
        if (!account) {
            alert("Please connect MetaMask!");
            return;
        }

        if (!provider) {
            alert("Provider is not initialized!");
            return;
        }
        
        try {
            const signer = provider.getSigner(); // Use the provider state to get the signer
            const contract = new ethers.Contract(paymentSystemAddress, PaymentSystemABI, signer);
            const tx = await contract.sendPayment(recipient, { value: ethers.utils.parseEther(amount) });
            await tx.wait();
            alert("Payment sent!");
            getBalance(signer);
        } catch (error) {
            console.error("Transaction failed:", error);
            alert("Transaction failed. Check console for details.");
        }
    };

    const withdrawPayment = async () => {
        if (!account) {
            alert("Please connect MetaMask!");
            return;
        }

        if (!provider) {
            alert("Provider is not initialized!");
            return;
        }

        
        try {
            const signer = provider.getSigner(); // Use the provider state to get the signer
            const contract = new ethers.Contract(paymentSystemAddress, PaymentSystemABI, signer);

            const tx = await contract.withdrawPayment(ethers.utils.parseEther(amount));
            await tx.wait();
            alert("Payment withdrawn!");
            getBalance(signer);
        } catch (error) {
            console.error("Withdrawal failed:", error);
            alert("Withdrawal failed. Check console for details.");
        }
    };

    return (
        <div>
            <h1>Decentralized Payment System</h1>
            {account ? <p>Connected account: {account}</p> : <p>Please connect MetaMask.</p>}
            <p>Your balance: {balance} ETH</p>
            <input 
                type="text" 
                placeholder="Recipient Address" 
                value={recipient} 
                onChange={e => setRecipient(e.target.value)} 
            />
            <input 
                type="text" 
                placeholder="Amount in ETH" 
                value={amount} 
                onChange={e => setAmount(e.target.value)} 
            />
            <button onClick={sendPayment}>Send Payment</button>
            <button onClick={withdrawPayment}>Withdraw Payment</button>
        </div>
    );
}

export default App;



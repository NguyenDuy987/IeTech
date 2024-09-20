import React, { useState } from 'react';
import Web3 from 'web3';

const MetaMaskPaymentComponent = ({ orderInfo: { user_id, total, plan_id, duration } }) => {
    const [status, setStatus] = useState('');
    const [ethAmount, setEthAmount] = useState(null);

    useEffect(() => {
        const fetchExchangeRate = async () => {
            try {
                const exchangeRateResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
                const exchangeRateData = await exchangeRateResponse.json();

                // Assuming the API response contains the ETH to USD exchange rate
                const ethRate = exchangeRateData.ethereum.usd;
                const convertedEthAmount = total / ethRate;

                setEthAmount(convertedEthAmount);
            } catch (error) {
                console.error('Error fetching exchange rate:', error.message);
            }
        };

        fetchExchangeRate();
    }, [total]);


    const handlePayButtonClick = async () => {
        try {
            await window.ethereum.enable();
            const web3 = new Web3(window.ethereum);

            const paymentAddress = 'YOUR_ACCOUNT_ADDRESS_HERE';
            const amountEth = ethAmount;

            web3.eth.sendTransaction({
                to: paymentAddress,
                value: web3.utils.toWei(amountEth.toString(), 'ether'),
            })
                .on('transactionHash', (transactionHash) => {
                    console.log('Payment processing:', transactionHash);
                    setStatus('Payment processing...');
                })
                .on('receipt', (receipt) => {
                    console.log('Payment successful:', receipt.transactionHash);
                    setStatus('Payment successful');
                })
                .on('error', (err) => {
                    console.error('Payment failed:', err.message);
                    setStatus('Payment failed');
                });
        } catch (err) {
            console.error('Error:', err.message);
            setStatus('Error: ' + err.message);
        }
    };

    return (
        <div>
            <button onClick={handlePayButtonClick}>Pay with MetaMask</button>
            <div>{status}</div>
        </div>
    );
};

export default MetaMaskPaymentComponent;

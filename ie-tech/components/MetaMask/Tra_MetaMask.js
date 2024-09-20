import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import axios from 'axios';
import { showErrorToast, showSuccessToast } from '../Toast';

//import connPromise from '../../database/connect.js';

const MetaMask = ({ orderInfo }) => {
    const [web3, setWeb3] = useState(null);
    const [account, setAccount] = useState(null);
    const [ethRate, setEthRate] = useState(null);
    const [status, setStatus] = useState('');
    const [ethTotalPrice, setEthTotalPrice] = useState(null);

    useEffect(() => {
        const initializeWeb3 = async () => {
            try {
                //const connection = await connPromise;
                if (window.ethereum) {
                    const web3Instance = new Web3(window.ethereum);
                    setWeb3(web3Instance);

                    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                    setAccount(accounts[0]);
                } else {
                    console.log('MetaMask is not installed!');
                }
            } catch (error) {
                console.error('Error initializing MetaMask:', error);
            }
        };

        const fetchEthPrice = async () => {
            try {
                const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
                    params: {
                        ids: 'ethereum',
                        vs_currencies: 'usd',
                    },
                });
                console.log("rate: " + response.data.ethereum.usd);
                setEthRate(response.data.ethereum.usd);
                console.log("eth: " + ethRate);
                const totalInEth = orderInfo.total / parseInt(response.data.ethereum.usd);
                console.log("Tien in usd:" + orderInfo.total);
                console.log('total Int Rth: ' + totalInEth);
                setEthTotalPrice(totalInEth.toFixed(5));
            } catch (error) {
                console.error('Error fetching ETH price:', error);
            }
            //calculateTotalInEth();
        };

        const calculateTotalInEth = () => {
            if (ethRate) {
                const totalInEth = orderInfo.total / ethRate;
                setEthTotalPrice(totalInEth.toFixed(5));
                return totalInEth.toFixed(5); // Adjust the number of decimal places as needed
            }
            console.log("Ko tính dc");
            return null;
        };

        initializeWeb3();
        fetchEthPrice();

    }, []);

    /*
    const handlePayButtonClick = async () => {
        try {


            const paymentAddress = '0xc2ffa0f103f444a1acc9e391a6ed51eb0ee4dc47';
            const amountEth = ethTotalPrice;
            const fromAddress = account;
            const gasLimit = 21000; // You may need to adjust this value based on your transaction requirements
            const gasPrice = web3.utils.toWei('50', 'gwei');

            web3.eth.sendTransaction({
                from: fromAddress,
                to: paymentAddress,
                value: web3.utils.toWei(amountEth.toString(), 'ether'),
                gas: gasLimit,
                gasPrice: gasPrice,
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
    */



    const handlePayButtonClick = async () => {
        try {
            const paymentAddress = '0xc2ffa0f103f444a1acc9e391a6ed51eb0ee4dc47';
            const amountEth = ethTotalPrice;
            //const amountEth = 0.01;
            const fromAddress = account;
            const gasLimit = 21000;
            const gasPrice = web3.utils.toWei('60', 'gwei');

            const receipt = await new Promise((resolve, reject) => {
                web3.eth.sendTransaction({
                    from: fromAddress,
                    to: paymentAddress,
                    value: web3.utils.toWei(amountEth, 'ether'),
                    gas: gasLimit,
                    gasPrice: gasPrice,
                })
                    .on('transactionHash', (transactionHash) => {
                        console.log('Payment processing:', transactionHash);
                        setStatus('Payment processing...');
                    })
                    .on('receipt', resolve)
                    .on('error', reject);
            });

            if (receipt && receipt.transactionHash) {
                console.log('Payment successful:', receipt.transactionHash);
                setStatus('Payment successful');

                try {
                    /*

                    const response = await axios.post(`../SaveOrder`, {
                        total: orderInfo.total,
                        user_id: orderInfo.user_id,
                        plan_id: orderInfo.plan_id,
                        duration: orderInfo.duration,
                    });
                    console.log(response.status)

                    if (response.status !== 200) {
                        showSuccessToast('Thanh toán thất bại');
                        return;
                    }
                    /*
                    const response = await axios.post(`../../api/payment/save-payment`, {

                        total: orderInfo.total,
                        id: receipt.transactionHash,
                        user_id: orderInfo.user_id,
                        plan_id: orderInfo.plan_id,
                        duration: orderInfo.duration,

                    });

                    if (response.status !== 200) {
                        showSuccessToast('Thanh toán thất bại');
                        return;
                    }
                    */
                    const { user_id, total, plan_id, duration } = orderInfo;
                    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/createOrder`, {
                        method: 'POST',
                        body: JSON.stringify({
                            user_id: parseInt(user_id),
                            plan_id: plan_id,
                            duration: duration,
                            total: total,
                            status: 'Thành công'
                        }),

                        headers: {
                            'Content-Type': 'application/json',
                        },

                    });
                    //setSuccess(true);
                    showSuccessToast('Thanh toán thành công');
                } catch (err) {
                    console.error(`Error in save-payment API: ${err}`);
                    showSuccessToast('Lỗi khi lưu thanh toán');
                }
            } else {
                console.error('Payment failed: No receipt or transactionHash');
                setStatus('Payment failed');
            }
        } catch (err) {
            console.error('Error:', err.message);
            setStatus('Error: ' + err.message);
        }
    };




    return (
        <div>
            {web3 ? (
                <div>
                    <p>MetaMask is installed and connected.</p>
                    {account ? (
                        <div>
                            <p>Connected Account: {account}</p>
                            <p>Order Information:</p>
                            <ul>
                                <li>User ID: {orderInfo.user_id}</li>
                                <li>Plan ID: {orderInfo.plan_id}</li>
                                <li>Duration: {orderInfo.duration} months</li>
                                <li>Total: ${orderInfo.total} </li>
                                <li>Total in ETH: {ethTotalPrice} ETH</li>
                            </ul>
                            <button
                                style={{
                                    backgroundColor: 'black',
                                    borderRadius: '10px',
                                    color: 'white',
                                    padding: '10px',
                                    cursor: 'pointer',
                                    display: 'block',
                                    margin: 'auto',
                                }}
                                onClick={handlePayButtonClick}
                            >
                                Purchase with MetaMask
                            </button>
                        </div>
                    ) : (
                        <p>No account connected. Please connect MetaMask.</p>
                    )}
                </div>
            ) : (
                <p>MetaMask is not installed. Please install MetaMask to use this feature.</p>
            )}
        </div>
    );
};

export default MetaMask;
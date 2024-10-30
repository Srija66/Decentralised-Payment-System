async function main() {
    const PaymentSystem = await ethers.getContractFactory("PaymentSystem");

    // Deploy the contract and wait for it to be deployed
    const paymentSystem = await PaymentSystem.deploy();

    console.log("PaymentSystem deployed to:", paymentSystem.target);  // In ethers v6, use `target` instead of `address`
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });

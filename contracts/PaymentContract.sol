// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PaymentSystem {
    mapping(address => uint256) public balances;

    // Event to notify when payment is sent
    event PaymentSent(address indexed from, address indexed to, uint256 amount);

    // Function to send payment to a specific address
    function sendPayment(address recipient) public payable {
        require(msg.value > 0, "Payment amount should be more than zero");
        balances[recipient] += msg.value;

        emit PaymentSent(msg.sender, recipient, msg.value);
    }

    // Function to withdraw balance
    function withdrawPayment(uint256 amount) public {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        payable(msg.sender).transfer(amount);
        balances[msg.sender] -= amount;
    }

    // Function to check the contract balance (optional)
    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }
}

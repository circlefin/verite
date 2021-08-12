import { Contract, Wallet, getDefaultProvider } from "ethers"

export const listen = (): void => {
  const provider = getDefaultProvider("http://localhost:8545")

  const abi = [
    "event Transfer(address indexed from, address indexed to, uint amount)"
  ]

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"
  const contract = new Contract(contractAddress, abi, provider)

  contract.on("Transfer", (to, amount, from, extra) => {
    // 1. Find associated user given the to address
    // 2. Credit the user's account if it exists
    // 3. Find associated user given the from address
    // 4. Debit the user's account if it exists
    console.log(to, amount, from, extra)
  })
}

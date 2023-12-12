import { BiconomySmartAccount } from "@biconomy/account";
import { useState } from "react";

export default function Transfer({
    smartAccount,
}: {
    smartAccount: BiconomySmartAccount
}) {
    const [smartContractAddress, setSmartContractAddress] = useState('')

    async function getSmartContractAddress() {
        const _smartContractAddress = await smartAccount.getSmartAccountAddress()
        setSmartContractAddress(_smartContractAddress)
    }
}
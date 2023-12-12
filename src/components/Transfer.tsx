import { ERC20ABI, USDC_CONTRACT_ADDRESS } from "@/utils/constants";
import { BiconomySmartAccount } from "@biconomy/account";
import { IHybridPaymaster, PaymasterMode, SponsorUserOperationDto } from "@biconomy/paymaster";
import { ethers } from "ethers";
import { useEffect, useState } from "react";

export default function Transfer({
    smartAccount,
}: {
    smartAccount: BiconomySmartAccount
}) {
    const [smartContractAddress, setSmartContractAddress] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [amount, setAmount] = useState(0)
    const [recipient, setRecipient] = useState('')

    async function getSmartContractAddress() {
        const _smartContractAddress = await smartAccount.getSmartAccountAddress()
        setSmartContractAddress(_smartContractAddress)
    }

    useEffect(() => {
        getSmartContractAddress()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    async function transfer() {
        try {
            // Initiate loading state
            setIsLoading(true)

            // Create an Ethers Contract instance for USDC
            const readProvider = smartAccount.provider
            const tokenContract = new ethers.Contract(
                USDC_CONTRACT_ADDRESS,
                ERC20ABI,
                readProvider
            )

            // Fetch the amount of decimals in this ERC20 Contract
            const decimals = await tokenContract.decimals()
            // Convert the user inputted amount to the proper denomination unit based on the decimals
            const amountInLowestUnit = ethers.utils.parseUnits(
                amount.toString(),
                decimals
            )

            // Create the calldata for our UserOperation
            const populatedTransferTxn = await tokenContract.populateTransaction.transfer(
                recipient,
                amountInLowestUnit
            )
            const calldata = populatedTransferTxn.data

            // Build UserOperation
            const userOp = await smartAccount.buildUserOp([
                {
                    to: USDC_CONTRACT_ADDRESS,
                    data: calldata
                }
            ])

            // Get the paymaster fee quote from Biconomy
            const biconomyPaymaster = 
                smartAccount.paymaster as IHybridPaymaster<SponsorUserOperationDto>
            const feeQuoteResponse = 
                await biconomyPaymaster.getPaymasterFeeQuotesOrData(userOp, {
                    mode: PaymasterMode.ERC20,
                    tokenList: [],
                    preferredToken: USDC_CONTRACT_ADDRESS
                })
            const feeQuote = feeQuoteResponse.feeQuotes
            if (!feeQuote) throw new Error('Could not fetch fee quote in USDC')

            const spender = feeQuoteResponse.tokenPaymasterAddress || ''
            const selectedFeeQuote = feeQuote[0]

            // Build the paymaster userOp
            let finalUserOp = await smartAccount.buildTokenPaymasterUserOp(userOp, {
                feeQuote: selectedFeeQuote,
                spender,
                maxApproval: true
            })

            // Get the calldata for the paymaster
            const paymasterServiceData = {
                mode: PaymasterMode.ERC20,
                feeTokenAddress: USDC_CONTRACT_ADDRESS,
                calculateGasLimits: true
            }
            const paymasterAndDataResponse = 
                await biconomyPaymaster.getPaymasterAndData(
                    finalUserOp,
                    paymasterServiceData
                )
            finalUserOp.paymasterAndData = paymasterAndDataResponse.paymasterAndData

            if (
                paymasterAndDataResponse.callGasLimit &&
                paymasterAndDataResponse.verificationGasLimit &&
                paymasterAndDataResponse.preVerificationGas
            ) {
                // Returned gas limits must be replaced in your op as you update paymasterAndData
                // Because these are the limits paymaster service signed on to generate paymasterAndData

                finalUserOp.callGasLimit = paymasterAndDataResponse.callGasLimit
                finalUserOp.verificationGasLimit = 
                    paymasterAndDataResponse.verificationGasLimit
                finalUserOp.preVerificationGas = 
                    paymasterAndDataResponse.preVerificationGas
            }

            // Send the UserOperation
            const userOpResponse = await smartAccount.sendUserOp(finalUserOp)
            const receipt = await userOpResponse.wait()

            console.log(`Transaction Receipt: ${JSON.stringify(receipt, null, 2)}`)
            window.alert('Transaction Successful!')
        }
        catch (error) {
            console.log(error)
        }

        setIsLoading(false)
    }
}
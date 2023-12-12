import { BiconomySmartAccount, BiconomySmartAccountConfig } from '@biconomy/account'
import { ChainId } from '@biconomy/core-types'
import SocialLogin from '@biconomy/web3-auth'
import { ethers, providers } from 'ethers'
import { useEffect, useRef, useState } from 'react'

export default function Wallet() {
    const sdkRef = useRef<SocialLogin | null>(null)
    const [interval, enableInterval] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>()
    const [provider, setProvider] = useState<providers.Web3Provider>()
    const [smartAccount, setSmartAccount] = useState<BiconomySmartAccount>()

    async function login() {
        // If the SDK hasn't been initialized, initialize it.
        if (!sdkRef.current) {
            const socialLoginSDK = new SocialLogin()
            await socialLoginSDK.init({
                chainId: ethers.utils.hexValue(ChainId.POLYGON_MUMBAI).toString(),
                network: 'testnet'
            })
            sdkRef.current = socialLoginSDK;
        }

        // If the SDK is set up but the provider is not configured, initiate the timer to set up a smart account.
        if (!sdkRef.current.provider) {
            sdkRef.current.showWallet()
            enableInterval(true)
        }
        else {
            console.log('logged in')
            // setupSmartAccount()
        }
    }

    async function setupSmartAccount() {}

    useEffect(() => {
        let configureLogin: NodeJS.Timeout | undefined
        if (interval) {
            configureLogin = setInterval(() => {
                if (!!sdkRef.current?.provider) {
                    // setupSmartAccount()
                    clearInterval(configureLogin)
                }
            }, 1000)
        }
    }, [interval])
}

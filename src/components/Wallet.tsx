import { bundler, paymaster } from '@/utils/constants'
import { BiconomySmartAccount, BiconomySmartAccountConfig } from '@biconomy/account'
import { ChainId } from '@biconomy/core-types'
import SocialLogin from '@biconomy/web3-auth'
import { ethers, providers } from 'ethers'
import { Fragment, useEffect, useRef, useState } from 'react'
import Transfer from './Transfer'

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
            setupSmartAccount()
        }
    }

    async function setupSmartAccount() {
        try {
            // If the SDK hasn't fully initialized, return early
            if (!sdkRef.current?.provider) return

            // Hide the wallet if currently open
            sdkRef.current.hideWallet()

            // Start the loading indicator
            setLoading(true)

            let web3Provider = new ethers.providers.Web3Provider(
                sdkRef.current.provider
            )
            setProvider(web3Provider)

            const config: BiconomySmartAccountConfig = {
                signer: web3Provider.getSigner(),
                chainId: ChainId.POLYGON_MUMBAI,
                bundler,
                paymaster
            }
            const smartAccount = new BiconomySmartAccount(config)
            await smartAccount.init()

            // Save the smart account to a state variable
            setSmartAccount(smartAccount)
        }
        catch (e) {
            console.error(e)
        }

        setLoading(false)
    }

    async function logout() {
        await sdkRef.current?.logout()

        sdkRef.current?.hideWallet()

        // Reset the state and stop the interval if it is started
        setSmartAccount(undefined)
        enableInterval(false)
    }

    useEffect(() => {
        let configureLogin: NodeJS.Timeout | undefined
        if (interval) {
            configureLogin = setInterval(() => {
                if (!!sdkRef.current?.provider) {
                    setupSmartAccount()
                    clearInterval(configureLogin)
                }
            }, 1000)
        }
    }, [interval])

    return (
        <Fragment>
            {/* Logout Button */}
            <button
                onClick={logout}
                className='absolute right-0 m-3 rounded-lg bg-gradient-to-r from-green-400 to-blue-500 px-4 py-2 font-medium transition-all hover:from-green-500 hover:to-blue-600'
            >
                Logout
            </button>

            <div className='m-auto flex h-screen flex-col items-center justify-center gap-10 bg-gray-950'>
                <h1 className='text-4xl text-gray-50 font-bold tracking-tight lg:text-5xl'>
                    Send ERC20 using ERC20
                </h1>

                {/* Login Button */}
                {!smartAccount && !loading && (
                    <button
                        onClick={login}
                        className='mt-10 rounded-lg bg-gradient-to-r from-green-400 to-blue-500 px-4 py-2 font-medium transition-colors hover:from-green-500 hover:to-blue-600'
                    >
                        Login
                    </button>
                )}

                {/* Loading state */}
                {loading && <p>Loading account details...</p>}

                {smartAccount && (
                    <Fragment>
                        <Transfer smartAccount={smartAccount} />
                    </Fragment>
                )}
            </div>
        </Fragment>
    )
}

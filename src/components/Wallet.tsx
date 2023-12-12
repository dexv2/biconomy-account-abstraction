import SocialLogin from '@biconomy/web3-auth'
import { useEffect, useRef, useState } from 'react'

export default function Wallet() {
    const sdkRef = useRef<SocialLogin | null>(null)
    const [interval, enableInterval] = useState<boolean>(false)

    function login() {}

    function setupSmartAccount() {}

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
}
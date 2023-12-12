import { Bundler, IBundler } from '@biconomy/bundler'
import { ChainId } from '@biconomy/core-types'
import { DEFAULT_ENTRYPOINT_ADDRESS } from '@biconomy/account'
import { BiconomyPaymaster, IPaymaster } from '@biconomy/paymaster'

export const bundler: IBundler = new Bundler({
    bundlerUrl: `https://bundler.biconomy.io/api/v2/80001/nJPK7B3ru.dd7f7861-190d-41bd-af80-6877f74b8f44`,
    chainId: ChainId.POLYGON_MUMBAI,
    entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS
})

export const paymaster: IPaymaster = new BiconomyPaymaster({
    paymasterUrl: `https://paymaster.biconomy.io/api/v1/80001/${process.env.NEXT_PUBLIC_PAYMASTER_API}`
})

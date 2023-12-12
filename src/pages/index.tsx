import dynamic from 'next/dynamic'
import { Inter } from 'next/font/google'
import { Suspense } from 'react'

const Wallet = dynamic(
  () => import('../components/Wallet').then((res) => res.default),
  {ssr: false}
)

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  return (
    <main className={inter.className}>
      <Suspense fallback={<div>Loading...</div>}>
        <Wallet />
      </Suspense>
    </main>
  )
}

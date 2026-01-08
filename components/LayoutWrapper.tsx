"use client"

import { usePathname } from 'next/navigation'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'

// Pages where navbar and footer should be hidden
const noLayoutPages = ['/login']

// Pages where only footer should be hidden
const noFooterPages = ['/chat']

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const hideLayout = noLayoutPages.includes(pathname)
  const hideFooter = noFooterPages.includes(pathname)

  if (hideLayout) {
    return <>{children}</>
  }

  return (
    <>
      <Navbar />
      {children}
      {!hideFooter && <Footer />}
    </>
  )
}

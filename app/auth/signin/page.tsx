'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import SignInModal from '../../components/SignInModal'

export default function SignIn() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const isModal = searchParams?.get('modal') === '1'
  const callbackUrl = searchParams?.get('callbackUrl') || '/'

  // If modal parameter is present, show the modal version
  if (isModal) {
    return (
      <SignInModal
        isOpen={true}
        onClose={() => router.back()}
        callbackUrl={callbackUrl}
      />
    )
  }

  // Otherwise, show the full page version
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f1524]">
      <SignInModal
        isOpen={true}
        onClose={() => router.push('/')}
        callbackUrl={callbackUrl}
      />
    </div>
  )
} 
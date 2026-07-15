import LandingPage from '#/features/landing/components/LandingPage'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { getCurrentUser } from '#/lib/auth'

export const Route = createFileRoute('/_layout/')({
  beforeLoad: async () => {
    const user = await getCurrentUser()
    if (user) {
      throw redirect({
        to: '/dashboard',
      })
    }
  },
  component: Home,
})

function Home() {
  return (
    <LandingPage />
  )
}

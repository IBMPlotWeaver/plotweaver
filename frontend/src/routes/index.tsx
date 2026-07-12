import LandingPage from '#/features/landing/components/LandingPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <LandingPage />
  )
}

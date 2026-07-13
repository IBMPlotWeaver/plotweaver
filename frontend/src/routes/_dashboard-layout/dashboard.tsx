import { createFileRoute, redirect } from '@tanstack/react-router'
import { DashboardPage } from '#/features/dashboard/components/DashboardPage'
import { getCurrentUser } from '#/lib/auth'

export const Route = createFileRoute('/_dashboard-layout/dashboard')({
  beforeLoad: async () => {
    const user = await getCurrentUser()
    if (!user) {
      throw redirect({
        to: '/login',
        search: {
          redirect: '/dashboard',
        },
      })
    }
  },
  component: DashboardPage,
})

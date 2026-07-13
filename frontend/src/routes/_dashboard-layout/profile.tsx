import { createFileRoute, redirect } from '@tanstack/react-router'
import { ProfilePage } from '#/features/profile/components/ProfilePage'
import { getCurrentUser } from '#/lib/auth'

export const Route = createFileRoute('/_dashboard-layout/profile')({
  beforeLoad: async () => {
    const user = await getCurrentUser()
    if (!user) {
      throw redirect({
        to: '/login',
        search: {
          redirect: '/profile',
        },
      })
    }
  },
  component: ProfilePage,
})

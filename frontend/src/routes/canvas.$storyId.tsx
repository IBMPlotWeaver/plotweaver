import { createFileRoute, redirect } from '@tanstack/react-router'
import { StoryCanvas } from '#/features/canvas/components/StoryCanvas'
import { getCurrentUser } from '#/lib/auth'

export const Route = createFileRoute('/canvas/$storyId')({
  beforeLoad: async () => {
    if (typeof window === 'undefined') return; // Skip auth check during SSR
    const user = await getCurrentUser()
    if (!user) {
      throw redirect({
        to: '/login',
        search: {
          redirect: '/canvas/$storyId',
        },
      })
    }
  },
  component: StoryCanvas,
})

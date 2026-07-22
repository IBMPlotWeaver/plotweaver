import { createFileRoute } from '@tanstack/react-router'
import { StoryCanvas } from '#/features/canvas/components/StoryCanvas'

export const Route = createFileRoute('/canvas/guest')({
  component: GuestCanvas,
})

function GuestCanvas() {
  return <StoryCanvas isGuestMode={true} />
}

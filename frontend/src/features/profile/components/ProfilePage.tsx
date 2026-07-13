import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { supabase } from '#/lib/supabase'
import { Button } from '#/features/shadcn/components/ui/button'
import { Input } from '#/features/shadcn/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#/features/shadcn/components/ui/card'
import { useProfile, useUpdateProfile } from '../hooks/useProfile'

export function ProfilePage() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      return user
    },
  })

  const { data: profile, isLoading } = useProfile(user?.id)
  const updateProfileMutation = useUpdateProfile()

  const [isEditing, setIsEditing] = useState(false)
  const [username, setUsername] = useState('')

  const handleEdit = () => {
    setUsername(profile?.username || '')
    setIsEditing(true)
  }

  const handleSave = async () => {
    if (!user?.id) return

    try {
      await updateProfileMutation.mutateAsync({
        id: user.id,
        updates: { username },
      })
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to update profile:', error)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setUsername('')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
          <p className="text-sea-ink-soft">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/dashboard">
            <Button variant="outline">← Back to Dashboard</Button>
          </Link>
          <h1 className="text-4xl font-bold text-white">Profile</h1>
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          <Card className="island-shell">
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Manage your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-sea-ink-soft mb-2 block">
                  Email
                </label>
                <Input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-slate-800 border-line"
                />
                <p className="text-xs text-sea-ink-soft mt-1">
                  Email cannot be changed
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-sea-ink-soft mb-2 block">
                  Username
                </label>
                {isEditing ? (
                  <div className="space-y-2">
                    <Input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter username"
                      className="bg-slate-800 border-line"
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSave}
                        disabled={updateProfileMutation.isPending}
                        className="bg-gradient-to-r from-violet-600 to-fuchsia-500"
                      >
                        {updateProfileMutation.isPending ? 'Saving...' : 'Save'}
                      </Button>
                      <Button
                        onClick={handleCancel}
                        variant="outline"
                        disabled={updateProfileMutation.isPending}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Input
                      type="text"
                      value={profile?.username || 'Not set'}
                      disabled
                      className="bg-slate-800 border-line"
                    />
                    <Button onClick={handleEdit} variant="outline">
                      Edit
                    </Button>
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-sea-ink-soft mb-2 block">
                  Member Since
                </label>
                <Input
                  type="text"
                  value={
                    profile?.created_at
                      ? new Date(profile.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : 'Unknown'
                  }
                  disabled
                  className="bg-slate-800 border-line"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="island-shell">
            <CardHeader>
              <CardTitle className="text-red-500">Danger Zone</CardTitle>
              <CardDescription>Irreversible actions</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                onClick={async () => {
                  if (confirm('Are you sure you want to sign out?')) {
                    await supabase.auth.signOut()
                    window.location.href = '/'
                  }
                }}
              >
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

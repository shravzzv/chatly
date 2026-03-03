import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ModeToggle } from '@/components/mode-toggle'
import { ChatlyStoreProvider } from '@/providers/chatly-store-provider'
import { updateProfile } from '@/app/actions'
import { User } from '@supabase/supabase-js'
import { Profile } from '@/types/profile'

jest.mock('next/navigation')

const setThemeMock = jest.fn()

jest.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: setThemeMock,
  }),
}))

jest.mock('@/app/actions', () => ({
  updateProfile: jest.fn(),
}))

interface RenderWithStoreOptions {
  user?: User | null
  profile?: Profile | null
}

const renderWithStore = ({
  user = { id: '1' } as User,
  profile = { id: '1', theme: 'light' } as Profile,
}: RenderWithStoreOptions = {}) =>
  render(
    <ChatlyStoreProvider hydrationData={{ user, profile }}>
      <ModeToggle />
    </ChatlyStoreProvider>
  )

describe('ModeToggle', () => {
  it('renders screen-reader label', () => {
    renderWithStore()
    const label = screen.getByText(/toggle theme/i)

    expect(label).toBeInTheDocument()
    expect(label).toHaveClass('sr-only')
  })

  it('renders all theme options', async () => {
    renderWithStore()

    const user = userEvent.setup()
    await user.click(screen.getByRole('button'))

    expect(await screen.findByText('Light')).toBeInTheDocument()
    expect(screen.getByText('Dark')).toBeInTheDocument()
    expect(screen.getByText('System')).toBeInTheDocument()
  })

  it('changes theme when a different theme is selected', async () => {
    ;(updateProfile as jest.Mock).mockResolvedValue({
      updatedProfile: null,
    })

    renderWithStore()
    const user = userEvent.setup()
    await user.click(screen.getByRole('button'))
    await user.click(await screen.findByText('Dark'))

    expect(setThemeMock).toHaveBeenCalledWith('dark')
  })

  it('does not sync if selected theme is already active', async () => {
    renderWithStore()

    const user = userEvent.setup()

    await user.click(screen.getByRole('button'))
    await user.click(await screen.findByText('Light'))

    expect(updateProfile).not.toHaveBeenCalled()
  })

  it('syncs theme when profile exists', async () => {
    ;(updateProfile as jest.Mock).mockResolvedValue({
      updatedProfile: { theme: 'dark' },
    })

    renderWithStore()
    const user = userEvent.setup()
    await user.click(screen.getByRole('button'))
    await user.click(await screen.findByText('Dark'))

    expect(updateProfile).toHaveBeenCalledWith({ theme: 'dark' })
  })

  it('does not sync theme when logged out', async () => {
    renderWithStore({ profile: null })

    const user = userEvent.setup()
    await user.click(screen.getByRole('button'))
    await user.click(await screen.findByText('Dark'))

    expect(updateProfile).not.toHaveBeenCalled()
  })
})

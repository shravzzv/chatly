import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { DISCORD_SERVER_INVITE_URL, SUPPORT_EMAIL } from '@/data/constants'
import SupportPage from '@/app/(public)/support/page'

describe('Support page', () => {
  it('renders the support heading', () => {
    render(<SupportPage />)

    expect(
      screen.getByRole('heading', { name: /support/i }),
    ).toBeInTheDocument()
  })

  it('displays the support email with a mailto link', () => {
    render(<SupportPage />)

    const emailLink = screen.getByRole('link', {
      name: SUPPORT_EMAIL,
    })

    expect(emailLink).toBeInTheDocument()
    expect(emailLink).toHaveAttribute('href', `mailto:${SUPPORT_EMAIL}`)
  })

  it('renders a Discord community link that opens in a new tab', () => {
    render(<SupportPage />)

    const discordLink = screen.getByRole('link', {
      name: /join discord/i,
    })

    expect(discordLink).toBeInTheDocument()
    expect(discordLink).toHaveAttribute('href', DISCORD_SERVER_INVITE_URL)
    expect(discordLink).toHaveAttribute('target', '_blank')
    expect(discordLink).toHaveAttribute('rel', 'noopener noreferrer')
  })
})

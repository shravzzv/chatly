import { render, screen } from '@testing-library/react'
import { DISCORD_SERVER_INVITE_URL, SUBREDDIT_URL } from '@/data/constants'
import Footer from '@/components/footer'

jest.mock('@/components/mode-toggle', () => ({
  ModeToggle: () => <button>Toggle theme</button>,
}))

describe('Footer', () => {
  it('renders the brand name', () => {
    render(<Footer />)

    expect(screen.getByRole('heading', { name: /chatly/i })).toBeInTheDocument()
  })

  it('renders product links', () => {
    render(<Footer />)

    const links = ['features', 'pricing', 'download', 'support']

    links.forEach((link) => {
      expect(screen.getByRole('link', { name: link })).toBeInTheDocument()
    })
  })

  it('renders social links with correct URLs', () => {
    render(<Footer />)

    const discord = screen.getByRole('link', { name: /discord/i })
    const reddit = screen.getByRole('link', { name: /reddit/i })

    expect(discord).toHaveAttribute('href', DISCORD_SERVER_INVITE_URL)
    expect(reddit).toHaveAttribute('href', SUBREDDIT_URL)
  })

  it('renders legal links', () => {
    render(<Footer />)

    expect(
      screen.getByRole('link', { name: /privacy policy/i }),
    ).toHaveAttribute('href', '/privacy')

    expect(
      screen.getByRole('link', { name: /terms of service/i }),
    ).toHaveAttribute('href', '/tos')
  })

  it('external links open in a new tab securely', () => {
    render(<Footer />)

    const discord = screen.getByRole('link', { name: /discord/i })

    expect(discord).toHaveAttribute('target', '_blank')
    expect(discord).toHaveAttribute('rel', expect.stringContaining('noopener'))
  })

  it('shows the current year in the copyright', () => {
    render(<Footer />)

    const year = new Date().getFullYear().toString()

    expect(screen.getByText(new RegExp(year))).toBeInTheDocument()
  })

  it('matches the snapshot', () => {
    const { container } = render(<Footer />)
    expect(container).toMatchSnapshot()
  })
})

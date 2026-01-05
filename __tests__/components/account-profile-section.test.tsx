import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import AccountProfileSection from '@/components/account-profile-section'

describe('Account profile section', () => {
  it('should show a heading: Profile', async () => {
    render(<AccountProfileSection />)

    const heading = screen.getByRole('heading', {
      name: /profile/i,
      level: 2,
    })

    expect(heading).toBeInTheDocument()
  })
})

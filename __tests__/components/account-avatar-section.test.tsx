import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import AccountAvatarSection from '@/components/account-avatar-section'

describe('AccountAvatarSection', () => {
  it('renders helper text', () => {
    render(<AccountAvatarSection />)

    expect(screen.getByText(/click avatar to upload/i)).toBeInTheDocument()
  })
})

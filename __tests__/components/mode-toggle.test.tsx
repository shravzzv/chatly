import { render, screen } from '@testing-library/react'
import { ModeToggle } from '@/components/mode-toggle'

jest.mock('next-themes', () => ({
  useTheme: () => ({ theme: 'light', setTheme: jest.fn() }),
}))

describe('ModeToggle', () => {
  it('should render the toggle theme label for screen readers', () => {
    render(<ModeToggle />)

    const label = screen.getByText(/toggle theme/i)

    expect(label).toBeInTheDocument()
    // check if it's specifically that sr-only class if you want to be strict
    expect(label).toHaveClass('sr-only')
  })
})

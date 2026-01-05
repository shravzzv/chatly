import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import AccountDangerZone from '@/components/account-danger-zone'

describe('Account danger zone', () => {
  it('should contain a red danger warning', () => {
    render(<AccountDangerZone />)

    const heading = screen.getByRole('heading', {
      name: /danger zone/i,
    })

    expect(heading).toBeInTheDocument()
    expect(heading).toHaveClass('text-red-500')
  })
})

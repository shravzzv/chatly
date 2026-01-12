import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NotificationsToggle } from '@/components/notifications-toggle'
import { subscribeUser, unsubscribeUser } from '@/app/actions'
import { toast } from 'sonner'

jest.mock('next/navigation')

jest.mock('@/app/actions', () => ({
  subscribeUser: jest.fn(),
  unsubscribeUser: jest.fn(),
}))

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}))

beforeEach(() => {
  // Notification API
  Object.defineProperty(global, 'Notification', {
    value: { permission: 'granted' },
    writable: true,
    configurable: true,
  })

  // Service Worker mock
  const mockSubscription = {
    unsubscribe: jest.fn(),
  }

  const mockRegistration = {
    pushManager: {
      getSubscription: jest.fn().mockResolvedValue(null),
      subscribe: jest.fn().mockResolvedValue(mockSubscription),
    },
  }

  Object.defineProperty(navigator, 'serviceWorker', {
    value: {
      register: jest.fn().mockResolvedValue(mockRegistration),
      ready: Promise.resolve(mockRegistration),
    },
    writable: true,
  })

  // PushManager support flag
  Object.defineProperty(window, 'PushManager', {
    value: {},
    writable: true,
    configurable: true,
  })

  jest.clearAllMocks()
})

describe('NotificationsToggle', () => {
  it('renders a loading state while checking support', () => {
    render(<NotificationsToggle />)

    expect(screen.getByText(/web push notifications/i)).toBeInTheDocument()
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('shows unsupported alert when push is unavailable', async () => {
    delete (globalThis as { PushManager?: unknown }).PushManager

    render(<NotificationsToggle />)

    await waitFor(() => {
      expect(
        screen.getByText(/doesn't fully support web push notifications/i)
      ).toBeInTheDocument()
    })
  })

  it('renders the notifications toggle when supported', async () => {
    render(<NotificationsToggle />)

    await waitForElementToBeRemoved(() => screen.getByRole('status'))

    expect(screen.getByRole('switch')).toBeInTheDocument()
  })

  it('subscribes to push notifications when toggled on', async () => {
    ;(subscribeUser as jest.Mock).mockResolvedValue({ success: true })

    render(<NotificationsToggle />)

    const user = userEvent.setup()
    const toggle = await screen.findByRole('switch')
    await user.click(toggle)

    await waitFor(() => {
      expect(subscribeUser).toHaveBeenCalled()
      expect(toast.success).toHaveBeenCalledWith(
        'Web push notifications enabled'
      )
    })
  })

  it('does not subscribe when permission is denied', async () => {
    // Simulate denied permission
    Object.defineProperty(Notification, 'permission', {
      value: 'denied',
    })

    render(<NotificationsToggle />)

    const user = userEvent.setup()
    const toggle = await screen.findByRole('switch')
    await user.click(toggle)

    expect(subscribeUser).not.toHaveBeenCalled()
    expect(toast.info).toHaveBeenCalled()
  })

  it('unsubscribes from push notifications when toggled off', async () => {
    const mockUnsubscribe = jest.fn()

    // Make the initial subscription exist
    const mockSubscription = {
      unsubscribe: mockUnsubscribe,
    }

    // Override getSubscription to return an existing subscription
    ;(navigator.serviceWorker.register as jest.Mock).mockResolvedValueOnce({
      pushManager: {
        getSubscription: jest.fn().mockResolvedValue(mockSubscription),
        subscribe: jest.fn(),
      },
    })
    ;(unsubscribeUser as jest.Mock).mockResolvedValue({ success: true })

    render(<NotificationsToggle />)

    // Wait until loading finishes and switch is visible
    const toggle = await screen.findByRole('switch')

    const user = userEvent.setup()
    // Toggle OFF (it starts ON because subscription exists)
    await user.click(toggle)

    await waitFor(() => {
      expect(mockUnsubscribe).toHaveBeenCalled()
      expect(unsubscribeUser).toHaveBeenCalled()
      expect(toast.success).toHaveBeenCalledWith(
        'Unsubscribed from web push notifications'
      )
    })
  })
})

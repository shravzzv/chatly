import { render } from '@testing-library/react-native'
import { Text } from 'react-native'

it('2 + 2 is 4', () => {
  expect(2 + 2).toBe(4)
})

it('2 + 2 is not 34', () => {
  expect(2 + 2).not.toBe(34)
})

it('renders text', () => {
  const { getByText } = render(<Text>Hello</Text>)
  expect(getByText('Hello')).toBeTruthy()
})

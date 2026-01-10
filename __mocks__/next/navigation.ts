export const useRouter = jest.fn().mockReturnValue({
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
})

export const usePathname = jest.fn().mockReturnValue('')

export const useSearchParams = jest.fn().mockReturnValue({
  get: jest.fn().mockReturnValue(null),
})

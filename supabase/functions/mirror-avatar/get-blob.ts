export const getBlob = async (avatarUrl: string) => {
  const response = await fetch(avatarUrl)
  if (!response.ok) {
    throw new Error(`Failed to fetch avatar: ${response.status}`)
  }
  const blob = await response.blob()
  return blob
}
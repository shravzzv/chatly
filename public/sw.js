self.addEventListener('push', (event) => {
  const data = event.data.json()

  const title = data.title || 'New message'
  const options = {
    body: data.body,
    icon: data.icon || '/default-avatar.jpg',
    badge: '/icon-192x192.png',
    data: {
      senderId: data.senderId,
      receiverId: data.receiverId,
    },
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const senderId = event.notification.data?.senderId
  const url = senderId ? `/dashboard?selectedUserId=${senderId}` : '/dashboard'

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url.includes('/dashboard') && 'focus' in client) {
            return client.focus().then(() => client.navigate(url))
          }
        }
        // If no window is open, open a new one
        return clients.openWindow(url)
      })
  )
})

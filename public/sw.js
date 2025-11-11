self.addEventListener('push', (event) => {
  const data = event.data.json()

  const title = data.title || 'New message'
  const options = {
    body: data.body,
    icon: data.icon || '/default-avatar.jpg',
    badge: '/icon-192x192.png',
    data: data.url ? { url: data.url } : {},
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || '/'
  event.waitUntil(clients.openWindow(url))
})

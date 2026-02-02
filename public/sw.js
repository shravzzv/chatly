self.addEventListener('push', (event) => {
  const data = event.data.json()

  const title = data.title || 'New message'
  const options = {
    body: data.body,
    icon: data.icon,
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
  const targetUrl = senderId ? `/dashboard?senderId=${senderId}` : '/dashboard'

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          // Reuse any existing dashboard tab
          if (client.url.startsWith(self.location.origin + '/dashboard')) {
            return client.focus().then(() => client.navigate(targetUrl))
          }
        }

        // No dashboard tab found → open a new one
        return clients.openWindow(targetUrl)
      }),
  )
})

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

self.addEventListener('push', function (event) {
  if (event.data) {
    const data = event.data.json()

    let title = '할 일을 시작해보세요!'
    if (data.data.kind === 'end') title = '할 일을 확인해보세요!'
    event.waitUntil(
      self.registration.showNotification(title, {
        body: data.data.text,
        icon: '/images/pwa-192x192.png',
        badge: '/images/pwa-48x48.png',
        vibrate: [100, 50, 100],
        data: {
          todo_id: data.data.todo_id,
          dateOfArrival: Date.now(),
          primaryKey: '2',
        },
      })
    )
  }
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const id = event.notification.data?.todo_id
  const path = event.notification.data?.todo_id ? `/?move-to=${`/todos/${id}`}` : '/'

  event.waitUntil(
    (async () => {
      const url = new URL(path, self.location.origin).toString()

      const windowClients = await clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      })

      for (const client of windowClients) {
        const path = `/todos/${id}`
        client.postMessage({ type: 'NAVIGATE', path })
        if ('focus' in client) return client.focus()
      }

      clients.openWindow(url)
    })()
  )
})

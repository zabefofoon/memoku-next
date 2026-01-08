const ENABLE_LANGUAGES = ['ko', 'en', 'ja']
let lang = 'en'
for (let i = 0; i < ENABLE_LANGUAGES.length; i++) {
  const enableLanguages = ENABLE_LANGUAGES[i]
  if (self.navigator.language.startsWith(enableLanguages)) {
    lang = enableLanguages
  }
}

const messages = {
  ko: {
    RetensionText: '할 일을 관리해볼까요?',
    RetesionBody: '메모쿠를 켜서 할 일을 등록해보세요.',
  },
  en: {
    RetensionText: 'Ready to manage your tasks?',
    RetesionBody: 'Open Memoku and start adding your tasks.',
  },
  ja: {
    RetensionText: 'やることを管理してみませんか？',
    RetesionBody: 'Memokuを開いて、やることを登録してみましょう。',
  },
}

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
    if (data.data.kind === 'retention') title = messages[lang][data.data.text]
    else if (data.data.kind === 'end') title = '할 일을 확인해보세요!'

    const body = data.data.kind === 'retention' ? messages[lang]['RetesionBody'] : data.data.text

    event.waitUntil(
      self.registration.showNotification(title, {
        body: body,
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
  const path = id ? `/?move-to=${`/app/todos/${id}`}` : '/'

  event.waitUntil(
    (async () => {
      const url = new URL(path, self.location.origin).toString()

      const windowClients = await clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      })

      for (const client of windowClients) {
        const path = id ? `/app/todos/${id}` : '/'
        client.postMessage({ type: 'NAVIGATE', path })
        if ('focus' in client) return client.focus()
      }

      clients.openWindow(url)
    })()
  )
})

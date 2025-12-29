export async function POST(req: Request) {
  const { subscription, device_id } = await req.json()

  return fetch(`${process.env.ALARM_API_SERVER}/memoku-alarm/subscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ subscription: subscription, device_id: device_id }),
  })
}

export async function DELETE(req: Request) {
  const { device_id } = await req.json()

  return fetch(`${process.env.ALARM_API_SERVER}/memoku-alarm/subscribe`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ device_id }),
  })
}

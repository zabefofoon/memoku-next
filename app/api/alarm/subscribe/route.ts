import { COOKIE_DEVICE_ID } from '@/const'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  const { subscription, device_id, timezone } = await req.json()

  return fetch(`${process.env.ALARM_API_SERVER}/memoku-alarm/subscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ subscription, device_id, timezone }),
  })
}

export async function PUT(req: Request) {
  const cookieStore = await cookies()
  const { subscription } = await req.json()
  const device_id = cookieStore.get(COOKIE_DEVICE_ID)?.value

  return fetch(`${process.env.ALARM_API_SERVER}/memoku-alarm/subscribe`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ subscription, device_id }),
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

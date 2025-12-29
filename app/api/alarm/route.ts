export async function POST(req: Request) {
  const { params } = await req.json()
  return fetch(`${process.env.ALARM_API_SERVER}/memoku-alarm/regist`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(params),
  })
}

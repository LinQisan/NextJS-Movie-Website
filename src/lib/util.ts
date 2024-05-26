import { getPlaiceholder } from 'plaiceholder'

export const yearDiff = (date: string) => {
  return new Date(Date.now()).getFullYear() - new Date(date).getFullYear()
}

export async function getBase64(url: string) {
  try {
    const buffer = await fetch(url).then(async res =>
      Buffer.from(await res.arrayBuffer())
    )

    const { base64 } = await getPlaiceholder(buffer)
    return base64
  } catch (err) {
    err
  }
}

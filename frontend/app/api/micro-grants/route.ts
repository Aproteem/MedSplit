import { NextResponse } from "next/server"
import path from "path"
import { promises as fs } from "fs"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const dataFilePath = path.resolve(process.cwd(), "..", "backend", "data.json")
    const file = await fs.readFile(dataFilePath, "utf-8")
    const data = JSON.parse(file)
    const grants = Array.isArray(data.micro_grants) ? data.micro_grants : []
    return NextResponse.json({ micro_grants: grants })
  } catch (error) {
    return NextResponse.json({ micro_grants: [], error: "Failed to read data" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const title = String(body?.title || "").trim()
    const amount = Number(body?.amount || 0)
    const description = String(body?.description || "").trim()
    const userId = Number(body?.userId || 0)
    const userEmail = typeof body?.email === 'string' ? body.email : ''

    if (!title || !description || !amount || amount < 1 || amount > 200) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 })
    }

    const dataFilePath = path.resolve(process.cwd(), "..", "backend", "data.json")
    const file = await fs.readFile(dataFilePath, "utf-8")
    const data = JSON.parse(file)
    const microGrants: any[] = Array.isArray(data.micro_grants) ? data.micro_grants : []

    let requesterName = "Anonymous"
    if (userId) {
      const profiles: any[] = Array.isArray(data.profiles) ? data.profiles : []
      const users: any[] = Array.isArray(data.users) ? data.users : []
      const profile = profiles.find(p => Number(p.user_id) === userId)
      if (profile) {
        const first = (profile.first_name || '').toString().trim()
        const last = (profile.last_name || '').toString().trim()
        const joined = `${first} ${last}`.trim()
        if (joined) requesterName = joined
      }
      if (requesterName === "Anonymous") {
        const user = users.find(u => Number(u.id) === userId)
        const email = (user?.email || userEmail || '').toString()
        if (email) requesterName = email.split('@')[0]
      }
    }

    const newId = microGrants.length > 0 ? Math.max(...microGrants.map(g => Number(g.id) || 0)) + 1 : 1
    const newGrant = {
      id: newId,
      requesterName,
      title,
      description,
      amountNeeded: amount,
      amountRaised: 0,
      timePosted: "just now",
      supporters: 0,
      verified: false,
      urgent: false,
      requestor_id: userId || null
    }

    const updated = { ...data, micro_grants: [newGrant, ...microGrants] }
    await fs.writeFile(dataFilePath, JSON.stringify(updated, null, 2), "utf-8")

    return NextResponse.json({ micro_grant: newGrant }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to save grant" }, { status: 500 })
  }
}



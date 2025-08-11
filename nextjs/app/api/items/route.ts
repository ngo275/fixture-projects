import { NextResponse } from 'next/server'
import { ensureItemsTable, getPool, Item } from '@/lib/db'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  try {
    await ensureItemsTable()
    const pool = getPool()
    const { rows } = await pool.query<Item>('SELECT * FROM items ORDER BY id DESC')
    return NextResponse.json(rows)
  } catch (error) {
    console.error('GET /api/items error', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await ensureItemsTable()
    const body = await request.json()
    const name: unknown = body?.name
    const description: unknown = body?.description ?? null

    if (typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 })
    }

    if (description !== null && typeof description !== 'string') {
      return NextResponse.json({ error: 'description must be string or null' }, { status: 400 })
    }

    const pool = getPool()
    const { rows } = await pool.query<Item>(
      'INSERT INTO items (name, description) VALUES ($1, $2) RETURNING *',
      [name.trim(), description]
    )
    return NextResponse.json(rows[0], { status: 201 })
  } catch (error) {
    console.error('POST /api/items error', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}



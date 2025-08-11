import { NextResponse } from 'next/server'
import { ensureItemsTable, getPool, Item } from '@/lib/db'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function parseId(param: string | string[] | undefined): number | null {
  if (typeof param !== 'string') return null
  const idNum = Number(param)
  return Number.isInteger(idNum) && idNum > 0 ? idNum : null
}

function getIdFromContext(context: unknown): number | null {
  if (!context || typeof context !== 'object') return null
  const params = (context as { params?: unknown }).params
  if (!params || typeof params !== 'object') return null
  const rawId = (params as { id?: unknown }).id
  if (typeof rawId === 'string') return parseId(rawId)
  if (Array.isArray(rawId) && rawId.length > 0 && typeof rawId[0] === 'string') {
    return parseId(rawId[0])
  }
  return null
}

export async function GET(
  _req: Request,
  context: unknown
) {
  try {
    await ensureItemsTable()
    const id = getIdFromContext(context)
    if (!id) return NextResponse.json({ error: 'invalid id' }, { status: 400 })
    const pool = getPool()
    const { rows } = await pool.query<Item>('SELECT * FROM items WHERE id = $1', [id])
    if (rows.length === 0) return NextResponse.json({ error: 'not found' }, { status: 404 })
    return NextResponse.json(rows[0])
  } catch (error) {
    console.error('GET /api/items/:id error', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  context: unknown
) {
  try {
    await ensureItemsTable()
    const id = getIdFromContext(context)
    if (!id) return NextResponse.json({ error: 'invalid id' }, { status: 400 })
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
      'UPDATE items SET name = $1, description = $2 WHERE id = $3 RETURNING *',
      [name.trim(), description, id]
    )
    if (rows.length === 0) return NextResponse.json({ error: 'not found' }, { status: 404 })
    return NextResponse.json(rows[0])
  } catch (error) {
    console.error('PUT /api/items/:id error', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  context: unknown
) {
  try {
    await ensureItemsTable()
    const id = getIdFromContext(context)
    if (!id) return NextResponse.json({ error: 'invalid id' }, { status: 400 })
    const pool = getPool()
    const { rowCount } = await pool.query('DELETE FROM items WHERE id = $1', [id])
    if (rowCount === 0) return NextResponse.json({ error: 'not found' }, { status: 404 })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('DELETE /api/items/:id error', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}



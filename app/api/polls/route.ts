import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { CreatePollData } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Parse request body
    const body: CreatePollData = await request.json()
    
    // Validate required fields
    if (!body.title || !body.options || body.options.length < 2) {
      return NextResponse.json(
        { error: 'Title and at least 2 options are required' },
        { status: 400 }
      )
    }

    // Validate title length
    if (body.title.trim().length < 3 || body.title.trim().length > 200) {
      return NextResponse.json(
        { error: 'Title must be between 3 and 200 characters' },
        { status: 400 }
      )
    }

    // Validate options count
    if (body.options.length > 10) {
      return NextResponse.json(
        { error: 'Maximum 10 options allowed' },
        { status: 400 }
      )
    }

    // Filter out empty options
    const validOptions = body.options.filter(option => option.trim() !== '')
    
    if (validOptions.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 non-empty options are required' },
        { status: 400 }
      )
    }

    // Create poll in database
    const { data: poll, error: dbError } = await supabase
      .from('polls')
      .insert({
        title: body.title.trim(),
        description: body.description?.trim() || null,
        options: validOptions,
        user_id: user.id,
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { error: 'Failed to create poll' },
        { status: 500 }
      )
    }

    return NextResponse.json({ poll }, { status: 201 })
    
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    let query = supabase
      .from('polls')
      .select('*')
      .order('created_at', { ascending: false })

    // If userId is provided, get user's polls, otherwise get all active polls
    if (userId) {
      // Check authentication for user-specific polls
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user || user.id !== userId) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
      
      query = query.eq('user_id', userId)
    } else {
      query = query.eq('is_active', true)
    }

    const { data: polls, error } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch polls' },
        { status: 500 }
      )
    }

    return NextResponse.json({ polls })
    
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
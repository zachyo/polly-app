/**
 * @jest-environment node
 */

import { POST, GET } from '@/app/api/polls/route'
import { createClient } from '@/lib/supabase/server'

// Mock the Supabase server client
jest.mock('@/lib/supabase/server')
const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>

// Mock NextRequest
class MockNextRequest {
  constructor(public url: string, public init: RequestInit = {}) {}
  
  async json() {
    return JSON.parse(this.init.body as string || '{}')
  }
}

// Mock URL constructor for search params
// global.URL = class MockURL {
//   searchParams: URLSearchParams
  
//   constructor(url: string) {
//     const [baseUrl, search] = url.split('?')
//     this.searchParams = new URLSearchParams(search || '')
//   }
// } as any

describe('/api/polls Integration Tests', () => {
  let mockSupabase: any

  beforeEach(() => {
    jest.clearAllMocks()
    
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      single: jest.fn(),
      auth: {
        getUser: jest.fn()
      }
    }
    
    // Make the mock thenable
    mockSupabase.then = (resolve: any, reject: any) => {
      if (mockSupabase.mockError) {
        return Promise.reject(mockSupabase.mockError).catch(reject)
      }
      return Promise.resolve({ data: mockSupabase.mockData, error: null }).then(resolve)
    }
    
    mockSupabase.single.mockImplementation(() => mockSupabase)
    
    mockCreateClient.mockResolvedValue(mockSupabase)
  })

  describe('POST /api/polls', () => {
    it('should create a poll successfully with valid data and authentication', async () => {
      // Arrange
      const mockUser = { id: 'user1', email: 'test@example.com' }
      const pollData = {
        title: 'Test Poll',
        description: 'Test Description',
        options: ['Option 1', 'Option 2']
      }
      const mockCreatedPoll = {
        id: 'poll1',
        ...pollData,
        user_id: 'user1',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        is_active: true
      }

      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })
      mockSupabase.mockData = mockCreatedPoll

      const request = new MockNextRequest('http://localhost:3000/api/polls', {
        method: 'POST',
        body: JSON.stringify(pollData),
        headers: { 'Content-Type': 'application/json' }
      })

      // Act
      const response = await POST(request as any)
      const responseData = await response.json()

      // Assert
      expect(response.status).toBe(201)
      expect(responseData.poll).toEqual(mockCreatedPoll)
      expect(mockSupabase.from).toHaveBeenCalledWith('polls')
      expect(mockSupabase.insert).toHaveBeenCalledWith({
        ...pollData,
        user_id: 'user1'
      })
    })

    it('should return 401 when user is not authenticated', async () => {
      // Arrange
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null })

      const request = new MockNextRequest('http://localhost:3000/api/polls', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Test Poll',
          options: ['Option 1', 'Option 2']
        }),
        headers: { 'Content-Type': 'application/json' }
      })

      // Act
      const response = await POST(request as any)
      const responseData = await response.json()

      // Assert
      expect(response.status).toBe(401)
      expect(responseData.error).toBe('Authentication required')
    })

    it('should return 400 when title is missing', async () => {
      // Arrange
      const mockUser = { id: 'user1', email: 'test@example.com' }
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })

      const request = new MockNextRequest('http://localhost:3000/api/polls', {
        method: 'POST',
        body: JSON.stringify({
          options: ['Option 1', 'Option 2']
        }),
        headers: { 'Content-Type': 'application/json' }
      })

      // Act
      const response = await POST(request as any)
      const responseData = await response.json()

      // Assert
      expect(response.status).toBe(400)
      expect(responseData.error).toBe('Title and at least 2 options are required')
    })

    it('should return 400 when title is too short', async () => {
      // Arrange
      const mockUser = { id: 'user1', email: 'test@example.com' }
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })

      const request = new MockNextRequest('http://localhost:3000/api/polls', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Hi',
          options: ['Option 1', 'Option 2']
        }),
        headers: { 'Content-Type': 'application/json' }
      })

      // Act
      const response = await POST(request as any)
      const responseData = await response.json()

      // Assert
      expect(response.status).toBe(400)
      expect(responseData.error).toBe('Title must be between 3 and 200 characters')
    })

    it('should return 500 when database operation fails', async () => {
      // Arrange
      const mockUser = { id: 'user1', email: 'test@example.com' }
      const dbError = new Error('Database connection failed')

      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })
      mockSupabase.mockError = dbError

      const request = new MockNextRequest('http://localhost:3000/api/polls', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Test Poll',
          options: ['Option 1', 'Option 2']
        }),
        headers: { 'Content-Type': 'application/json' }
      })

      // Act
      const response = await POST(request as any)
      const responseData = await response.json()

      // Assert
      expect(response.status).toBe(500)
      expect(responseData.error).toBe('Failed to create poll')
    })
  })

  describe('GET /api/polls', () => {
    it('should return active polls when no userId provided', async () => {
      // Arrange
      const mockPolls = [
        {
          id: 'poll1',
          title: 'Active Poll 1',
          description: 'Description 1',
          options: ['Option 1', 'Option 2'],
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
          user_id: 'user1',
          is_active: true
        }
      ]

      mockSupabase.mockData = mockPolls

      const request = new MockNextRequest('http://localhost:3000/api/polls')

      // Act
      const response = await GET(request as any)
      const responseData = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(responseData.polls).toEqual(mockPolls)
      expect(mockSupabase.eq).toHaveBeenCalledWith('is_active', true)
    })

    it('should return 401 when requesting user polls without authentication', async () => {
      // Arrange
      const userId = 'user1'
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null })

      const request = new MockNextRequest(`http://localhost:3000/api/polls?userId=${userId}`)

      // Act
      const response = await GET(request as any)
      const responseData = await response.json()

      // Assert
      expect(response.status).toBe(401)
      expect(responseData.error).toBe('Unauthorized')
    })

    it('should return 500 when database query fails', async () => {
      // Arrange
      const dbError = new Error('Database connection failed')
      mockSupabase.mockError = dbError

      const request = new MockNextRequest('http://localhost:3000/api/polls')

      // Act
      const response = await GET(request as any)
      const responseData = await response.json()

      // Assert
      expect(response.status).toBe(500)
      expect(responseData.error).toBe('Failed to fetch polls')
    })
  })
})
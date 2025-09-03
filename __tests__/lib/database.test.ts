import { pollsApi } from '@/lib/database'
import { createClient } from '@/lib/supabase/client'
import { Poll, CreatePollData, VoteData } from '@/lib/types'

// Mock the Supabase client
jest.mock('@/lib/supabase/client')
const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>

// Mock fetch for API calls
global.fetch = jest.fn()

describe('pollsApi', () => {
  let mockSupabase: any

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()
    
    // Create mock Supabase client
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      single: jest.fn(),
      auth: {
        getUser: jest.fn()
      }
    }
    
    mockCreateClient.mockReturnValue(mockSupabase)
  })

  describe('getActivePolls', () => {
    it('should return active polls successfully', async () => {
      // Arrange
      const mockPolls: Poll[] = [
        {
          id: '1',
          title: 'Test Poll',
          description: 'Test Description',
          options: ['Option 1', 'Option 2'],
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
          user_id: 'user1',
          is_active: true
        }
      ]
      
      mockSupabase.order.mockResolvedValue({ data: mockPolls, error: null })

      // Act
      const result = await pollsApi.getActivePolls()

      // Assert
      expect(result).toEqual(mockPolls)
      expect(mockSupabase.from).toHaveBeenCalledWith('polls')
      expect(mockSupabase.select).toHaveBeenCalledWith('*')
      expect(mockSupabase.eq).toHaveBeenCalledWith('is_active', true)
      expect(mockSupabase.order).toHaveBeenCalledWith('created_at', { ascending: false })
    })

    it('should return empty array when no polls found', async () => {
      // Arrange
      mockSupabase.order.mockResolvedValue({ data: null, error: null })

      // Act
      const result = await pollsApi.getActivePolls()

      // Assert
      expect(result).toEqual([])
    })

    it('should throw error when database query fails', async () => {
      // Arrange
      const mockError = new Error('Database connection failed')
      mockSupabase.order.mockResolvedValue({ data: null, error: mockError })

      // Act & Assert
      await expect(pollsApi.getActivePolls()).rejects.toThrow('Database connection failed')
    })
  })

  describe('createPoll', () => {
    it('should create poll successfully when user is authenticated', async () => {
      // Arrange
      const mockUser = { id: 'user1', email: 'test@example.com' }
      const pollData: CreatePollData = {
        title: 'New Poll',
        description: 'Poll description',
        options: ['Option 1', 'Option 2']
      }
      const mockCreatedPoll: Poll = {
        id: 'poll1',
        ...pollData,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        user_id: 'user1',
        is_active: true
      }

      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })
      mockSupabase.single.mockResolvedValue({ data: mockCreatedPoll, error: null })

      // Act
      const result = await pollsApi.createPoll(pollData)

      // Assert
      expect(result).toEqual(mockCreatedPoll)
      expect(mockSupabase.from).toHaveBeenCalledWith('polls')
      expect(mockSupabase.insert).toHaveBeenCalledWith({
        ...pollData,
        user_id: 'user1'
      })
      expect(mockSupabase.select).toHaveBeenCalled()
      expect(mockSupabase.single).toHaveBeenCalled()
    })

    it('should throw error when user is not authenticated', async () => {
      // Arrange
      const pollData: CreatePollData = {
        title: 'New Poll',
        description: 'Poll description',
        options: ['Option 1', 'Option 2']
      }

      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null })

      // Act & Assert
      await expect(pollsApi.createPoll(pollData)).rejects.toThrow('User not authenticated')
    })

    it('should throw error when database insert fails', async () => {
      // Arrange
      const mockUser = { id: 'user1', email: 'test@example.com' }
      const pollData: CreatePollData = {
        title: 'New Poll',
        description: 'Poll description',
        options: ['Option 1', 'Option 2']
      }
      const mockError = new Error('Insert failed')

      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })
      mockSupabase.single.mockResolvedValue({ data: null, error: mockError })

      // Act & Assert
      await expect(pollsApi.createPoll(pollData)).rejects.toThrow('Insert failed')
    })
  })

  describe('getPollWithResults', () => {
    it('should return poll with results when found', async () => {
      // Arrange
      const pollId = 'poll1'
      const mockPollWithResults = {
        id: pollId,
        title: 'Test Poll',
        description: 'Test Description',
        options: ['Option 1', 'Option 2'],
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        user_id: 'user1',
        is_active: true,
        vote_counts: { '0': 5, '1': 3 },
        total_votes: 8
      }

      mockSupabase.single.mockResolvedValue({ data: mockPollWithResults, error: null })

      // Act
      const result = await pollsApi.getPollWithResults(pollId)

      // Assert
      expect(result).toEqual(mockPollWithResults)
      expect(mockSupabase.from).toHaveBeenCalledWith('poll_results')
      expect(mockSupabase.select).toHaveBeenCalledWith('*')
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', pollId)
      expect(mockSupabase.single).toHaveBeenCalled()
    })

    it('should return null when poll not found', async () => {
      // Arrange
      const pollId = 'nonexistent'
      const notFoundError = { code: 'PGRST116', message: 'Not found' }

      mockSupabase.single.mockResolvedValue({ data: null, error: notFoundError })

      // Act
      const result = await pollsApi.getPollWithResults(pollId)

      // Assert
      expect(result).toBeNull()
    })

    it('should throw error for other database errors', async () => {
      // Arrange
      const pollId = 'poll1'
      const mockError = { code: 'PGRST500', message: 'Internal server error' }

      mockSupabase.single.mockResolvedValue({ data: null, error: mockError })

      // Act & Assert
      await expect(pollsApi.getPollWithResults(pollId)).rejects.toEqual(mockError)
    })
  })

  describe('togglePollStatus', () => {
    it('should toggle poll status from active to inactive', async () => {
      // Arrange
      const pollId = 'poll1'
      const currentPoll = { is_active: true }
      const updatedPoll: Poll = {
        id: pollId,
        title: 'Test Poll',
        description: 'Test Description',
        options: ['Option 1', 'Option 2'],
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        user_id: 'user1',
        is_active: false
      }

      // Mock the first query to get current status
      mockSupabase.single
        .mockResolvedValueOnce({ data: currentPoll, error: null })
        .mockResolvedValueOnce({ data: updatedPoll, error: null })

      // Act
      const result = await pollsApi.togglePollStatus(pollId)

      // Assert
      expect(result).toEqual(updatedPoll)
      expect(mockSupabase.from).toHaveBeenCalledWith('polls')
      expect(mockSupabase.select).toHaveBeenCalledWith('is_active')
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', pollId)
      expect(mockSupabase.update).toHaveBeenCalledWith({ is_active: false })
    })

    it('should throw error when poll not found during status fetch', async () => {
      // Arrange
      const pollId = 'nonexistent'
      const mockError = new Error('Poll not found')

      mockSupabase.single.mockResolvedValue({ data: null, error: mockError })

      // Act & Assert
      await expect(pollsApi.togglePollStatus(pollId)).rejects.toThrow('Poll not found')
    })
  })

  describe('submitVote', () => {
    it('should submit vote successfully', async () => {
      // Arrange
      const voteData: VoteData = {
        poll_id: 'poll1',
        option_index: 0
      }
      const mockVote = {
        id: 'vote1',
        poll_id: 'poll1',
        option_index: 0,
        voter_ip: '192.168.1.1',
        created_at: '2023-01-01T00:00:00Z'
      }

      const mockFetch = fetch as jest.MockedFunction<typeof fetch>
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ vote: mockVote })
      } as Response)

      // Act
      const result = await pollsApi.submitVote(voteData)

      // Assert
      expect(result).toEqual(mockVote)
      expect(fetch).toHaveBeenCalledWith('/api/polls/poll1/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          option_index: 0
        })
      })
    })

    it('should throw error when API request fails', async () => {
      // Arrange
      const voteData: VoteData = {
        poll_id: 'poll1',
        option_index: 0
      }

      const mockFetch = fetch as jest.MockedFunction<typeof fetch>
      mockFetch.mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Vote submission failed' })
      } as Response)

      // Act & Assert
      await expect(pollsApi.submitVote(voteData)).rejects.toThrow('Vote submission failed')
    })

    it('should throw generic error when no error message provided', async () => {
      // Arrange
      const voteData: VoteData = {
        poll_id: 'poll1',
        option_index: 0
      }

      const mockFetch = fetch as jest.MockedFunction<typeof fetch>
      mockFetch.mockResolvedValue({
        ok: false,
        json: async () => ({})
      } as Response)

      // Act & Assert
      await expect(pollsApi.submitVote(voteData)).rejects.toThrow('Failed to submit vote')
    })
  })

  describe('hasUserVoted', () => {
    it('should return true when authenticated user has voted', async () => {
      // Arrange
      const pollId = 'poll1'
      const mockUser = { id: 'user1', email: 'test@example.com' }
      const mockVote = { id: 'vote1' }

      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })
      mockSupabase.single.mockResolvedValue({ data: mockVote, error: null })

      // Act
      const result = await pollsApi.hasUserVoted(pollId)

      // Assert
      expect(result).toBe(true)
      expect(mockSupabase.from).toHaveBeenCalledWith('votes')
      expect(mockSupabase.select).toHaveBeenCalledWith('id')
      expect(mockSupabase.eq).toHaveBeenCalledWith('poll_id', pollId)
      expect(mockSupabase.eq).toHaveBeenCalledWith('voter_id', 'user1')
    })

    it('should return false when authenticated user has not voted', async () => {
      // Arrange
      const pollId = 'poll1'
      const mockUser = { id: 'user1', email: 'test@example.com' }
      const notFoundError = { code: 'PGRST116', message: 'Not found' }

      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })
      mockSupabase.single.mockResolvedValue({ data: null, error: notFoundError })

      // Act
      const result = await pollsApi.hasUserVoted(pollId)

      // Assert
      expect(result).toBe(false)
    })

    it('should return true when anonymous user with IP has voted', async () => {
      // Arrange
      const pollId = 'poll1'
      const voterIp = '192.168.1.1'
      const mockVote = { id: 'vote1' }

      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null })
      mockSupabase.single.mockResolvedValue({ data: mockVote, error: null })

      // Act
      const result = await pollsApi.hasUserVoted(pollId, voterIp)

      // Assert
      expect(result).toBe(true)
      expect(mockSupabase.eq).toHaveBeenCalledWith('voter_ip', voterIp)
    })

    it('should return false when no user and no IP provided', async () => {
      // Arrange
      const pollId = 'poll1'

      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null })

      // Act
      const result = await pollsApi.hasUserVoted(pollId)

      // Assert
      expect(result).toBe(false)
    })

    it('should throw error for database errors other than not found', async () => {
      // Arrange
      const pollId = 'poll1'
      const mockUser = { id: 'user1', email: 'test@example.com' }
      const mockError = { code: 'PGRST500', message: 'Internal server error' }

      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })
      mockSupabase.single.mockResolvedValue({ data: null, error: mockError })

      // Act & Assert
      await expect(pollsApi.hasUserVoted(pollId)).rejects.toEqual(mockError)
    })
  })
})
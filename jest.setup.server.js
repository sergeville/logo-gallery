const { TextEncoder, TextDecoder } = require('util')
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

process.env.MONGODB_URI = 'mongodb://localhost:27017/test'
process.env.MONGODB_DB = 'test'
process.env.NEXTAUTH_URL = 'http://localhost:3000'
process.env.NEXTAUTH_SECRET = 'test-secret'

const mockCollection = {
  findOne: jest.fn().mockResolvedValue({}),
  insertOne: jest.fn().mockResolvedValue({ insertedId: 'test-id' }),
  find: jest.fn().mockReturnValue({
    toArray: jest.fn().mockResolvedValue([]),
    limit: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    project: jest.fn().mockReturnThis(),
    count: jest.fn().mockResolvedValue(0)
  }),
  updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
  deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 }),
  deleteMany: jest.fn().mockResolvedValue({ deletedCount: 1 }),
  countDocuments: jest.fn().mockResolvedValue(0)
}

const mockDb = {
  collection: jest.fn().mockReturnValue(mockCollection),
  collections: jest.fn().mockResolvedValue([mockCollection])
}

const mockClientBase = {
  db: jest.fn().mockReturnValue(mockDb),
  close: jest.fn().mockResolvedValue(undefined)
}

const mockClient = {
  connect: jest.fn().mockResolvedValue(mockClientBase),
  ...mockClientBase
}

jest.mock('mongodb', () => ({
  MongoClient: jest.fn().mockImplementation(() => mockClient),
  ObjectId: jest.fn(id => id)
}))

class MockHeaders {
  constructor(init) {
    this._headers = new Map()
    if (init) {
      Object.entries(init).forEach(([key, value]) => {
        this._headers.set(key.toLowerCase(), value)
      })
    }
  }

  get(key) {
    return this._headers.get(key.toLowerCase()) || null
  }

  has(key) {
    return this._headers.has(key.toLowerCase())
  }
}

class MockRequest {
  constructor(url, { method = 'GET', headers = {}, body } = {}) {
    this.url = url
    this.method = method
    this.headers = new MockHeaders(headers)
    this._body = body

    if (typeof body === 'object') {
      this._bodyText = JSON.stringify(body)
    }
  }

  async json() {
    if (this._body) {
      return typeof this._body === 'string' ? JSON.parse(this._body) : this._body
    }
    return {}
  }
}

class MockResponse {
  constructor(body, init = {}) {
    this.body = body
    this.status = init.status || 200
    this.headers = new MockHeaders(init.headers)
    this.ok = this.status >= 200 && this.status < 300
  }

  async json() {
    return this.body
  }
}

jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, init) => new MockResponse(data, init)),
  },
  NextRequest: MockRequest
}))

jest.mock('next-auth', () => ({
  getServerSession: jest.fn().mockResolvedValue({
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User'
    }
  })
}))

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn().mockResolvedValue(true)
})) 
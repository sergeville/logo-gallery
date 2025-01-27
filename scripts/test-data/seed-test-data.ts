import { TestDbHelper } from '@/scripts/test-data/utils/test-db-helper'
import { validateUser, validateLogo, ClientUser, ClientLogo } from '@/scripts/seed/validation'
import { generateTestUser, generateTestLogo } from '@/scripts/test-data/utils/test-data-generator'

async function seedTestData() {
  const testDb = new TestDbHelper()
  
  try {
    await testDb.connect()
    await testDb.clearAllCollections()

    // Create test user
    const user = generateTestUser({
      id: 'test-user-1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'USER'
    })

    const validationResult = await validateUser(user)
    if (!validationResult.isValid || !validationResult.data) {
      console.error('User validation failed:', validationResult.errors)
      return
    }

    await testDb.insertUser(validationResult.data)

    // Create test logo
    const logo = generateTestLogo({
      id: 'test-logo-1',
      name: 'Test Logo',
      description: 'A test logo',
      imageUrl: 'https://example.com/logo.png',
      thumbnailUrl: 'https://example.com/logo-thumb.png',
      ownerId: user.id,
      ownerName: user.name,
      category: 'tech',
      tags: ['test', 'logo']
    })

    const logoToValidate = {
      ...logo,
      createdAt: logo.createdAt ? new Date(logo.createdAt) : undefined
    }

    const logoValidationResult = await validateLogo(logoToValidate)
    if (!logoValidationResult.isValid || !logoValidationResult.data) {
      console.error('Logo validation failed:', logoValidationResult.errors)
      return
    }

    await testDb.insertLogo(logoValidationResult.data)

    console.log('Test data seeded successfully')
  } catch (error) {
    console.error('Error seeding test data:', error)
  } finally {
    await testDb.disconnect()
  }
}

seedTestData().catch(console.error) 
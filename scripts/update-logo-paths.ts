import { MongoClient } from 'mongodb'
import { config } from 'dotenv'

config({ path: '.env.local' })

const MONGODB_URI = process.env.MONGODB_URI
if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable')
}

async function updateLogoPaths() {
  const client = await MongoClient.connect(MONGODB_URI as string)
  const db = client.db()
  const logos = db.collection('logos')

  try {
    const cursor = logos.find({})
    const updates = []

    for await (const logo of cursor) {
      if (!logo.imageUrl || !logo.thumbnailUrl) {
        // Handle old format
        const newImageUrl = logo.url ? 
          `/uploads/${logo.ownerId || 'unknown'}-${new Date(logo.uploadedAt).getTime()}-${logo.filename}` :
          logo.imageUrl

        const update = {
          updateOne: {
            filter: { _id: logo._id },
            update: {
              $set: {
                imageUrl: newImageUrl,
                thumbnailUrl: newImageUrl?.replace('/uploads/', '/uploads/thumb-')
              }
            }
          }
        }
        updates.push(update)
      }
    }

    if (updates.length > 0) {
      const result = await logos.bulkWrite(updates)
      console.log(`Updated ${result.modifiedCount} logo records`)
    } else {
      console.log('No logos needed updating')
    }

  } catch (error) {
    console.error('Error updating logo paths:', error)
  } finally {
    await client.close()
  }
}

updateLogoPaths().catch(console.error) 
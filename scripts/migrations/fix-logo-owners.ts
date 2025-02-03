import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') })

import { connectToDatabase } from '../../app/lib/db'
import { ObjectId } from 'mongodb'

async function fixLogoOwners() {
  console.log('Starting logo owner migration...')
  
  try {
    const { db } = await connectToDatabase()
    
    // Get admin user
    const adminUser = await db.collection('users').findOne({ role: 'ADMIN' })
    if (!adminUser) {
      console.error('Admin user not found')
      process.exit(1)
    }
    
    // Get all logos
    const logos = await db.collection('logos').find().toArray()
    console.log(`Found ${logos.length} logos`)
    
    let updatedCount = 0
    let skippedCount = 0
    
    for (const logo of logos) {
      // Check if logo has Unknown owner or no owner
      if (!logo.ownerName || logo.ownerName === 'Unknown owner' || logo.ownerName.toLowerCase().includes('unknown')) {
        const updateDoc = {
          $set: {
            ownerId: adminUser._id,
            ownerName: 'admin',
            updatedAt: new Date()
          }
        }
        
        // Remove userId if it exists
        if (logo.userId) {
          await db.collection('logos').updateOne(
            { _id: logo._id },
            { 
              ...updateDoc,
              $unset: { userId: "" }
            }
          )
        } else {
          await db.collection('logos').updateOne(
            { _id: logo._id },
            updateDoc
          )
        }
        
        updatedCount++
        console.log(`Updated logo ${logo._id} from Unknown owner to admin`)
        continue
      }
      
      // Get the owner ID from either ownerId or userId
      const ownerId = logo.ownerId || logo.userId
      let user = null
      
      if (ownerId) {
        // Try to find the original owner
        user = await db.collection('users').findOne({ _id: new ObjectId(ownerId) })
      }
      
      // If no user found or user is admin, ensure consistent admin naming
      if (!user || user.role === 'ADMIN') {
        const updateDoc = {
          $set: {
            ownerId: adminUser._id,
            ownerName: 'admin',
            updatedAt: new Date()
          }
        }
        
        // Remove userId if it exists
        if (logo.userId) {
          await db.collection('logos').updateOne(
            { _id: logo._id },
            { 
              ...updateDoc,
              $unset: { userId: "" }
            }
          )
        } else {
          await db.collection('logos').updateOne(
            { _id: logo._id },
            updateDoc
          )
        }
        
        updatedCount++
        console.log(`Updated logo ${logo._id} to admin ownership`)
        continue
      }
      
      // Skip if both fields are already set correctly and not admin
      if (logo.ownerId && logo.ownerName && logo.ownerName !== 'admin') {
        skippedCount++
        continue
      }
      
      // Update the logo with correct owner information
      const updateDoc = {
        $set: {
          ownerId: user._id,
          ownerName: user.name || user.email || 'admin', // Changed from 'Unknown owner' to 'admin'
          updatedAt: new Date()
        }
      }
      
      // If logo has userId but no ownerId, also migrate the ID field
      if (logo.userId && !logo.ownerId) {
        await db.collection('logos').updateOne(
          { _id: logo._id },
          { 
            ...updateDoc,
            $unset: { userId: "" }
          }
        )
      } else {
        await db.collection('logos').updateOne(
          { _id: logo._id },
          updateDoc
        )
      }
      
      updatedCount++
      console.log(`Updated logo ${logo._id}`)
    }
    
    console.log(`Migration complete. Updated ${updatedCount} logos, skipped ${skippedCount} logos`)
  } catch (error) {
    console.error('Error during migration:', error)
    process.exit(1)
  }
}

// Run the migration
fixLogoOwners().then(() => process.exit(0)) 
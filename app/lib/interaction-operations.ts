import { ObjectId } from 'mongodb';
import { connectToDatabase } from './db-config';

interface Comment {
  _id: string;
  logoId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

interface Vote {
  _id: string;
  logoId: string;
  userId: string;
  createdAt: string;
}

export async function addComment(logoId: string, userId: string, data: { content: string }) {
  const db = await connectToDatabase();
  const comment = {
    logoId,
    userId,
    content: data.content,
    createdAt: new Date().toISOString(),
  };
  
  await db.collection('comments').insertOne(comment);
  return { status: 200, comment };
}

export async function updateComment(commentId: string, userId: string, data: { content: string }) {
  const db = await connectToDatabase();
  
  const comment = await db.collection('comments').findOne({ _id: new ObjectId(commentId) });
  if (!comment) {
    return { status: 404, error: 'Comment not found' };
  }
  
  if (comment.userId !== userId) {
    return { status: 403, error: 'Unauthorized to modify this comment' };
  }
  
  const updatedComment = {
    ...comment,
    content: data.content,
    updatedAt: new Date().toISOString(),
  };
  
  await db.collection('comments').updateOne(
    { _id: new ObjectId(commentId) },
    { $set: updatedComment }
  );
  
  return { status: 200, comment: updatedComment };
}

export async function deleteComment(commentId: string, userId: string) {
  const db = await connectToDatabase();
  
  const comment = await db.collection('comments').findOne({ _id: new ObjectId(commentId) });
  if (!comment) {
    return { status: 404, error: 'Comment not found' };
  }
  
  if (comment.userId !== userId) {
    return { status: 403, error: 'Unauthorized to delete this comment' };
  }
  
  await db.collection('comments').deleteOne({ _id: new ObjectId(commentId) });
  return { status: 200, success: true };
}

export async function getComments(logoId: string) {
  const db = await connectToDatabase();
  const comments = await db.collection('comments')
    .find({ logoId })
    .sort({ createdAt: -1 })
    .toArray();
  
  return { status: 200, comments };
}

export async function addVote(logoId: string, userId: string) {
  const db = await connectToDatabase();
  
  const existingVote = await db.collection('votes').findOne({ logoId, userId });
  if (existingVote) {
    return { status: 400, error: 'User has already voted for this logo' };
  }
  
  const vote = {
    logoId,
    userId,
    createdAt: new Date().toISOString(),
  };
  
  await db.collection('votes').insertOne(vote);
  return { status: 200, vote };
}

export async function removeVote(logoId: string, userId: string) {
  const db = await connectToDatabase();
  await db.collection('votes').deleteOne({ logoId, userId });
  return { status: 200, success: true };
}

export async function getVotes(logoId: string) {
  const db = await connectToDatabase();
  const votes = await db.collection('votes').find({ logoId }).toArray();
  
  return { 
    status: 200, 
    votes,
    total: votes.length
  };
} 
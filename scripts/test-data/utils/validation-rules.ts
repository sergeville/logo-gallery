import { ValidationRule } from '@/scripts/test-data/utils/validation-utils';

export const userValidationRules: Record<string, ValidationRule[]> = {
  _id: [{
    field: '_id',
    type: 'objectId',
    message: 'Invalid user ID'
  }],
  email: [{
    field: 'email',
    type: 'required',
    message: 'Email is required'
  }, {
    field: 'email',
    type: 'email',
    message: 'Invalid email format'
  }],
  name: [{
    field: 'name',
    type: 'required',
    message: 'Name is required'
  }],
  password: [{
    field: 'password',
    type: 'required',
    message: 'Password is required'
  }],
  createdAt: [{
    field: 'createdAt',
    type: 'required',
    message: 'Created date is required'
  }],
  updatedAt: [{
    field: 'updatedAt',
    type: 'required',
    message: 'Updated date is required'
  }]
};

export const logoValidationRules: Record<string, ValidationRule[]> = {
  _id: [{
    field: '_id',
    type: 'objectId',
    message: 'Invalid logo ID'
  }],
  userId: [{
    field: 'userId',
    type: 'objectId',
    message: 'Invalid user ID'
  }],
  name: [{
    field: 'name',
    type: 'required',
    message: 'Name is required'
  }],
  description: [{
    field: 'description',
    type: 'required',
    message: 'Description is required'
  }],
  url: [{
    field: 'url',
    type: 'required',
    message: 'URL is required'
  }, {
    field: 'url',
    type: 'url',
    message: 'Invalid URL format'
  }],
  imageUrl: [{
    field: 'imageUrl',
    type: 'required',
    message: 'Image URL is required'
  }, {
    field: 'imageUrl',
    type: 'url',
    message: 'Invalid image URL format'
  }],
  thumbnailUrl: [{
    field: 'thumbnailUrl',
    type: 'required',
    message: 'Thumbnail URL is required'
  }, {
    field: 'thumbnailUrl',
    type: 'url',
    message: 'Invalid thumbnail URL format'
  }],
  tags: [{
    field: 'tags',
    type: 'array',
    message: 'Tags must be an array',
    minLength: 1
  }],
  createdAt: [{
    field: 'createdAt',
    type: 'required',
    message: 'Created date is required'
  }],
  updatedAt: [{
    field: 'updatedAt',
    type: 'required',
    message: 'Updated date is required'
  }]
}; 
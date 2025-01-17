# Upload Form Design Specifications

## Layout Structure
```jsx
<div className="min-h-screen bg-white">
  <Navbar />
  <main className="container mx-auto px-4 py-8">
    <h1 className="text-2xl font-semibold mb-8">Upload Your Logo</h1>
    <form className="max-w-2xl mx-auto space-y-6">
      {/* Form fields */}
    </form>
  </main>
</div>
```

## Form Fields

### Logo Name Input
```jsx
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Logo Name
  </label>
  <input
    type="text"
    className="w-full px-3 py-2 border border-gray-300 rounded-md"
    required
  />
</div>
```

### Description Textarea
```jsx
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Description
  </label>
  <textarea
    className="w-full px-3 py-2 border border-gray-300 rounded-md min-h-[100px]"
  />
</div>
```

### Tags Input
```jsx
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Tags (comma separated)
  </label>
  <input
    type="text"
    className="w-full px-3 py-2 border border-gray-300 rounded-md"
  />
</div>
```

### File Upload Dropzone
```jsx
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Logo File
  </label>
  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
    <div className="space-y-2">
      <div className="flex justify-center">
        {/* Upload icon */}
      </div>
      <p>Upload a file or drag and drop</p>
      <p className="text-sm text-gray-500">PNG, JPG, SVG up to 5MB</p>
    </div>
  </div>
</div>
```

### Submit Button
```jsx
<button
  type="submit"
  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
>
  Upload Logo
</button>
```

## States & Interactions

### Drag & Drop States
```css
/* Default state */
.dropzone {
  @apply border-2 border-dashed border-gray-300;
}

/* Hover/Drag state */
.dropzone-active {
  @apply border-blue-500 bg-blue-50;
}

/* Error state */
.dropzone-error {
  @apply border-red-500 bg-red-50;
}
```

### Loading State
```jsx
<button disabled className="opacity-50 cursor-not-allowed">
  <span className="inline-block animate-spin mr-2">⟳</span>
  Uploading...
</button>
```

### Success/Error Messages
```jsx
{/* Success */}
<div className="bg-green-50 text-green-800 p-4 rounded-md">
  Logo uploaded successfully!
</div>

{/* Error */}
<div className="bg-red-50 text-red-800 p-4 rounded-md">
  Error: {errorMessage}
</div>
```

## Responsive Design
- Container max-width: `max-w-2xl`
- Horizontal padding: `px-4`
- Vertical spacing between fields: `space-y-6`
- Mobile-first approach with consistent spacing
- Form maintains readability on all screen sizes

## Accessibility
- All form fields have associated labels
- Required fields are marked with `required` attribute
- Error messages are announced to screen readers
- Focus states are clearly visible
- Drag and drop has keyboard fallback 
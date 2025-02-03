# Test Fixtures

This directory contains test files used in E2E tests.

## Files

- `test-logo.png` - A valid logo file (500x500px, <1MB)
- `too-large.png` - An oversized logo file (>5MB)
- `invalid.txt` - An invalid file type for testing error handling

## Usage

These files are used in the E2E tests to verify:
- Logo upload functionality
- File type validation
- File size limits
- Error handling

## Generating Test Files

To regenerate test files:

```bash
# Generate valid test logo
convert -size 500x500 xc:white -draw "text 250,250 'Test Logo'" test-logo.png

# Generate oversized file
convert -size 3000x3000 xc:white -draw "text 1500,1500 'Large Logo'" too-large.png

# Generate invalid file
echo "This is not an image file" > invalid.txt
``` 
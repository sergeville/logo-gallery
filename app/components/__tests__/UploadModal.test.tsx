import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import UploadModal from '../UploadModal'
import { createMockFile } from '@/app/utils/test-utils'

// Mock fetch
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('UploadModal', () => {
  const mockOnClose = jest.fn()
  const mockOnUploadSuccess = jest.fn()
  const user = userEvent.setup()

  beforeEach(() => {
    jest.clearAllMocks()
    mockFetch.mockReset()
    // Reset URL.createObjectURL
    URL.createObjectURL = jest.fn(() => 'mock-url')
    URL.revokeObjectURL = jest.fn()
  })

  const renderModal = (props = {}) => {
    return render(
      <UploadModal
        isOpen={true}
        onClose={mockOnClose}
        onUploadSuccess={mockOnUploadSuccess}
        {...props}
      />
    )
  }

  describe('Rendering', () => {
    it('renders nothing when not open', () => {
      render(
        <UploadModal
          isOpen={false}
          onClose={mockOnClose}
          onUploadSuccess={mockOnUploadSuccess}
        />
      )
      expect(screen.queryByText('Upload Logo')).not.toBeInTheDocument()
    })

    it('renders modal content when open', () => {
      renderModal()
      expect(screen.getByText('Upload Logo')).toBeInTheDocument()
      expect(screen.getByLabelText('Logo Name')).toBeInTheDocument()
      expect(screen.getByText('Upload a file')).toBeInTheDocument()
    })

    it('closes when clicking close button', async () => {
      renderModal()
      await user.click(screen.getByRole('button', { name: /close/i }))
      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  describe('File Upload', () => {
    it('handles valid image file selection', async () => {
      renderModal()
      const file = createMockFile('test.png', 'image/png', 1024)
      const input = screen.getByLabelText(/upload a file/i)

      await user.upload(input, file)

      expect(screen.getByAltText('Preview')).toBeInTheDocument()
      expect(screen.queryByText('Please select an image file')).not.toBeInTheDocument()
    })

    it('shows error for non-image files', async () => {
      renderModal()
      const file = createMockFile('test.pdf', 'application/pdf', 1024)
      const input = screen.getByLabelText(/upload a file/i)

      await user.upload(input, file)

      expect(screen.getByText('Please select an image file')).toBeInTheDocument()
      expect(screen.queryByAltText('Preview')).not.toBeInTheDocument()
    })
  })

  describe('Form Submission', () => {
    it('requires both name and file', async () => {
      renderModal()
      await user.click(screen.getByRole('button', { name: /upload logo/i }))
      expect(screen.getByText('Please fill in all fields')).toBeInTheDocument()
    })

    it('handles successful upload', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true })
      })

      renderModal()
      
      // Fill form
      await user.type(screen.getByLabelText('Logo Name'), 'Test Logo')
      const file = createMockFile('test.png', 'image/png', 1024)
      await user.upload(screen.getByLabelText(/upload a file/i), file)

      // Submit form
      await user.click(screen.getByRole('button', { name: /upload logo/i }))

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/logos/upload', expect.any(Object))
        expect(mockOnUploadSuccess).toHaveBeenCalled()
        expect(mockOnClose).toHaveBeenCalled()
      })
    })

    it('handles upload failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: 'Upload failed' })
      })

      renderModal()
      
      // Fill form
      await user.type(screen.getByLabelText('Logo Name'), 'Test Logo')
      const file = createMockFile('test.png', 'image/png', 1024)
      await user.upload(screen.getByLabelText(/upload a file/i), file)

      // Submit form
      await user.click(screen.getByRole('button', { name: /upload logo/i }))

      await waitFor(() => {
        expect(screen.getByText('Upload failed')).toBeInTheDocument()
        expect(mockOnUploadSuccess).not.toHaveBeenCalled()
        expect(mockOnClose).not.toHaveBeenCalled()
      })
    })

    it('shows loading state during upload', async () => {
      mockFetch.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)))

      renderModal()
      
      // Fill form
      await user.type(screen.getByLabelText('Logo Name'), 'Test Logo')
      const file = createMockFile('test.png', 'image/png', 1024)
      await user.upload(screen.getByLabelText(/upload a file/i), file)

      // Submit form
      await user.click(screen.getByRole('button', { name: /upload logo/i }))

      expect(screen.getByText('Uploading...')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /uploading/i })).toBeDisabled()
    })
  })
}) 
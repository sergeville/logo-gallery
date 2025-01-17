# Sign-in Page Design Documentation

## Layout & Structure

### Modal Container
- Fixed positioning with z-index: 50
- Backdrop color: #0f1524 with 50% opacity
- Backdrop blur effect: backdrop-blur-md
- Click outside to close
- Body scroll lock when open
- Preserves background page visibility

### Form Container
- Max-width: 400px
- Centered horizontally with `mx-auto`
- Horizontal padding: px-8
- Background color: #1a1f36 with 50% opacity
- Border radius: rounded-lg
- Shadow: shadow-xl

### Header
- Text: "Sign in to your account"
- Font size: 2xl
- Font weight: medium
- Color: white
- Margin bottom: mb-8
- Text alignment: center

### Input Fields
- Type: email/password
- Full width
- Padding: px-4 py-3
- Background color: rgba(26, 31, 54, 0.8)
- Text color: white
- Placeholder color: gray-400
- Border radius: rounded-md
- Focus state: 
  - No outline
  - Ring width: 2
  - Ring color: blue-500

### Buttons
Common styles for all buttons:
- Full width
- Padding: px-4 py-3
- Background color: rgba(26, 31, 54, 0.8)
- Hover background: rgba(42, 47, 69, 0.8)
- Border radius: rounded-md
- Text color: white
- Font size: 15px
- Font weight: medium
- Transition: colors

### Sign-up Link
- Margin top: mt-6
- Text size: sm
- "Don't have an account?" color: gray-400
- "Sign up" link color: blue-500
- Hover color: blue-400
- Font weight for link: medium

## Functionality
- Supports both modal and full-page display modes
- Email/password authentication
- Proper form validation and error states
- Callback URL support for redirects
- Responsive design for all screen sizes
- Background page remains visible but blurred
- Closes on successful authentication
- Closes on outside click
- Maintains scroll position of background page 
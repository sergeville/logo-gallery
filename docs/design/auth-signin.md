# Sign-in Page Design Documentation

## Sign In Page Design

### Modal Container
- Position: Fixed, centered on screen
- Background: Semi-transparent gray backdrop (`bg-gray-500/50`)
- Backdrop blur effect (`backdrop-blur-md`)
- Full screen coverage (`inset-0`)
- Flex container for centering content

### Sign In Form
- Background: Dark slate (`bg-slate-700`)
- Width: Max width of 400px
- Padding: `p-6`
- Border radius: `rounded-lg`
- Box shadow: `shadow-xl`

### Typography
- Title: "Sign in to your account"
  - Font size: `text-2xl`
  - Font weight: `font-semibold`
  - Color: `text-white`
  - Margin bottom: `mb-6`
  - Text align: Center

### Form Fields
1. Email Input
   - Label: "Email address"
   - Background: Dark (`bg-gray-700`)
   - Text color: White
   - Padding: `px-3 py-2`
   - Border radius: `rounded-md`
   - Full width
   - Placeholder styling: `placeholder:text-gray-400`

2. Password Input
   - Label: "Password"
   - Background: Dark (`bg-gray-700`)
   - Text color: White
   - Padding: `px-3 py-2`
   - Border radius: `rounded-md`
   - Full width
   - Margin top: `mt-4`

### Sign In Button
- Background: Blue (`bg-blue-600`)
- Hover: Darker blue (`hover:bg-blue-700`)
- Text color: White
- Font weight: Medium
- Full width
- Padding: `py-2`
- Border radius: `rounded-md`
- Margin top: `mt-6`

### Additional Elements
- Sign up link
  - Text: "Don't have an account? Sign up"
  - Color: Blue (`text-blue-500`)
  - Hover: Brighter blue (`hover:text-blue-400`)
  - Margin top: `mt-4`
  - Text align: Center

### States
1. Default State
   - Clean form with empty fields
   - Visible labels
   - Primary button enabled

2. Focus State
   - Input highlight on focus
   - Clear focus rings for accessibility

3. Error State
   - Red border on invalid fields
   - Error message below field
   - Form-level error messages

4. Loading State
   - Button loading spinner
   - Disabled form inputs

### Accessibility
- Proper ARIA labels
- Keyboard navigation support
- Error announcements
- Focus management
- Color contrast compliance

### Responsive Behavior
- Maintains modal width on larger screens
- Full width on mobile with proper padding
- Adjusts padding and spacing for smaller screens
- Maintains readable text sizes 
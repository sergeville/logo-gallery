# Logo Gallery Design System

## Theme Configuration

### Colors
```css
/* Light Mode */
- Background (main): rgb(249, 250, 251)
- Background (content): white
- Text (primary): rgb(17, 24, 39)
- Text (secondary): rgb(55, 65, 81)
- Border: rgb(229, 231, 235)

/* Dark Mode */
- Background (main): rgb(10, 26, 47)
- Background (content): rgb(31, 41, 55)
- Text (primary): white
- Text (secondary): rgb(209, 213, 219)
- Border: rgb(55, 65, 81)
```

### Typography
```css
/* Font Family */
- Primary: Inter (Latin subset)

/* Text Sizes */
- Site Title: text-xl font-bold
- Headings: text-2xl font-semibold
- Body: text-base
- Navigation: text-base
```

## Layout Components

### Root Layout
- Full-height container with flex column
- Consistent background colors in light/dark modes
- Proper provider nesting (Theme -> Session -> Auth)
- Container width constraints with padding

### Navbar
- Fixed position at top
- Light/dark mode aware background
- Flexible spacing between elements
- Left: Site branding
- Right: Navigation links, auth buttons, theme toggle
- Consistent hover states

### Content Sections
```css
.page-container {
  @apply min-h-screen bg-gray-50 dark:bg-[#0A1A2F];
}

.content-section {
  @apply bg-white dark:bg-gray-800 rounded-lg shadow-sm;
}
```

## UI Components

### Buttons
```css
/* Primary Button */
.btn-primary {
  @apply bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors;
}

/* Secondary Button */
.btn-secondary {
  @apply bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-white 
         px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 
         transition-colors;
}
```

### Navigation Links
```css
.nav-link {
  @apply text-gray-700 dark:text-gray-300 
         hover:text-gray-900 dark:hover:text-white 
         transition-colors;
}
```

### Theme Toggle
- Positioned in navbar
- SVG icons for sun/moon
- Smooth color transitions
- Accessible button with aria-labels
- Hover effects matching theme

## Page Templates

### Homepage
- Centered content layout
- Hero section with clear CTA
- Responsive grid for featured content
- Consistent section spacing

### Gallery
- Grid layout for logo cards
- Responsive columns
- Consistent card sizes
- Proper spacing between items

### Upload Form
- Single column layout
- Clear input grouping
- Validation feedback
- Preview functionality

## Responsive Design

### Breakpoints
```css
- sm: 640px  /* Mobile landscape */
- md: 768px  /* Tablets */
- lg: 1024px /* Desktop */
- xl: 1280px /* Large desktop */
```

### Container Widths
```css
.container {
  @apply mx-auto px-4;
  max-width: 1280px;
}
```

## Animation Guidelines

### Transitions
- Duration: 150ms
- Timing: ease-in-out
- Used for: hover states, theme changes, modal open/close

### Loading States
- Skeleton loaders for content
- Spinner for actions
- Smooth opacity transitions

## Accessibility

### Color Contrast
- Minimum 4.5:1 for normal text
- Minimum 3:1 for large text
- Tested in both light and dark modes

### Interactive Elements
- Clear focus states
- Proper aria-labels
- Keyboard navigation support

## Best Practices

1. **Consistency**
   - Use utility classes defined in globals.css
   - Follow established color patterns
   - Maintain spacing rhythm

2. **Dark Mode**
   - Test all components in both modes
   - Use CSS variables for theme colors
   - Ensure proper contrast

3. **Performance**
   - Lazy load images
   - Optimize SVG icons
   - Minimize layout shifts

4. **Maintenance**
   - Document new patterns
   - Update this guide when adding new components
   - Keep CSS organized in layers

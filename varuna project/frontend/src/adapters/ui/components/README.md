# UI Components

This directory contains reusable UI components built with React, TypeScript, and TailwindCSS. All components follow accessibility best practices and are fully responsive.

## Components

### Alert
Displays inline alert messages with different types (success, error, warning, info).

```tsx
<Alert 
  type="success" 
  message="Operation completed successfully" 
  onClose={() => setMessage(null)} 
/>
```

### Toast
Displays temporary notification messages that auto-dismiss.

```tsx
<Toast 
  type="error" 
  message="Failed to save data" 
  onClose={() => hideToast(id)} 
  duration={5000}
  autoClose={true}
/>
```

### ToastContainer
Container for managing multiple toast notifications.

```tsx
const { toasts, hideToast } = useToast();
<ToastContainer toasts={toasts} onClose={hideToast} />
```

### LoadingSpinner
Displays a loading spinner with optional message.

```tsx
<LoadingSpinner size="md" message="Loading data..." />
<LoadingSpinner size="lg" fullScreen />
```

### Button
Accessible button component with multiple variants and loading state.

```tsx
<Button 
  variant="primary" 
  size="md" 
  loading={isLoading}
  onClick={handleClick}
>
  Submit
</Button>
```

Variants: `primary`, `secondary`, `success`, `danger`, `outline`
Sizes: `sm`, `md`, `lg`

### Card
Container component with consistent styling.

```tsx
<Card padding="md" shadow>
  <h3>Card Title</h3>
  <p>Card content</p>
</Card>
```

### Input
Accessible input field with label, error, and helper text support.

```tsx
<Input
  label="Email Address"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={emailError}
  helperText="We'll never share your email"
  required
  fullWidth
/>
```

### Select
Accessible select dropdown with label and error support.

```tsx
<Select
  label="Country"
  value={country}
  onChange={(e) => setCountry(e.target.value)}
  fullWidth
>
  <option value="">Select a country</option>
  <option value="us">United States</option>
  <option value="uk">United Kingdom</option>
</Select>
```

## Hooks

### useToast
Hook for managing toast notifications.

```tsx
const { toasts, hideToast, success, error, warning, info } = useToast();

// Show notifications
success('Data saved successfully');
error('Failed to load data');
warning('Please review your input');
info('New feature available');
```

## Accessibility Features

- All interactive elements have proper ARIA labels
- Keyboard navigation support
- Focus visible indicators
- Screen reader friendly
- Semantic HTML structure
- Color contrast compliance (WCAG AA)

## Responsive Design

All components are fully responsive and work on:
- Mobile devices (< 768px)
- Tablets (768px - 1024px)
- Desktop (> 1024px)

## Styling

Components use TailwindCSS utility classes with custom animations defined in `index.css`:
- `animate-slide-in`: Slide in from right
- `animate-fade-in`: Fade in effect
- `animate-pulse-slow`: Slow pulsing animation

## Best Practices

1. Always provide meaningful labels for form inputs
2. Use appropriate button variants for different actions
3. Show loading states during async operations
4. Display error messages clearly
5. Use toast notifications for temporary feedback
6. Ensure proper color contrast for text
7. Test with keyboard navigation
8. Test with screen readers

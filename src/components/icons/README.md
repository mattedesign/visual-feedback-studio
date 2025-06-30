
# Custom SVG Icons

This directory contains custom SVG icons converted to React components.

## Usage

Import any icon and use it like a regular React component:

```tsx
import { MyCustomIcon } from './MyCustomIcon';

// Basic usage
<MyCustomIcon />

// With props
<MyCustomIcon size={24} className="text-blue-500" color="red" />
```

## Available Props

All icon components accept these props:

- `size?: number | string` - Size of the icon (default: 24)
- `className?: string` - CSS classes to apply
- `color?: string` - Color of the icon (default: 'currentColor')

## Adding New Icons

1. Use the SVG to Component Converter in the upload section
2. Save the generated component in this directory
3. Export it from the index.ts file for easy importing

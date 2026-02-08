---
description: UI component guidelines for building features in Piely. Apply when creating or modifying UI components.
globs: **/*.{tsx,jsx}
---

# UI Component Guidelines

## shadcn Components (Use These First)

When building UI, prefer these components from `src/components/ui/`:

| Component | Import | Use For |
|-----------|--------|---------|
| Button | `@/components/ui/button` | All buttons, CTAs |
| Dialog | `@/components/ui/dialog` | Modals, confirmations |
| DropdownMenu | `@/components/ui/dropdown-menu` | Context menus, action menus |
| Tooltip | `@/components/ui/tooltip` | Hover hints |
| ThemeToggle | `@/components/ui/ThemeToggle` | Light/dark mode switch |

## Custom Components (Already Built)

| Component | Import | Use For |
|-----------|--------|---------|
| AppHeader | `@/components/layout/AppHeader` | Page headers with nav |
| UserMenu | `@/components/layout/UserMenu` | User profile dropdown |
| RotatingStatus | `@/components/ui/RotatingStatus` | Loading states |
| QuickStartInput | `@/components/dashboard/QuickStartInput` | Hero input field |

## Design System

### Colors

- **Background (dark):** `#191919` (OLED black)
- **Cards (dark):** `#242424`
- **Muted (dark):** `#2F3437` (Notion gray)
- **Foreground:** `#FAFAFA`

### Accents (Cyclic)

- **Orange:** `#f97316` (primary brand)
- **Blue:** `#3b82f6`
- **Green:** `#22c55e`

### Typography

- **Headings:** `font-heading` (Poppins)
- **Body:** `font-body` (Lora)

### Utilities

- Use `cn()` from `@/lib/utils` for conditional classes
- Use `bg-background`, `text-foreground` for theme-aware colors
- Use `dark:` prefix for dark-mode-specific styles

## Adding New shadcn Components

```bash
npx shadcn@latest add [component-name]
```

Components are added to `src/components/ui/` and can be customized.

# Internationalization (i18n) Guide

This guide explains how to implement and use internationalization (i18n) in the IIM-LMS application.

## Overview

The application uses the `i18next` and `react-i18next` libraries for internationalization. The setup allows for easy translation of text content across the application.

## Supported Languages

Currently, the application supports the following languages:

- English (en)
- Hindi (hi)
- Gujarati (gu)

## Translation Files

Translation files are located in the `src/locales` directory:

- `en.json` - English translations
- `hi.json` - Hindi translations
- `gu.json` - Gujarati translations

Each file contains a structured JSON object with translation keys and their corresponding translations.

## How to Use Translations in Components

### 1. Import the useTranslation hook

```jsx
import { useTranslation } from 'react-i18next';
```

### 2. Initialize the hook in your component

```jsx
const { t } = useTranslation();
```

### 3. Use the t function to translate text

```jsx
// Instead of:
<h1>Dashboard</h1>

// Use:
<h1>{t('dashboard.adminDashboard')}</h1>
```

### 4. For dynamic content or concatenation

```jsx
// Instead of:
<input placeholder="Search..." />

// Use:
<input placeholder={t('common.search') + "..."} />
```

### 5. For conditional text

```jsx
// Instead of:
{userRole === "admin" ? "Admin" : "User"}

// Use:
{userRole === "admin" ? t('dashboard.superAdmin') : t('dashboard.user')}
```

## Translation Key Structure

Translation keys follow a hierarchical structure to organize translations by feature or component:

- `common` - Common UI elements and text used across the application
- `auth` - Authentication-related text
- `dashboard` - Dashboard-related text
- `schools` - School management-related text
- `educators` - Educator management-related text
- `courses` - Course management-related text
- `staff` - Staff management-related text
- `blog` - Blog-related text
- `language` - Language-related text

## Adding New Translations

To add a new translation:

1. Add the translation key and text to all language files (`en.json`, `hi.json`, `gu.json`)
2. Use the translation key in your component with the `t` function

Example:

```json
// en.json
{
  "myFeature": {
    "newKey": "New Text"
  }
}

// hi.json
{
  "myFeature": {
    "newKey": "नया टेक्स्ट"
  }
}

// gu.json
{
  "myFeature": {
    "newKey": "નવો ટેક્સ્ટ"
  }
}
```

Then in your component:

```jsx
<p>{t('myFeature.newKey')}</p>
```

## Language Selector

The application includes a language selector component that allows users to switch between supported languages. The selected language is stored in localStorage and persists across page reloads.

## Helper Utilities

The application includes helper utilities to assist with implementing translations:

- `i18nHelper.js` - Contains functions to add translation hooks to components
- `updateTranslations.js` - Contains common translation keys and guidance for implementing translations

## Best Practices

1. **Use translation keys for all user-facing text** - Even if you only support one language initially, using translation keys makes it easier to add support for additional languages later.

2. **Follow the established key structure** - Keep translations organized by feature or component.

3. **Use variables for dynamic content** - For text that includes dynamic content, use variables in your translations.

   ```jsx
   // Translation key: "welcome": "Welcome, {{name}}!"
   <p>{t('common.welcome', { name: userName })}</p>
   ```

4. **Use pluralization when needed** - For text that changes based on count, use pluralization.

   ```jsx
   // Translation keys:
   // "items_zero": "No items"
   // "items_one": "One item"
   // "items_other": "{{count}} items"
   <p>{t('common.items', { count: itemCount })}</p>
   ```

5. **Test translations** - Always test your translations by switching between languages to ensure all text is properly translated.

## Troubleshooting

- **Missing translations** - If a translation key is missing, the key itself will be displayed. Check that the key exists in all language files.
- **Incorrect translations** - If a translation is incorrect, check the corresponding language file for the correct translation.
- **Translation not updating** - If a translation doesn't update when switching languages, make sure you're using the `t` function correctly and that the component is re-rendering when the language changes.

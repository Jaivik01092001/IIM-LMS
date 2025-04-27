# University to User Migration

This directory contains scripts to migrate data from the University model to the User model with role='university'.

## Migration Process

The migration process involves the following steps:

1. Update the User model to include fields from the University model
2. Run the migration script to move data from University to User
3. Update controllers to work with the User model instead of University
4. Run the cleanup script to remove the University collection

## Migration Scripts

### 1. migrateUniversities.js

This script migrates data from the University model to the User model:

```bash
node Backend/scripts/migrateUniversities.js
```

The script:
- Finds all universities in the University collection
- For each university, checks if a corresponding User with role='university' exists
- If not, creates a new User with the university data
- Updates all educators to reference the User instead of the University
- Logs the migration results

### 2. cleanupUniversities.js

This script removes the University collection after migration:

```bash
node Backend/scripts/cleanupUniversities.js
```

The script:
- Verifies that all universities have been migrated to the User model
- Removes the University collection if safe to do so
- Logs the cleanup results

**IMPORTANT**: Run this script ONLY after successfully running migrateUniversities.js

## Migration Checklist

- [x] Update User model to include University fields
- [x] Create migration script
- [x] Update admin controller
- [x] Update university controller
- [x] Create cleanup script
- [x] Update import statements
- [ ] Run migration script
- [ ] Test functionality
- [ ] Run cleanup script

## Rollback Plan

If the migration fails, you can:

1. Restore the database from backup
2. Revert the code changes
3. Restart the application

## Testing

After migration, test the following functionality:

1. Listing universities
2. Creating a new university
3. Updating a university
4. Deleting a university
5. Listing educators for a university
6. Creating a new educator for a university
7. Updating an educator
8. Deleting an educator

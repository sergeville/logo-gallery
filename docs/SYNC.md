# Logo Gallery Synchronization Guide

This guide explains how to synchronize the database and file system for the Logo Gallery application.

## Available Scripts

The following npm scripts are available for synchronization:

```bash
npm run check-logo-sync        # Check sync status between DB and files
npm run sync-to-local          # Sync database to match local files
npm run cleanup-orphaned-files # Remove files without DB entries
npm run remove-broken-logos    # Remove DB entries without files
npm run download-logos         # Download/copy logos to uploads directory
npm run transform-logos        # Transform logos to PNG format
```

## Common Synchronization Issues

1. **Orphaned Files**: Files in the `/public/uploads` directory without corresponding database entries
2. **Broken Database Entries**: Database entries pointing to non-existent files
3. **Mismatched File Formats**: Files with incorrect extensions or formats
4. **Missing Files**: Files referenced in the database but missing from the filesystem

## Step-by-Step Synchronization Process

### 1. Check Current Status

First, check the current synchronization status:

```bash
npm run check-logo-sync
```

This will show:
- Total files in uploads directory
- Total logos in database
- Orphaned database entries
- Unmapped files
- Valid pairs
- Overall sync status

### 2. Clean Up Database (if needed)

If there are broken database entries (entries without files):

```bash
npm run remove-broken-logos
```

This will:
- Remove database entries that point to non-existent files
- Log all removed entries
- Verify the cleanup was successful

### 3. Clean Up Files (if needed)

If there are orphaned files (files without database entries):

```bash
npm run cleanup-orphaned-files
```

This will:
- Remove files that don't have corresponding database entries
- Log all deleted files
- Maintain the `.gitkeep` file

### 4. Synchronize to Local Files

To make the database match the local files:

```bash
npm run sync-to-local
```

This will:
- Create database entries for files without entries
- Remove database entries for missing files
- Update file paths and metadata
- Verify the synchronization

### 5. Transform File Formats (if needed)

To ensure consistent file formats:

```bash
npm run transform-logos
```

This will:
- Convert non-PNG images to PNG format
- Update database entries with new file paths
- Maintain image quality
- Clean up original files after conversion

### 6. Download/Copy Logos (if needed)

If logos need to be copied to the uploads directory:

```bash
npm run download-logos
```

This will:
- Copy logo files to the `/public/uploads` directory
- Create the directory if it doesn't exist
- Maintain file organization

## Best Practices

1. **Regular Checks**: Run `check-logo-sync` regularly to catch issues early
2. **Backup First**: Always backup data before running cleanup scripts
3. **Order Matters**: Follow the synchronization steps in order
4. **Verify Changes**: Check sync status after each major operation
5. **Monitor Logs**: Keep track of all changes in case rollback is needed

## Troubleshooting

### Missing Files
If files are missing but database entries exist:
1. Run `check-logo-sync` to identify missing files
2. Use `remove-broken-logos` to clean up database entries
3. Re-upload affected logos

### Orphaned Files
If you have files without database entries:
1. Run `check-logo-sync` to identify orphaned files
2. Use `sync-to-local` to create database entries
3. Or use `cleanup-orphaned-files` to remove unused files

### Format Issues
If files are in incorrect formats:
1. Run `transform-logos` to convert to PNG
2. Verify database entries are updated
3. Check file permissions if transforms fail

## Directory Structure

```
logo-gallery/
├── public/
│   └── uploads/          # Logo files directory
├── scripts/
│   ├── check-logo-sync.ts
│   ├── cleanup-orphaned-files.ts
│   ├── remove-broken-logos.ts
│   ├── sync-to-local.ts
│   ├── download-logos.ts
│   └── transform-logos.ts
```

## Environment Setup

Ensure your `.env.local` file has the correct MongoDB URI:

```env
MONGODB_URI=mongodb://localhost:27017/LogoGalleryDevelopmentDB
```

The database name will automatically be set based on the environment:
- Development: `LogoGalleryDevelopmentDB`
- Test: `LogoGalleryTestDB`
- Production: `LogoGalleryDB` 
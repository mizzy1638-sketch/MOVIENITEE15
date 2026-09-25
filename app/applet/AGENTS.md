# Persistent Project Rules & Directives

1. **Strict File Preservation**:
   - Never delete, replace, or wipe existing files in the workspace.
   - Never perform batch deletion, cleanup, or mass file removals.
   - Never delete or remove `index.html`, `firebase-applet-config.json`, `firestore.rules`, `assets/`, `dist/`, or any existing components/utilities.
   - The backup at `/app/production_backup_checkpoint` and `/app/applet/.backup_checkpoint` must be preserved as the golden rollback reference.

2. **Surgical Modifications Only**:
   - Modify ONLY the specific files strictly required for a given user request.
   - Do not touch, replace, or rewrite unrelated files.

3. **Entry Point & Production Guard**:
   - Before and after applying any change, always verify that `index.html`, `/app/applet/assets/`, `dist/`, and Firebase configurations exist and respond with HTTP 200.
   - Preserve the live working production deployment.

4. **Brand & Domain Integrity**:
   - Retain the application branding ("MOVIENiTEE") and current domain configuration.
   - Do not alter the authorized domain or branding assets.

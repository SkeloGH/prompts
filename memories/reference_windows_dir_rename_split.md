---
name: windows-dir-rename-open-handles
description: Renaming a dir with open handles on Windows can split a git repo (mv/Move-Item copy+delete fallback)
metadata: 
  node_type: memory
  type: reference
---

On Windows, `mv` (git-bash) and PowerShell `Move-Item` do an atomic rename when possible, but **fall back to recursive copy-then-delete** if the source has an open handle or a permission/cwd lock. On a git repo that can **split it**: some entries (including `.git` and root files) get copied to the destination while others (subdirs, the locked file) fail and stay in the source — leaving two *incomplete* directories.

**Recovery (no data lost):** whichever dir ended up with the working `.git` is canonical — run `git restore .` there to rebuild its working tree from HEAD, `npm i` to restore untracked `node_modules`, then delete the orphan. Everything tracked is recoverable because it's committed in `.git`.

**Prevention:** before renaming a repo dir, close anything holding a handle *inside* it:
- a **media player** opened on a render holds that file's whole path tree (blocks moving any ancestor);
- an **elevated `Administrator: Command Prompt` with cwd inside** blocks with "access denied" and a non-elevated process can't kill it;
- AVG real-time scanning; editors with the folder open.

Then prefer `Rename-Item` / `cmd ren` (a pure rename that fails cleanly with **no copy fallback**) over `Move-Item`/`mv`. Hit during the narr8 (was social-video-pipeline) rename, 2026-06-02. See [[reference_avg_tls_npm]] for the related AVG-handle theme.

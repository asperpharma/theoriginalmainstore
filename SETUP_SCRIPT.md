## Claude Code on the Web — Harness Setup Script Fix

**Where this lives:** Claude Code on the web → Repo settings → *Setup Script*.
This is not a checked-in file; it must be fixed in the web UI.

**Bug:** The first line reads:

```
!/bin/bash
```

This makes the harness try to execute a command literally named `!/bin/bash`,
which fails. The correct shebang needs the hash:

```
#!/bin/bash
```

**Fix:**
1. Open Claude Code on the web.
2. Navigate to this repo's settings → *Setup Script*.
3. Change the first line from `!/bin/bash` to `#!/bin/bash`.
4. Save. Next session will pick it up.

Keep the rest of the script body unchanged.

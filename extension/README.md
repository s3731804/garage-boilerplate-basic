# Browser extension workspace

This is the isolated Manifest V3 workspace for Team B's browser extension.

## Commands

- `pnpm --filter @team34/extension test`
- `pnpm --filter @team34/extension typecheck`
- `pnpm --filter @team34/extension build`

The build is written to `extension/dist`. To smoke-test it, open
`chrome://extensions`, enable Developer mode, choose **Load unpacked**, and select
that `dist` directory. The toolbar action opens the placeholder popup.

Host access is deliberately limited to the three domains agreed in the task. New
hosts must be reviewed before being added to `public/manifest.json`.

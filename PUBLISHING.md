# Publishing the playground package

`@datapack-sandbox/vitepress-playground` is built in this repository from the pinned browser bundle in the main Datapack Sandbox release. Its npm package and GitHub release archive use the same version.

## Configure npm publication

Add a granular npm publish token as the `NPM_TOKEN` secret in `Alumopper/DatapackSandbox-Playground`. The `publish-npm.yml` workflow skips npm publication until this secret exists. The GitHub release tarball and checksum are produced independently, so they remain available without npm credentials.

## Release a version

1. Update `package.json` and `package-lock.json` together.
2. Run `npm ci` and `npm run check`.
3. Commit the changes, then create and push a tag matching the package version, such as `vitepress-playground-v0.2.3`.

The tag builds and tests the package, uploads its `.tgz` and `SHA256SUMS.txt` to GitHub Releases, and publishes to npm when `NPM_TOKEN` is configured. npm versions are immutable; use a new version for any later npm publication.

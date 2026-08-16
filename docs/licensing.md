# Licensing

## Repository license

The repository uses Apache License 2.0. The complete license text is in root `LICENSE`, and package metadata uses the SPDX identifier `Apache-2.0`.

## Cleanup-phase header policy

For now, add the short SPDX header only to **new** hand-authored source or configuration files that support comments. Do not add it to pre-existing files merely because they were edited; this keeps the review diff focused on real changes.

Use:

```text
SPDX-FileCopyrightText: 2026 Keresztes Zsolt <https://kereszteszsolt.hu>
SPDX-License-Identifier: Apache-2.0
```

Examples:

```ts
/*
 * SPDX-FileCopyrightText: 2026 Keresztes Zsolt <https://kereszteszsolt.hu>
 * SPDX-License-Identifier: Apache-2.0
 */
```

```toml
# SPDX-FileCopyrightText: 2026 Keresztes Zsolt <https://kereszteszsolt.hu>
# SPDX-License-Identifier: Apache-2.0
```

Do not force comment headers into JSON, Markdown, lock files, generated output, vendored libraries, minified files, binary assets, or files whose format does not safely support comments.

## Year and identity

Use the fixed year `2026` for files first created in 2026. A range can be introduced later when a file receives copyrightable changes in a later year. The website in angle brackets is acceptable identity metadata and makes the author unambiguous without changing the Apache license terms.

# Images module

Governing contract: [SP-04](../Specs/SP-04-images.md).

Decode JPEG/PNG/WebP under 5 MB, resize to 1600 px maximum width and re-encode as WebP. Persist generated file names.

Data: Item.photoUrl, Menu.bannerImageUrl. Server module: src/lib/uploads.ts. API boundary validates input before transaction. UI never establishes authorization.

Invariant: Reject bad bytes, unsupported formats, oversized files and excessive dimensions; preview before save.

# Phone Store — black and gold

Replica of https://phone-store-black-gold.ben-mor.workers.dev/, captured 2026-09-06 for effimorremitrix.

The original deployed React application and stylesheet are preserved, including Hebrew/right-to-left layout, English and Russian translations, black/gold design, search, filters, product details, favorites, cart and WhatsApp ordering.

## Catalog is store inventory

All 1,864 catalog products feed the storefront and full catalog. There is no separate 15-product supply list. Product IDs, names, prices and recorded availability come from the same catalog. The original 15-item cap and name-based store-only membership test have been removed. Catalog membership is the store's assortment; existing availability values are preserved without inventing quantities.

Edit `source/catalog.original.json` and run `npm run build` to update both views. Image URLs in that source are mapped to the checked-in files through `source/asset-manifest.json`. New images should also be downloaded and added to that manifest before rebuilding.

## Run

Requires Node.js 22 or newer; there are no packages to install.

```sh
npm run build
npm test
npm start
```

Open http://localhost:4173. The included server supports `/`, `/catalog-full`, `/products/:id`, and the original `/admin` view. Use the Node server for the complete snapshot behavior, including read-only API responses. `public/` can also be served by an SPA-aware static host, but it has no real admin API.

## Files and provenance

- `public/`: ready-to-serve site, catalog, available images and local fonts.
- `source/deployed.js` and `source/deployed.css`: original public deployed application artifacts, not original TypeScript source.
- `source/index.html`: original HTML with the platform's injected debug runtime removed.
- `source/catalog.original.json`: captured catalog and authoritative editable product data.
- `source/asset-manifest.json`: image source URLs, local paths, sizes and SHA-256 checksums.
- `scripts/build.mjs`: reproducible asset localization and inventory consolidation.
- `scripts/verify.mjs`: catalog integrity, image checksum, asset and syntax verification.

There are 1,661 downloaded image files, stored as real files in Git rather than external image links or Git LFS pointers. Original image bytes are retained. Fonts are stored locally as well.

## Replication limits

This is a replication of the accessible deployed public website, not a recovery of its private source repository or server infrastructure. At capture time the public `storefront.sourceData` endpoint reported `unavailable` with null data, and `managedCatalog.changes` returned no changes. The included server reproduces those read-only responses. The private admin authentication, writes, database and supplier integration were not exposed and are not recreated; the admin UI cannot save changes. Maintain the catalog in this repository instead.

Fifteen legacy `/manus-storage/p*.webp` references returned HTML instead of images on the original site. They are recorded as unavailable in the manifest, and their fallback references are mapped to the corresponding saved catalog photos. All available catalog and category/hero image URLs were downloaded successfully.

No new license is asserted over the original site or third-party assets. Existing notices in the deployed code remain intact.

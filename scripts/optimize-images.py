"""Create deployment-only WebP variants; original assets remain untouched."""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
from PIL import Image, ImageOps
import json

root = Path(__file__).resolve().parents[1]
dist = (root / 'dist').resolve()
manifest = json.loads((root / 'source/asset-manifest.json').read_text(encoding='utf-8'))

def convert(asset):
    original = root / 'public' / asset['path'].lstrip('/')
    relative = str(Path(asset['path']).with_suffix('.webp')).replace('\\', '/')
    output = dist / relative.lstrip('/')
    output.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(original) as source:
        image = ImageOps.exif_transpose(source)
        image.thumbnail((1600, 1600), Image.Resampling.LANCZOS)
        image.save(output, 'WEBP', quality=92, method=4)
    old_output = (dist / asset['path'].lstrip('/')).resolve()
    assert old_output.is_relative_to(dist)
    if old_output != output.resolve():
        old_output.unlink(missing_ok=True)
    return asset['path'], relative

with ThreadPoolExecutor(max_workers=6) as pool:
    replacements = dict(pool.map(convert, manifest['assets']))
for file in dist.rglob('*'):
    if file.is_file() and file.suffix in {'.js', '.json', '.css', '.html'}:
        text = file.read_text(encoding='utf-8')
        for original, replacement in replacements.items():
            text = text.replace(original, replacement)
        file.write_text(text, encoding='utf-8')
catalog = json.loads((dist / 'citycell-web-catalog.json').read_text(encoding='utf-8'))
assert all((dist / p['imageUrl'].lstrip('/')).is_file() for p in catalog['products'])
size = sum(f.stat().st_size for f in dist.rglob('*') if f.is_file())
print(f'Deployment assets: {len(replacements)} images, {size / 1024**2:.1f} MiB. Originals unchanged.', flush=True)

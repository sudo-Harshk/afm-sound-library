#!/usr/bin/env python3
"""
Download sound effects from YouTube URLs listed in sound-urls JSON files.
Saves WAV masters and MP3 320kbps web versions.
"""

import json
import os
import re
import shutil
import subprocess
import sys
import time
from pathlib import Path

# Project root
ROOT = Path(__file__).resolve().parent.parent
SOUND_URLS_DIR = ROOT / "sound-urls"
LOG_FILE = ROOT / "download-errors.log"
DELAY_SECONDS = 2

# Ensure venv bin is in PATH so yt-dlp finds ffmpeg
VENV_BIN = str(ROOT / ".venv" / "bin")
os.environ["PATH"] = VENV_BIN + os.pathsep + os.environ.get("PATH", "")


def sanitize_filename(name: str) -> str:
    """Remove characters that are problematic in filenames."""
    name = re.sub(r'[<>:"/\\|?*]', '', name)
    name = re.sub(r'\s+', ' ', name).strip()
    return name


def find_ffmpeg() -> str:
    """Find ffmpeg binary - check venv first, then system."""
    venv_ffmpeg = ROOT / ".venv" / "bin" / "ffmpeg"
    if venv_ffmpeg.exists():
        return str(venv_ffmpeg)
    result = shutil.which("ffmpeg")
    if result:
        return result
    print("ERROR: ffmpeg not found!")
    sys.exit(1)


def load_all_labels() -> list[dict]:
    """Load all labels from all JSON files, deduplicating by URL."""
    all_labels = []
    seen_urls = {}

    for json_file in sorted(SOUND_URLS_DIR.glob("*/*.json")):
        with open(json_file) as f:
            data = json.load(f)

        category_dir = json_file.parent
        category_name = data["category"]

        for label in data["labels"]:
            url = label["url"]
            canonical = label["canonicalLabel"]

            if url in seen_urls:
                # Duplicate URL - record mapping for later copy
                all_labels.append({
                    "category": category_name,
                    "category_dir": category_dir,
                    "canonicalLabel": canonical,
                    "url": url,
                    "duplicate_of": seen_urls[url],
                    "skip_download": True,
                })
            else:
                seen_urls[url] = canonical
                all_labels.append({
                    "category": category_name,
                    "category_dir": category_dir,
                    "canonicalLabel": canonical,
                    "subCategory": label.get("subCategory", ""),
                    "url": url,
                    "skip_download": False,
                })

    return all_labels


def download_one(label: dict, ffmpeg_path: str) -> bool:
    """Download a single label. Returns True on success."""
    canonical = label["canonicalLabel"]
    category_dir = label["category_dir"]
    safe_name = sanitize_filename(canonical)

    masters_dir = category_dir / "masters"
    web_dir = category_dir / "web"

    wav_path = masters_dir / f"{safe_name}.wav"
    mp3_path = web_dir / f"{safe_name}.mp3"

    # If both already exist, skip
    if wav_path.exists() and mp3_path.exists():
        print(f"  SKIP (exists): {canonical}")
        return True

    # If this is a duplicate, copy from the original
    if label.get("skip_download") and label.get("duplicate_of"):
        orig_name = sanitize_filename(label["duplicate_of"])
        orig_wav = masters_dir / f"{orig_name}.wav"
        orig_mp3 = web_dir / f"{orig_name}.mp3"

        if orig_wav.exists() and not wav_path.exists():
            shutil.copy2(orig_wav, wav_path)
        if orig_mp3.exists() and not mp3_path.exists():
            shutil.copy2(orig_mp3, mp3_path)

        if wav_path.exists() and mp3_path.exists():
            print(f"  COPY (duplicate): {canonical} <- {label['duplicate_of']}")
            return True
        else:
            print(f"  SKIP (duplicate, original missing): {canonical}")
            return False

    url = label["url"]

    # Download as WAV first (masters)
    if not wav_path.exists():
        print(f"  Downloading WAV: {canonical}...")
        yt_dlp_bin = str(ROOT / ".venv" / "bin" / "yt-dlp")
        cmd_wav = [
            yt_dlp_bin,
            "-x", "--audio-format", "wav",
            "--audio-quality", "0",
            "-o", str(masters_dir / f"{safe_name}.%(ext)s"),
            "--no-playlist",
            "--no-overwrites",
            url,
        ]
        result = subprocess.run(cmd_wav, capture_output=True, text=True, timeout=120)
        if result.returncode != 0:
            print(f"  FAILED WAV: {canonical}")
            print(f"    Error: {result.stderr[-200:] if result.stderr else 'unknown'}")
            return False

    # Convert WAV to MP3 320kbps
    if not mp3_path.exists() and wav_path.exists():
        print(f"  Converting to MP3: {canonical}...")
        cmd_mp3 = [
            ffmpeg_path,
            "-i", str(wav_path),
            "-codec:a", "libmp3lame",
            "-b:a", "320k",
            "-y",
            str(mp3_path),
        ]
        result = subprocess.run(cmd_mp3, capture_output=True, text=True, timeout=60)
        if result.returncode != 0:
            print(f"  FAILED MP3 conversion: {canonical}")
            return False

    if wav_path.exists() and mp3_path.exists():
        wav_size = wav_path.stat().st_size / 1024
        mp3_size = mp3_path.stat().st_size / 1024
        print(f"  OK: {canonical} (WAV: {wav_size:.0f}KB, MP3: {mp3_size:.0f}KB)")
        return True
    else:
        print(f"  INCOMPLETE: {canonical}")
        return False


def main():
    print("=" * 60)
    print("Sound Effects Downloader")
    print("=" * 60)

    ffmpeg_path = find_ffmpeg()
    print(f"ffmpeg: {ffmpeg_path}")

    labels = load_all_labels()
    total = len(labels)
    download_needed = sum(1 for l in labels if not l.get("skip_download"))
    duplicates = sum(1 for l in labels if l.get("skip_download"))

    print(f"Total labels: {total}")
    print(f"Unique downloads: {download_needed}")
    print(f"Duplicates (will copy): {duplicates}")
    print()

    # Clear error log
    LOG_FILE.write_text("")

    success = 0
    failed = 0
    skipped = 0
    errors = []

    for i, label in enumerate(labels, 1):
        canonical = label["canonicalLabel"]
        category = label["category"]
        print(f"[{i}/{total}] {category} / {canonical}")

        try:
            result = download_one(label, ffmpeg_path)
            if result:
                success += 1
            else:
                failed += 1
                errors.append(f"{category} / {canonical}: download/conversion failed")
        except subprocess.TimeoutExpired:
            print(f"  TIMEOUT: {canonical}")
            failed += 1
            errors.append(f"{category} / {canonical}: timeout")
        except Exception as e:
            print(f"  ERROR: {canonical}: {e}")
            failed += 1
            errors.append(f"{category} / {canonical}: {e}")

        # Rate limit delay (skip for duplicates and already-existing)
        if not label.get("skip_download") and not (Path(label["category_dir"]) / "masters" / sanitize_filename(canonical)).with_suffix(".wav").exists() is False:
            time.sleep(DELAY_SECONDS)

    # Write errors
    if errors:
        LOG_FILE.write_text("\n".join(errors))

    # Summary
    print()
    print("=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"Total:    {total}")
    print(f"Success:  {success}")
    print(f"Failed:   {failed}")
    if errors:
        print(f"\nErrors logged to: {LOG_FILE}")
    print("=" * 60)

    # Count actual files
    wav_count = len(list(SOUND_URLS_DIR.glob("*/masters/*.wav")))
    mp3_count = len(list(SOUND_URLS_DIR.glob("*/web/*.mp3")))
    print(f"\nFiles on disk: {wav_count} WAV, {mp3_count} MP3")


if __name__ == "__main__":
    main()

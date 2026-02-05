import os
import shutil
import sys
from pathlib import Path

def main():
    print("🧹 Cleaning up Afri-Verify demo environment...")

    base_dir = Path(__file__).resolve().parent.parent
    
    # 1. Delete Database
    db_path = base_dir / "afriverify.db"
    if db_path.exists():
        try:
            os.remove(db_path)
            print(f"✅ Deleted database: {db_path.name}")
        except PermissionError:
            print(f"❌ Could not delete {db_path.name}. Is the server running? Please STOP the server and try again.")
            return
    else:
        print(f"ℹ️  Database not found (clean): {db_path.name}")

    # 2. Clean Uploads Directory
    uploads_dir = base_dir / "uploads"
    if uploads_dir.exists():
        # Remove all files in uploads but keep the directory
        count = 0
        for item in uploads_dir.iterdir():
            if item.is_file():
                try:
                    item.unlink()
                    count += 1
                except Exception as e:
                    print(f"⚠️ Failed to delete {item.name}: {e}")
            elif item.is_dir():
                try:
                    shutil.rmtree(item)
                    count += 1
                except Exception as e:
                    print(f"⚠️ Failed to delete directory {item.name}: {e}")
        print(f"✅ Cleaned {count} files from matches/uploads/")
    else:
        # Create it if missing
        uploads_dir.mkdir(exist_ok=True)
        print(f"✅ Created uploads directory: {uploads_dir.name}")

    print("\n✨ Reset complete!")
    print("👉 Now run: 'python -m uvicorn app.main:app --reload'")
    print("   On startup, the system will auto-seed the Global RoO Manual (this may take ~30s).")

if __name__ == "__main__":
    main()

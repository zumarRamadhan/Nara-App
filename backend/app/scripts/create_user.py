import argparse
import getpass
import sys

from app.core.security import hash_password
from app.db.session import SessionLocal
from app.models.activity_log import ActivityLog
from app.models.user import User


def create_user_cli():
    parser = argparse.ArgumentParser(description="Buat pengguna baru di database Nara.")
    parser.add_argument("--email", required=True, help="Alamat email pengguna")
    parser.add_argument("--name", required=True, help="Nama lengkap pengguna")

    args = parser.parse_args()
    email = args.email.strip().lower()
    name = args.name.strip()

    print(f"Membuat pengguna untuk email: {email}")
    password = getpass.getpass("Masukkan kata sandi (minimal 8 karakter): ")
    if len(password) < 8:
        print("Galat: Kata sandi harus minimal 8 karakter.", file=sys.stderr)
        sys.exit(1)

    confirm_password = getpass.getpass("Konfirmasi kata sandi: ")
    if password != confirm_password:
        print("Galat: Konfirmasi kata sandi tidak cocok.", file=sys.stderr)
        sys.exit(1)

    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == email).first()
        if existing:
            print(
                f"Galat: Pengguna dengan email '{email}' sudah ada di database.",
                file=sys.stderr,
            )
            sys.exit(1)

        hashed = hash_password(password)
        user = User(
            name=name,
            email=email,
            password_hash=hashed,
        )
        db.add(user)
        db.flush()

        log = ActivityLog(user_id=user.id, action="CLI_CREATE_USER")
        db.add(log)
        db.commit()

        print(
            f"Sukses! Pengguna '{name}' ({email}) dengan ID {user.id} berhasil dibuat."
        )
    finally:
        db.close()


if __name__ == "__main__":
    create_user_cli()

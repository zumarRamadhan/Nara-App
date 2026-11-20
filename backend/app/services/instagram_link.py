import re
from dataclasses import dataclass
from urllib.parse import urlsplit


class InvalidInstagramLinkError(Exception):
    """Exception khusus saat tautan Instagram tidak valid."""

    def __init__(self, message: str) -> None:
        self.message = message
        super().__init__(message)


@dataclass(frozen=True)
class ParsedLink:
    shortcode: str
    kind: str  # "post" | "reel"


# Pola regex untuk path Instagram yang valid:
# Opsional awalan username: /(username)/
# Tipe: (p|reel|reels)
# Shortcode: ([A-Za-z0-9_-]+)
_PATH_PATTERN = re.compile(
    r"^(?:/[a-zA-Z0-9._-]+)?/(p|reel|reels)/([^/?#]+)/?$"
)
_SHORTCODE_PATTERN = re.compile(r"^[A-Za-z0-9_-]+$")


def parse_instagram_url(url: str) -> ParsedLink:
    """
    Mem-parse URL postingan atau reel Instagram dan mengembalikan ParsedLink(shortcode, kind).

    Menerima format seperti:
    - https://www.instagram.com/p/XXXX/
    - https://instagram.com/reel/XXXX/
    - instagram.com/reels/XXXX?igsh=123
    - https://www.instagram.com/username/p/XXXX/
    - /p/XXXX/ tanpa domain tidak diterima kecuali ada domain instagram.com
    """
    if not url or not isinstance(url, str) or not url.strip():
        raise InvalidInstagramLinkError("Tautan Instagram tidak boleh kosong.")

    cleaned_url = url.strip()

    if len(cleaned_url) > 300:
        raise InvalidInstagramLinkError("Tautan Instagram terlalu panjang (maksimal 300 karakter).")

    # Tambahkan skema https jika belum ada agar urlsplit berfungsi dengan benar
    url_to_parse = cleaned_url
    if not (url_to_parse.startswith("http://") or url_to_parse.startswith("https://")):
        # Periksa apakah ada protokol lain yang tidak didukung (mis. ftp://)
        if "://" in url_to_parse:
            raise InvalidInstagramLinkError(
                "Protokol URL tidak didukung. Gunakan https:// atau tanpa protokol."
            )
        url_to_parse = f"https://{url_to_parse}"

    try:
        parts = urlsplit(url_to_parse)
    except Exception as exc:
        raise InvalidInstagramLinkError("Format tautan tidak valid.") from exc

    netloc = parts.netloc.lower()
    # Hilangkan port jika ada
    if ":" in netloc:
        netloc = netloc.split(":")[0]

    # Validasi domain: hanya mengizinkan instagram.com atau www.instagram.com
    valid_domains = {"instagram.com", "www.instagram.com"}
    if netloc not in valid_domains:
        raise InvalidInstagramLinkError(
            f"Domain '{netloc or 'tidak diketahui'}' tidak didukung. Tautan harus berasal dari instagram.com."
        )

    path = parts.path

    # Tolak path khusus yang dilarang eksplisit
    lower_path = path.lower()
    if "/stories/" in lower_path:
        raise InvalidInstagramLinkError("Tautan Instagram Stories tidak didukung.")
    if "/tv/" in lower_path:
        raise InvalidInstagramLinkError("Tautan Instagram TV (IGTV) tidak didukung.")

    match = _PATH_PATTERN.match(path)
    if not match:
        raise InvalidInstagramLinkError(
            "Tautan harus mengarah ke postingan (/p/) atau reel (/reel/ atau /reels/) Instagram."
        )

    raw_kind, raw_shortcode = match.groups()

    if not _SHORTCODE_PATTERN.match(raw_shortcode):
        raise InvalidInstagramLinkError(
            "Kode konten (shortcode) Instagram tidak valid. "
            "Hanya karakter alfanumerik, garis bawah, dan tanda hubung yang diizinkan."
        )

    kind = "post" if raw_kind == "p" else "reel"
    return ParsedLink(shortcode=raw_shortcode, kind=kind)

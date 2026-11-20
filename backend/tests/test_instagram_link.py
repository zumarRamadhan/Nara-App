import pytest

from app.services.instagram_link import InvalidInstagramLinkError, parse_instagram_url


def test_valid_instagram_urls():
    valid_cases = [
        ("https://www.instagram.com/p/C-abc123/", "C-abc123", "post"),
        ("https://instagram.com/p/C-abc123", "C-abc123", "post"),
        ("http://www.instagram.com/p/C-abc123/", "C-abc123", "post"),
        ("instagram.com/p/C-abc123", "C-abc123", "post"),
        ("https://www.instagram.com/reel/C-abc123/", "C-abc123", "reel"),
        ("https://instagram.com/reels/C-abc123", "C-abc123", "reel"),
        ("https://www.instagram.com/username/p/C-abc123/", "C-abc123", "post"),
        ("https://instagram.com/user.name/reel/C-abc123?igsh=123", "C-abc123", "reel"),
        ("   https://www.instagram.com/p/C_12-3/   ", "C_12-3", "post"),
        ("instagram.com/reel/xyz_ABC-123", "xyz_ABC-123", "reel"),
        ("https://www.instagram.com/p/12345/", "12345", "post"),
        ("https://www.instagram.com/p/abc_def/", "abc_def", "post"),
        ("www.instagram.com/reel/test99/?utm_source=ig_web_copy_link", "test99", "reel"),
    ]

    for url, expected_code, expected_kind in valid_cases:
        parsed = parse_instagram_url(url)
        assert parsed.shortcode == expected_code, f"Failed shortcode for {url}"
        assert parsed.kind == expected_kind, f"Failed kind for {url}"


def test_invalid_instagram_urls():
    invalid_cases = [
        "",  # kosong
        "   ",  # whitespace saja
        "https://instagram.com/" + "a" * 300,  # terlalu panjang > 300 char
        "https://facebook.com/p/C-abc123/",  # domain salah
        "https://twitter.com/user/status/123",  # domain salah
        "https://tiktok.com/@user/video/123",  # domain salah
        "https://www.instagram.com/username",  # profil, bukan post
        "https://www.instagram.com/stories/username/12345678/",  # stories
        "https://www.instagram.com/tv/C-abc123/",  # IGTV
        "https://www.instagram.com/p/invalid!char/",  # karakter terlarang (!)
        "https://www.instagram.com/p/invalid@char/",  # karakter terlarang (@)
        "https://www.instagram.com/p/",  # tanpa shortcode
        "ftp://www.instagram.com/p/C-abc123/",  # protokol tidak didukung
    ]

    for url in invalid_cases:
        with pytest.raises(InvalidInstagramLinkError):
            parse_instagram_url(url)

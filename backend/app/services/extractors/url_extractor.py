import ipaddress
import socket
from urllib.parse import urlparse
from bs4 import BeautifulSoup
import httpx


def _is_private_or_invalid_host(hostname: str) -> bool:
    """Validate that the target host does not resolve to private or loopback IP ranges."""
    try:
        # Resolve hostname to IP addresses
        addr_info = socket.getaddrinfo(hostname, None)
        for _, _, _, _, sockaddr in addr_info:
            ip_str = sockaddr[0]
            ip = ipaddress.ip_address(ip_str)
            if ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_reserved or ip.is_multicast:
                return True
        return False
    except Exception:
        return True


def extract_url(target_url: str) -> str:
    """Safely fetch and extract clean article text from a public web page."""
    if not target_url or not target_url.strip():
        raise ValueError("URL cannot be empty.")

    target_url = target_url.strip()
    if not (target_url.startswith("http://") or target_url.startswith("https://")):
        target_url = "https://" + target_url

    parsed = urlparse(target_url)
    if not parsed.hostname:
        raise ValueError(f"Invalid URL structure: {target_url}")

    if _is_private_or_invalid_host(parsed.hostname):
        raise ValueError("Fetching from private, local, or unresolvable network addresses is prohibited.")

    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 TransformAI/1.0"
        ),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    }

    try:
        with httpx.Client(timeout=15.0, follow_redirects=True, headers=headers) as client:
            response = client.get(target_url)
            response.raise_for_status()
            html_text = response.text
    except Exception as exc:
        raise ValueError(f"Failed to fetch content from URL ({target_url}): {str(exc)}") from exc

    soup = BeautifulSoup(html_text, "html.parser")

    # Remove script, style, nav, footer, ads elements
    for element in soup(["script", "style", "nav", "footer", "header", "noscript", "aside", "form", "svg"]):
        element.decompose()

    # Extract title
    page_title = ""
    if soup.title and soup.title.string:
        page_title = soup.title.string.strip()

    # Extract main content or article
    main_node = soup.find("article") or soup.find("main") or soup.find("body") or soup

    paragraphs = []
    for p in main_node.find_all(["h1", "h2", "h3", "h4", "p", "li"]):
        text = p.get_text(separator=" ", strip=True)
        if text and len(text) > 10:
            paragraphs.append(text)

    content = "\n\n".join(paragraphs).strip()
    if not content:
        raise ValueError("Could not extract readable article text from the specified URL.")

    header = f"SOURCE URL: {target_url}"
    if page_title:
        header += f"\nPAGE TITLE: {page_title}"

    return f"{header}\n\n{content}"

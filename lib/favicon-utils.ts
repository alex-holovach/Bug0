/**
 * Utility function to get favicon URL for a given domain
 */
export const getFavicon = (url: string) => {
  const getRootDomain = (domain: string) => {
    if (
      typeof domain !== 'string' ||
      !domain.match(/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
    ) {
      return '';
    }
    const parts = domain.split('.');
    if (parts.length < 2) return '';
    const lastTwo = parts.slice(-2).join('.');
    return lastTwo;
  };

  const domain = getRootDomain(url);
  if (!domain) return null;

  // Use Google S2 favicons API with size=64 for better quality
  // See: https://developers.google.com/maps/documentation/urls/get-started#favicon
  const faviconUrl = `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
  return faviconUrl;
};

/**
 * Get favicon with CSS classes for proper dark mode handling
 * @param url - The domain URL or domain string
 * @returns Object with favicon URL and CSS classes
 */
export const getFaviconWithClasses = (url: string) => {
  const faviconUrl = getFavicon(url);
  if (!faviconUrl) return { url: null, className: '' };

  // For Google favicons, we typically don't need special dark mode handling
  // as they are usually designed to work in both light and dark modes
  return {
    url: faviconUrl,
    className: '',
  };
};

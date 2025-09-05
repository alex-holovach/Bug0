/**
 * Utility function to get icon for a given domain
 * Returns local icon for known domains, falls back to Google favicon service
 */

// Map of known domains to their icon filenames
const KNOWN_DOMAINS: Record<string, string> = {
  'github.com': 'github.svg',
  'aws.amazon.com': 'aws.png',
  'vercel.com': 'vercel.svg',
  'stripe.com': 'stripe.svg',
  'slack.com': 'slack.svg',
  'datadoghq.com': 'datadog.svg',
  'grafana.com': 'grafana.svg',
  'kubernetes.io': 'kubernetes.svg',
  'kubiks.ai': 'kubiks.svg',
  'python.org': 'python.svg',
  'nodejs.org': 'nodejs.svg',
  'reactjs.org': 'react.svg',
  'nextjs.org': 'nextjs.svg',
  'golang.org': 'golang.svg',
  'java.com': 'java.svg',
  'dotnet.microsoft.com': 'dotnet.svg',
  'cloud.google.com': 'gcp.svg',
  'azure.microsoft.com': 'azure.svg',
  'gitlab.com': 'gitlab.svg',
  'cloudflare.com': 'cloudflare.svg',
  'nginx.com': 'nginx.svg',
  'postgresql.org': 'postgresql.svg',
  'openai.com': 'openai.svg',
  'jira.com': 'jira.svg',
  'lambda.amazonaws.com': 'lambda.svg',
  'sqs.amazonaws.com': 'sqs.svg',
  's3.amazonaws.com': 's3.svg',
  'alb.amazonaws.com': 'alb.svg',
  'waf.amazonaws.com': 'waf.svg',
  'pubsub.googleapis.com': 'pubsub.svg',
  'airflow.apache.org': 'airflow.svg',
  'argoproj.github.io': 'argo-cd.svg',
  'salesforce.com': 'salesforce.svg',
  'shopify.com': 'shopify.svg',
  'sonarqube.org': 'sonarqube.svg',
  'statuspage.io': 'statuspage.svg',
  'ruby-lang.org': 'ruby.svg',
};

// Icons that need dark mode inversion (white icons that need to be inverted in dark mode)
const WHITE_ICONS = new Set([
  'vercel.svg',
  'github.svg',
  'kubiks.svg',
  'nextjs.svg',
]);

// Icons that need opposite dark mode inversion (dark icons that need to be inverted in light mode)
const DARK_ICONS = new Set<string>(['openai.svg']);

/**
 * Get the root domain from a URL
 */
const getRootDomain = (url: string): string => {
  if (typeof url !== 'string' || !url.match(/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) {
    return '';
  }
  const parts = url.split('.');
  if (parts.length < 2) return '';
  const lastTwo = parts.slice(-2).join('.');
  return lastTwo;
};

/**
 * Get icon for a given domain
 * @param domain - The domain URL or domain string
 * @returns Icon URL (local path for known domains, Google favicon URL for unknown)
 */
export const getDomainIcon = (domain: string): string => {
  // Clean and normalize the domain
  let cleanDomain = domain.toLowerCase().trim();

  // Remove protocol if present
  if (cleanDomain.startsWith('http://') || cleanDomain.startsWith('https://')) {
    try {
      const url = new URL(cleanDomain);
      cleanDomain = url.hostname;
    } catch {
      // If URL parsing fails, try to extract domain manually
      cleanDomain = cleanDomain.replace(/^https?:\/\//, '');
    }
  }

  // Remove www. prefix if present
  cleanDomain = cleanDomain.replace(/^www\./, '');

  // Get root domain
  const rootDomain = getRootDomain(cleanDomain);
  if (!rootDomain) {
    // Fallback to Google favicon for invalid domains
    return `https://www.google.com/s2/favicons?sz=64&domain=${encodeURIComponent(cleanDomain)}`;
  }

  // Check if we have a known icon for this domain
  // First check exact matches, then check if the domain ends with any known domain
  let knownIcon = KNOWN_DOMAINS[rootDomain] || KNOWN_DOMAINS[cleanDomain];

  if (!knownIcon) {
    // Check if the domain ends with any known domain (for subdomains)
    for (const [knownDomain, iconFile] of Object.entries(KNOWN_DOMAINS)) {
      if (
        cleanDomain.endsWith(`.${knownDomain}`) ||
        cleanDomain === knownDomain
      ) {
        knownIcon = iconFile;
        break;
      }
    }
  }

  if (knownIcon) {
    // Return local icon path
    return `/icons/${knownIcon}`;
  }

  // Fallback to Google favicon service
  return `https://www.google.com/s2/favicons?sz=64&domain=${encodeURIComponent(rootDomain)}`;
};

/**
 * Get icon with CSS classes for proper dark mode handling
 * @param domain - The domain URL or domain string
 * @returns Object with icon URL and CSS classes
 */
export const getDomainIconWithClasses = (domain: string) => {
  // Clean and normalize the domain
  let cleanDomain = domain.toLowerCase().trim();

  // Remove protocol if present
  if (cleanDomain.startsWith('http://') || cleanDomain.startsWith('https://')) {
    try {
      const url = new URL(cleanDomain);
      cleanDomain = url.hostname;
    } catch {
      // If URL parsing fails, try to extract domain manually
      cleanDomain = cleanDomain.replace(/^https?:\/\//, '');
    }
  }

  // Remove www. prefix if present
  cleanDomain = cleanDomain.replace(/^www\./, '');

  // Get root domain
  const rootDomain = getRootDomain(cleanDomain);
  if (!rootDomain) {
    // Fallback to Google favicon for invalid domains
    return {
      url: `https://www.google.com/s2/favicons?sz=64&domain=${encodeURIComponent(cleanDomain)}`,
      className: '',
    };
  }

  // Check if we have a known icon for this domain
  // First check exact matches, then check if the domain ends with any known domain
  let knownIcon = KNOWN_DOMAINS[rootDomain] || KNOWN_DOMAINS[cleanDomain];

  if (!knownIcon) {
    // Check if the domain ends with any known domain (for subdomains)
    for (const [knownDomain, iconFile] of Object.entries(KNOWN_DOMAINS)) {
      if (
        cleanDomain.endsWith(`.${knownDomain}`) ||
        cleanDomain === knownDomain
      ) {
        knownIcon = iconFile;
        break;
      }
    }
  }

  if (knownIcon) {
    // Check if this icon needs dark mode inversion
    const needsWhiteInversion = WHITE_ICONS.has(knownIcon);
    const needsDarkInversion = DARK_ICONS.has(knownIcon);

    let className = '';
    if (needsWhiteInversion) {
      className = 'invert dark:invert-0';
    } else if (needsDarkInversion) {
      className = 'dark:invert';
    }

    return {
      url: `/icons/${knownIcon}`,
      className,
    };
  }

  // Fallback to Google favicon service
  return {
    url: `https://www.google.com/s2/favicons?sz=64&domain=${encodeURIComponent(rootDomain)}`,
    className: '',
  };
};

/**
 * Check if a domain has a known local icon
 * @param domain - The domain to check
 * @returns True if the domain has a local icon
 */
export const hasKnownIcon = (domain: string): boolean => {
  const cleanDomain = domain
    .toLowerCase()
    .trim()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '');
  const rootDomain = getRootDomain(cleanDomain);

  // First check exact matches
  let hasIcon = !!(KNOWN_DOMAINS[rootDomain] || KNOWN_DOMAINS[cleanDomain]);

  if (!hasIcon) {
    // Check if the domain ends with any known domain (for subdomains)
    for (const knownDomain of Object.keys(KNOWN_DOMAINS)) {
      if (
        cleanDomain.endsWith(`.${knownDomain}`) ||
        cleanDomain === knownDomain
      ) {
        hasIcon = true;
        break;
      }
    }
  }

  return hasIcon;
};

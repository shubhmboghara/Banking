 const sessionCookieOptions = {
  // Prevents client-side JS from reading the cookie (protects against XSS attacks)
  httpOnly: true,

  // Makes the cookie available across all pages/routes of your website
  path: "/",

  // If in production, cookie only sends over HTTPS; in development, HTTP is okay
  secure: process.env.NODE_ENV === "production",

  // 'none' allows uuu.com to send cookies to lll.com (Cross-Site).
  // 'lax' is the safer default for local development.
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",

  // Calculation: 1000ms * 60s * 60m * 24h * 7d = 7 Days.
  maxAge: 1000 * 60 * 60 * 24 * 7,
};

export default sessionCookieOptions
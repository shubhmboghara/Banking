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

  // 15 minutes 
  maxAge: 15 * 60 * 1000
};

export default sessionCookieOptions
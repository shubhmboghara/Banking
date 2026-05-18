import session from "express-session";
import { RedisStore } from "connect-redis";
import { redisClient } from "../config/redis.config.js";
import sessionCookieOptions  from "../config/sessioncookie.config.js";


 const createSessionMiddleware = () => {

  if (!redisClient) {
    throw new Error('Redis client is required for session storage.')
  }
 

  const store = new RedisStore({
    client: redisClient,
    prefix: 'banking:session:',
    ttl: 15 * 60, 
  })

  store.on('error', (err) => {
    console.error('Redis session store error:', err)
    process.exit(1)
  })


  const sessionOptions = {
   

    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    rolling: true,   
    store,
    cookie: sessionCookieOptions,
  };

 

  return session(sessionOptions);
};

export default createSessionMiddleware;
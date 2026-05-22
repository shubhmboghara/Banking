import crypto from "crypto";
import APiError from "../util/ApiError.js";
import { sendOtpEmail } from "./email.service.js";
import { sequenceRedisClient as redisClient } from "../config/sequenceRedis.config.js";

const OTP_EXPIRY = 10 * 60;
const MAX_ATTEMPTS = 3;
const otpKey = (identifier, purpose) => `otp:${purpose}:${identifier}`;
const attemptsKey = (identifier, purpose) => `otp:attempts:${purpose}:${identifier}`;

0
const generateAndSendOtp = async (identifier, name, purpose) => {
    const otp = crypto.randomInt(100000, 999999).toString();

    await Promise.all([
        redisClient.setEx(otpKey(identifier, purpose), OTP_EXPIRY, otp),
        redisClient.setEx(attemptsKey(identifier, purpose), OTP_EXPIRY, "0"),
    ]);

    await sendOtpEmail(identifier, otp, name);
    console.log(`OTP sent to ${identifier} for ${purpose}`);
};

const verifyOtp = async (identifier, purpose, otp) => {
    const storedOtp = await redisClient.get(otpKey(identifier, purpose));

    if (!storedOtp) {
        const attempts = await redisClient.get(attemptsKey(identifier, purpose));

        throw new APiError(
            400,
            attempts === null
                ? "OTP not found. Please request a new one."
                : "OTP has expired. Please request a new one.",
        );
    }

    if (storedOtp !== otp) {
        const attempts = await redisClient.incr(attemptsKey(identifier, purpose));
        const remaining = MAX_ATTEMPTS - attempts;

        if (remaining <= 0) {
            await Promise.all([
                redisClient.del(otpKey(identifier, purpose)),
                redisClient.del(attemptsKey(identifier, purpose)),
            ])
            throw new APiError(429, "Too many attempts. Please request a new OTP.");
        }

        throw new APiError(
            400,
            `Invalid OTP. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining`,
        );
    }

    await Promise.all([
        redisClient.del(otpKey(identifier, purpose)),
        redisClient.del(attemptsKey(identifier, purpose)),
    ]);
};

export { generateAndSendOtp, verifyOtp };
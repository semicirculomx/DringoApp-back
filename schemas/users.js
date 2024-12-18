import joi from 'joi';

export const userSignUp = joi.object({
    name: joi.string().min(3).max(30).required(),
    email: joi.string().email({ minDomainSegments: 2 }).required(),
    password: joi.string().min(6).max(30).required(),
    phone: joi.string().pattern(/^[0-9]{10,15}$/).required(), // Ejemplo: entre 10 y 15 dígitos
    ageVerified: joi.boolean().required(),
});

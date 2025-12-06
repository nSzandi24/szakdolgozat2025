const argon2 = require('argon2');
const { User } = require('../database');

async function login(data) {
    const { email, password } = data || {};
    if (!email || !password) {
        return { success: false, message: 'Email és jelszó megadása kötelező.' };
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
        return { success: false, message: 'Nincs ilyen felhasználó.' };
    }

    try {
        const match = await argon2.verify(user.password_digest, password);
        if (!match) {
            return { success: false, message: 'Hibás email vagy jelszó.' };
        }

        return { success: true, user: user.toJSON() };
    } catch (err) {
        console.error('Auth verify error:', err);
        return { success: false, message: 'Szerverhiba a bejelentkezés során.' };
    }
}

module.exports = { login };
const argon2 = require('argon2');
const { User } = require('../database');

async function validateRegistrationData(data) {
    const errors = [];

    if (!data.username || data.username.trim().length < 3) {
        errors.push('A felhasználónév legalább 3 karakter hosszú kell legyen!');
    }

    if (!data.email || !data.email.includes('@')) {
        errors.push('Érvénytelen email cím!');
    }

    if (!data.password || data.password.length < 6) {
        errors.push('A jelszó legalább 6 karakter hosszú kell legyen!');
    }

    if (data.password !== data.passwordConfirm) {
        errors.push('A jelszavak nem egyeznek!');
    }

    if (await User.findOne({ where: { username: data.username } })) {
        errors.push('Ez a felhasználónév már foglalt!');
    }

    if (await User.findOne({ where: { email: data.email } })) {
        errors.push('Ez az email cím már regisztrálva van!');
    }

    return errors;
}

async function register(data) {
    const errors = await validateRegistrationData(data);
    if (errors.length > 0) {
        return { success: false, message: errors.join(' ') };
    }

    const hashed = await argon2.hash(data.password);

    const newUser = await User.create({
        username: data.username,
        email: data.email,
        password_digest: hashed
    });

    return {
        success: true,
        message: 'Sikeres regisztráció!',
        user: { id: newUser.id, username: newUser.username, email: newUser.email }
    };
}

module.exports = { register, validateRegistrationData };

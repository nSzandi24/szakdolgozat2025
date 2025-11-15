const User = require('../database/models/user');

function validateRegistrationData(data) {
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

    if (User.findByUsername(data.username)) {
        errors.push('Ez a felhasználónév már foglalt!');
    }

    if (User.findByEmail(data.email)) {
        errors.push('Ez az email cím már regisztrálva van!');
    }

    return errors;
}

function register(data) {
    const errors = validateRegistrationData(data);
    if (errors.length > 0) {
        return { success: false, message: errors.join(' ') };
    }

    const newUser = User.create({
        username: data.username,
        email: data.email,
        password: data.password
    });

    return {
        success: true,
        message: 'Sikeres regisztráció!',
        user: { id: newUser.id, username: newUser.username, email: newUser.email }
    };
}

module.exports = { register, validateRegistrationData };

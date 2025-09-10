function validateFields(body, toValidate = []) {
    const errors = {};
    if (!body || typeof body !== 'object') {
        toValidate.forEach((field) => {
            errors[field] = `${field} is required`; // Assign error to specific field
        });
        return { isValid: false, errors };
    }
    toValidate.forEach((field) => {
        if (!body[field] || typeof body[field] !== 'string' || body[field].trim() === '') {
            errors[field] = `${field} is required`;
        }
    })
    const isValid = Object.keys(errors).length === 0;

    return { isValid, errors };

}

module.exports.validateSignupInput = function (body) {
    return validateFields(body, ["fullname", "email", "password"]);
};

module.exports.validateLogInInput = function (body) {
    return validateFields(body, ["email", "password"]);
};



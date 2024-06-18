let errors = {}

const errorMessage = (error) => {
    Object.values(error.errors).forEach((element, i) => {
        errors[i] = element.message
    })

    return errors[0]
}

module.exports = errorMessage
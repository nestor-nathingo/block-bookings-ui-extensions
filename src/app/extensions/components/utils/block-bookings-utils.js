/**
 * Validates the block booking form by checking if all required fields are filled and
 * if they meet their validation rules.
 * @param {Object} event - The form submission event containing the target values.  
 * @param {Function} sendAlert - Function to send alerts to the user.
 * @param {Function} getformValidationStates - Function to get the current form validation states.
 * @param {Function} setFormValidationStates - Function to update the form validation states.
 * @param {Function} handleClick - Function to handle the click event after validation.
 * @returns {void}  
 * @throws {Error} If there is an error during validation.
 * @example
 * // Example usage:
 * validateBlockBookingForm(event, sendAlert, getformValidationStates, setFormValidationStates, handleClick);   
 * */

export function validateBlockBookingForm(event, sendAlert, getformValidationStates, setFormValidationStates, handleClick) {
    let isValid = true;
    let formValidationStates = getformValidationStates();
    // console.log("Form submitted with values:", event);
    // console.log("Form submitted with hasOwnProperty: ", event.targetValue.hasOwnProperty("innkeeper-booking-reference"));

    // Check if all required fields are filled
    for (const [key, value] of Object.entries(formValidationStates)) {
        try {
            // console.log(`Form submitted with ${value.label}, isValid: ${value.isValid}, inFormData: `, event.targetValue.hasOwnProperty(value.label));

            if ((event.targetValue[value.label].trim().length === 0 && event.targetValue.hasOwnProperty(value.label) && value.required)) {
                formValidationStates[key].isValid = false;
                isValid = false;
                break;
            } else {
                formValidationStates[key].isValid = true;
            }
        } catch (error) {
            console.debug(`Error checking key ${key}:`, error.stack);
        }
    }

    // console.log("Form validation states after checking required fields:", formValidationStates);

    // Validate each field based on its validation rules
    for (const [key, value] of Object.entries(formValidationStates)) {
        setFormValidationStates((prevStates) => ({
            ...prevStates,
            [key]: {
                ...prevStates[[key]],
                isValid: value.isValid,
            },
        }));
        if (!value.isValid) {
            isValid = false;
            console.log(`Validation failed for ${key}:`, value);

        }
    }

    if (isValid) {
        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData.entries());
        handleClick()
    } else {
        sendAlert({ message: "Please fix the errors in the form.", type: "danger" });
    }
}

// export const handleClick = async (runServerless, sendAlert) => {
//     const { response } = await runServerless({ name: "bookingValidation", parameters: { text: "text" } });
//     sendAlert({ message: response });
// };

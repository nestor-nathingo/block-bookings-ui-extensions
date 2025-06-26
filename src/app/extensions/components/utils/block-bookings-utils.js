export function validateBlockBookingForm(event, sendAlert, getformValidationStates, setFormValidationStates, handleClick) {
    let isValid = true;
    let formValidationStates = getformValidationStates();
    console.log("Form submitted with values:", event);
    console.log("Form submitted with hasOwnProperty: ", event.targetValue.hasOwnProperty("innkeeper-booking-reference"));


    // Check if all required fields are filled
    for (const [key, value] of Object.entries(formValidationStates)) {
        try {
            console.log(`Form submitted with ${value.label}, isValid: ${value.isValid}, inFormData: `, event.targetValue.hasOwnProperty(value.label));

            if ((event.targetValue[value.label].trim().length === 0 && event.targetValue.hasOwnProperty(value.label) && value.required)) {
                // || !value.isValid) {
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

    console.log("Form validation states after checking required fields:", formValidationStates);
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
        sendAlert({ message: "Form submitted successfully!" });

    } else {
        sendAlert({ message: "Please fix the errors in the form.", type: "danger" });
    }
}

// export const handleClick = async (runServerless, sendAlert) => {
//     const { response } = await runServerless({ name: "bookingValidation", parameters: { text: "text" } });
//     sendAlert({ message: response });
// };

const axios = require('axios');

exports.main = async (context = {}) => {
  const { bookingDisplays, bookingReference } = context.parameters;
  const bookingsEndpoint = process.env.BOOKING_URL;

  /**
   * Transforms the booking response to a more readable format.
   * @param {Object} bookingResponse - The response object from the booking API.
   * @returns {Object} - Transformed response with validation status and messages.
   */

  function transformBookingResponse(bookingResponse) {
    const result = {};

    for (const bookingDisplay in bookingResponse) {
      const value = bookingResponse[bookingDisplay];
      const isValid = value !== null && Array.isArray(value["Booking IDs"]) && value["Booking IDs"].length > 0;

      result[bookingDisplay] = {
        isValid,
        message: `The booking display '${bookingDisplay}' is ${isValid ? 'valid' : 'invalid'}`
      };
    }
    return result;
  }

  //
  try {
    // Validate the required parameters
    let parameters = {
      "Block_Booking_Validation": 1,
      ...(!!bookingDisplays && { "Booking_Displays": bookingDisplays }),
      ...(!!bookingReference && { "Booking_Reference": bookingReference }),
    };

    const response = await axios({
      method: 'get',
      url: bookingsEndpoint,
      headers: {
        'Content-Type': 'application/json'
      },
      params: parameters
    });

    const transformedResponse = parameters.Booking_Displays ? transformBookingResponse(response.data) : response.data;
    return transformedResponse;

  } catch (error) {
    console.error("Error calling booking endpoint:", error.message);
    return {
      error: true,
      message: error.message
    };
  }
};
/**
 * Create Deal
 * @author: Nestor Nathingo
 * @description: This function creates a deal in HubSpot using the HubSpot API.
 */
const hubspot = require('@hubspot/api-client');

exports.main = async (context = {}) => {

    const { dealName, dealType, blockBookingType, innkeeperBookingNumbers, innkeeperBookingReference, dealStage, emailRecipient, ticketId, dealOwnerId } = context.parameters;
    const hubspotClient = new hubspot.Client({ accessToken: process.env.HUBSPOT_ACCESS_TOKEN });
    const dealPipeline = process.env.HUBSPOT_DEAL_PIPELINE;

    const dealProperties = {
        properties: {
            dealname: dealName,
            dealtype: dealType,
            dealstage: dealStage,
            pipeline: dealPipeline.toString(),
            block_booking_type: blockBookingType,
            innkeeper_booking_numbers: innkeeperBookingNumbers,
            innkeeper_booking_references: innkeeperBookingReference,
            block_booking_email_recipient: emailRecipient,
            hubspot_owner_id: dealOwnerId
        },
    };

    try {
        const createDealResponse = await hubspotClient.crm.deals.basicApi.create(dealProperties);

        const dealId = createDealResponse.id;

        // 2. Associate the deal with the ticket
        if (ticketId && dealId) {
            await hubspotClient.crm.deals.associationsApi.create(dealId,
                'tickets',
                ticketId,
                27
            );
        }

        return {
            success: true,
            message: "Deal created successfully",
            dealId,
            details: {
                properties: createDealResponse.properties,
                associations: createDealResponse.associations || {}
            }
        }
    } catch (error) {
        console.error("❌ Error creating deal:", {
            message: error.message,
            statusCode: error.response?.status,
            errors: error.response?.body?.errors,
            correlationId: error.response?.headers?.['x-hubspot-correlation-id'],
        });

        return {
            success: false,
            message: "Error creating deal",
            error: error.message,
            details: {
                status: error.response?.status,
                errors: error.response?.body?.errors || [],
                correlationId: error.response?.headers?.['x-hubspot-correlation-id'],
            },
        };
    }
}

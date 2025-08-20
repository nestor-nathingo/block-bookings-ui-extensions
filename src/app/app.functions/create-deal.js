// creates a deal in hubspot
const hubspot = require('@hubspot/api-client');

exports.main = async (context = {}) => {
    console.log("Creating a deal in HubSpot with the following parameters:", context.parameters);

    const { dealName, dealType, blockBookingType, innkeeperBookingNumbers, innkeeperBookingReference, dealStage, emailRecipient, ticketId, dealOwner } = context.parameters;
    const hubspotClient = new hubspot.Client({ accessToken: process.env.HUBSPOT_ACCESS_TOKEN });
    const dealPipeline = process.env.HUBSPOT_DEAL_PIPELINE;

    const dealProperties = {
        properties: {
            dealname: dealName,
            dealtype: dealType,
            dealstage: dealStage,
            pipeline: dealPipeline.toString(), // pipeline is a string
            block_booking_type: blockBookingType,
            innkeeper_booking_numbers: innkeeperBookingNumbers,
            innkeeper_booking_references: innkeeperBookingReference,
            block_booking_email_recipient: emailRecipient,
            hubspot_owner_id: dealOwner
        },

    };
    console.debug("📨 Payload to HubSpot API:", dealProperties);

    try {
        const createDealResponse = await hubspotClient.crm.deals.basicApi.create(dealProperties);
        console.info("✅ Deal created successfully");
        console.debug("📬 Response from HubSpot API:", createDealResponse);

        const dealId = createDealResponse.id;
        console.info(`Deal ID: ${dealId}`);

        //2. Associate the deal with the ticket
        if (ticketId && dealId) {
            console.info(`Associating deal with ticket ID: ${ticketId}`);
            await hubspotClient.crm.deals.associationsApi.create(dealId,         // fromObjectId
                'tickets',      // toObjectType
                ticketId,       // toObjectId
                27
            );
            console.info("✅ Deal associated with ticket successfully");
            console.log(`Deal ${dealId} associated with ticket ${ticketId}`);
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
        console.log("❌ Error creating deal:", error.message);
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

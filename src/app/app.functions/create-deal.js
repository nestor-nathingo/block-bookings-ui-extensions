// creates a deal in hubspot
const hubspot = require('@hubspot/api-client');

exports.main = async (context = {}) => {
    console.log("Creating a deal in HubSpot with the following parameters:", context.parameters);
    const { dealName, dealAmount, dealStage, dealPipeline } = context.parameters;
    const hubspotClient = new hubspot.Client({ accessToken: process.env.HUBSPOT_ACCESS_TOKEN });

    const dealProperties = {
        properties: {
            dealname: dealName,
            amount: dealAmount,
            dealstage: dealStage,
            pipeline: dealPipeline
        }
        // associations: {
        //     // You can add associations here if needed, e.g., to associate with a contact or company
        //     // "associatedVids": [contactId],
        //     // "associatedCompanyIds": [companyId]
        // }  

    };
    console.debug("📨 Payload to HubSpot API:", dealProperties);

    try {

        const response = await hubspotClient.crm.deals.basicApi.create(dealProperties);
        console.debug("📬 Response from HubSpot API:", response);
        console.info("✅ Deal created successfully");
        console.log("🧾 Response body:", response);
        console.debug("🧾 Response body:", response.body);

        // return { success: true, message: "Deal created successfully", dealId: response.id };
     response = {
            success: true,
            message: "Deal created successfully",
            dealId: response.body.id,
            data: response.body
        };
        return response;
    } catch (error) {
        // Step 6: Better error diagnostics
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

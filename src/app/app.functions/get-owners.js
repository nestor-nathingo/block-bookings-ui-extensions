/**
 * Get Owners
 * @author: Nestor Nathingo
 * @description: This function retrieves the owner ID for a given user in HubSpot.
 */
const hubspot = require('@hubspot/api-client');
const hubspotClient = new hubspot.Client({ accessToken: process.env.HUBSPOT_ACCESS_TOKEN });

exports.main = async (context = {}) => {
    const userId = context.parameters?.userId;

    if (!userId) {
        return { error: 'No userId provided' };
    }

    try {
        const owner = await hubspotClient.crm.owners.ownersApi.getById(userId, 'userId');
        return { owner };  // owner.id is the hubspot_owner_id
    } catch (err) {
        return { error: err.response?.body || err.message };
    }
};

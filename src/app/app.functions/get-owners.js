
//implement my getOwners serveless function to get the currently logged in user's owner ID
// 
const hubspot = require('@hubspot/api-client');

exports.main = async (context = {}) => {

    const hubspot = require('@hubspot/api-client');
    const hubspotClient = new hubspot.Client({
        accessToken: process.env.HUBSPOT_ACCESS_TOKEN,
    });

    try {
        const userId = context.parameters?.userId; // ✅ FIX: parameters not direct context
        if (!userId) {
            return { error: "No userId provided" };
        }

        const owner = await hubspotClient.crm.owners.ownersApi.getById(userId);

        return { owner };
    } catch (err) {
        console.error("Error fetching owner", err.response?.body || err.message);
        return { error: err.message };
    }
};

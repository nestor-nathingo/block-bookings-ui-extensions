
//implement my getOwners serveless function to get the currently logged in user's owner ID
// 
const hubspot = require('@hubspot/api-client');

exports.main = async (context = {}) => {

    const hubspot = require('@hubspot/api-client');
    const hubspotClient = new hubspot.Client({
        accessToken: process.env.HUBSPOT_ACCESS_TOKEN,
    });

    const archived = false;

    try {
        const userId = context.parameters?.userId;
        if (!userId) {
            return { error: "No userId provided" };
        }

        const owner = await hubspotClient.crm.owners.ownersApi.getById(userId, "id", archived);

        return { owner };
    } catch (err) {
        console.error("Error fetching owner", err.response?.body || err.message);
        return { error: err.message };
    }
};

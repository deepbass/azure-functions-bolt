import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { AzureFunctionsReceiver } from "../Common/Receivers/AzureFunctionsReceiver"
import { App } from "@slack/bolt"

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<any> {
    const receiver = new AzureFunctionsReceiver(process.env["SLACK_SIGNING_SECRET"], context.log);
    const slackApp = new App({
        token: process.env["SLACK_BOT_TOKEN"],
        signingSecret: process.env["SLACK_SIGNING_SECRET"],
        receiver: receiver
    })

    slackApp.message(':wave:', async ({ message, say }) => {
        await say(`Hello, <@${message.user}>`);
    });
    slackApp.event('app_home_opened', async ({ event, context, body }) => {
        await slackApp.client.views.publish({
            token: context.botToken,
            user_id: event.user,
            view: {
                type: 'home',
                callback_id: 'home_view',
                blocks: [
                    {
                        type: 'section',
                        text: {
                            type: 'mrkdwn',
                            text: `Welcome to Azure Functions :zap: on Bolt :zap:!`,
                        },
                    }
                ]
            }
        })
    })
    const body = await receiver.requestHandler(req)
    console.log(body)
    return { status: 200, body: body }
};

export default httpTrigger;

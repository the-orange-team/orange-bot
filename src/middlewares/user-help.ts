import { app } from '../app';
import { orangeLogger } from '../logger';

const tag = 'user-help';

app.command('/help', async ({ payload, logger, context }) => {
    orangeLogger.logStep(logger, tag, 'received', payload);
    await context.sendComposedEphemeral({
        text: 'You asked for help?',
        blocks: [
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text:
                        'COÉ RAPAZIADAAAAA :jenkins_triggered: :ugo-triggered: :thomaz-triggered:  Eu sou o Orangebot :tangerine:, e isso é um guia sobre como usar meus comandos corretamente.',
                },
            },
            {
                type: 'divider',
            },
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text:
                        '*:one: Use o `/create` para criar um alias*. Escreva `/create` seguido do seguinte padrão `[alias] returning [url]`. Exemplo: `/create suckithaters returning http://i.imgur.com/4yuup.gif` \n\n\n :warning::warning::warning: SE LIGUE NO SEGUINTE, O NOME DO ALIAS NÃO PODE COMEÇAR COM O CARACTERE `:` EIM. \n\n se você tentar `/create :suckithaters returning http://i.imgur.com/4yuup.gif`, isso não vai funcionar :porra:',
                },
            },
            {
                type: 'divider',
            },
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text:
                        '*:two: Convocando um alias*. Dado que um alias existe, apenas escreva `:[alias]` que eu vou postar o que foi salvo como valor para esse alias. Ou seja escrevendo `:suckithaters` irá causar isso:',
                },
            },
            {
                type: 'image',
                title: {
                    type: 'plain_text',
                    text: 'image1',
                    emoji: true,
                },
                image_url: 'https://i.ibb.co/BB0csvw/Screen-Shot-2021-05-04-at-16-24-34.png',
                alt_text: 'image1',
            },
            {
                type: 'divider',
            },
            {
                type: 'context',
                elements: [
                    {
                        type: 'mrkdwn',
                        text:
                            'Esse bot foi feito com o puro suco do ódio por :guribadass:,:brabo:,:romulold: e :smoked-thomaz:, usem o `@ orangebotdevs` se precisarem de ajuda \n\n\n つづく',
                    },
                ],
            },
        ],
    });
});

import { app } from '../app';

const tag = 'user-help';

app.command('/help', async ({ context }) => {
    context.logStep(tag, 'received');
    await context.sendComposedEphemeral({
        text: 'You asked for help?',
        blocks: {
            blocks: [
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: 'Olar, eu sou o Orangebot :tangerine:, e já que você chamou o help sem passar nenhum argumento, eu vou dar uma descrição geral de como eu funciono,e aqui vai também um guia de como utilizar o help e explorar as minhas funcionalidades.',
                    },
                },
                {
                    type: 'divider',
                },
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: ':warning: Primeiramente, é importante entender que aqui no nosso Slack sempre foi utilizado o caractere `:` como forma de invocar um texto ou link armazenado diretamente no slackbot, por uma facilidade de referência, eu chamo esses textos que invocam um comportamento de `alias`. \n\n Ou seja, quando você digita `:qualquercoisa`, eu vou receber o alias `qualquercoisa` e buscar no meu banco de dados se há alguma resposta em link/imagem/texto para isso. Se o link for de imagem ou GIF, eu irei enviar ele no formato de bloco de imagem dedicado, sem necessidade de chamar thumbnails. Dito isso, aqui vai a lista de guias disponíveis.',
                    },
                },
                {
                    type: 'divider',
                },
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: '- `/help create` para ver as instruções de como criar um `alias` pela UI do slack',
                    },
                },
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: '- `/help cmdcrt` para ver as instruções de como criar um `alias` por comando de texto',
                    },
                },
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: '- `/help delete` para ver as instruções de como deletar um `alias`',
                    },
                },
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: '- `/help replace` para ver as instruções de como substituir um `alias`',
                    },
                },
                {
                    type: 'divider',
                },
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: 'Vocês podem acabar notando que eu tenho alguns comandos não descritos acima que aparecem listados na barra de texto, são eles: `/list`, `/pokerdolar`, `/reset` e o `/devmode`. O `/list` e `/pokerdolar` simplesmente pela razão de que você deve ser retardado se precisa de ajuda pra usar um comando que leva zero argumentos, apenas use e entenda. \n\n Já o `/reset` destroi completamente o meu banco de dados, logo o comando exige uma senha que apenas meus desenvolvedores tem, o mesmo vale para o `/devmode`, que desabilita que eu responda qualquer comando complexo caso algum problema grave apareça e seja necessário parar minha utilização.',
                    },
                },
                {
                    type: 'divider',
                },
                {
                    type: 'context',
                    elements: [
                        {
                            type: 'mrkdwn',
                            text: 'O orangebot foi feito por Guri :guribadass:, Rafael :brabo:, Rômulo :romulold: e Thomaz :smoked-thomaz:. Se der merda reclamem com eles. Ou resolva por conta própria aqui: https://github.com/the-orange-team/orange-bot',
                        },
                    ],
                },
            ],
        },
    });
});

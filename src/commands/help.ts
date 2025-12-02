/**
 * Cross-platform help command handler.
 */
import { CommandHandler, PlatformContext } from '../platforms/types';

const TAG = 'help';

// Help content in a platform-agnostic format
const HELP_MAIN = `**Olá! Eu sou o OrangeBot** 🍊

Eu respondo a aliases que você pode criar e invocar usando \`:nomedoalias\`.

**Comandos disponíveis:**

• \`/help\` - Mostra esta mensagem
• \`/help create\` - Como criar um alias
• \`/help delete\` - Como deletar um alias
• \`/help replace\` - Como substituir um alias
• \`/help hidden\` - Como ver um alias apenas para você

• \`/list\` - Lista todos os aliases disponíveis
• \`/create <nome> -v <valor>\` - Cria um novo alias
• \`/delete <nome>\` - Deleta um alias que você criou
• \`/replace <nome> -v <valor>\` - Substitui o valor de um alias
• \`/hidden <nome>\` - Mostra um alias apenas para você
• \`/fix-link <url>\` - Corrige links de Twitter/Reddit/Instagram para embed
• \`/pokedolar\` - Mostra a cotação do dólar com um Pokémon
• \`/free-epic-games\` - Mostra os jogos grátis da Epic Games`;

const HELP_CREATE = `**Como criar um alias:**

Use o comando: \`/create nome-do-alias -v valor\`

**Exemplo:**
\`/create saudacao -v Olá, mundo!\`

Depois você pode invocar com \`:saudacao\`

**Dicas:**
• O nome do alias não pode conter espaços
• O valor pode ser texto, URL de imagem ou GIF
• Você pode adicionar múltiplos valores separados por espaço`;

const HELP_DELETE = `**Como deletar um alias:**

Use o comando: \`/delete nome-do-alias\`

**Exemplo:**
\`/delete saudacao\`

**Nota:** Você só pode deletar aliases que você mesmo criou.`;

const HELP_REPLACE = `**Como substituir um alias:**

Use o comando: \`/replace nome-do-alias -v novo-valor\`

**Exemplo:**
\`/replace saudacao -v Olá, universo!\`

**Nota:** O alias deve existir previamente.`;

const HELP_HIDDEN = `**Como ver um alias apenas para você:**

Use o comando: \`/hidden nome-do-alias\`

**Exemplo:**
\`/hidden saudacao\`

A resposta será visível apenas para você (mensagem efêmera).`;

function getHelpContent(argument: string): string {
    switch (argument?.toLowerCase()) {
        case 'create':
        case 'cmdcrt':
            return HELP_CREATE;
        case 'delete':
            return HELP_DELETE;
        case 'replace':
            return HELP_REPLACE;
        case 'hidden':
            return HELP_HIDDEN;
        default:
            return HELP_MAIN;
    }
}

export const helpHandler: CommandHandler = async (ctx: PlatformContext) => {
    ctx.logStep(TAG, 'received');

    const argument = ctx.commandText.trim().split(' ')[0];
    const helpContent = getHelpContent(argument);

    await ctx.sendEphemeral({
        text: helpContent,
        markdown: helpContent,
    });
};

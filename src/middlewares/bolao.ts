import { app } from '../app';
import { bolaoCommandHandler } from '../bolao/commands';

app.command('/bolao', bolaoCommandHandler);

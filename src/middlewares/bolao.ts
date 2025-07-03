import { app } from '../app';
import { bolaoCommandHandler, handleBolaoPredictModal } from '../bolao/commands';

app.command('/bolao', bolaoCommandHandler);
app.view('bolao_predict_modal', handleBolaoPredictModal);

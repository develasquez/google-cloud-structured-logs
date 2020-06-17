const { v4: uuidv4 } = require('uuid');

let PROCESS_NAME = ''
const _getStructure = ({ trackId, task, parameters, result, message, error, startAt }) => {
    return {
        trackId: trackId || null, //UUID
        date: new Date(), //Automatico
        process: PROCESS_NAME || null, //String [status|commit|push]
        task: task || null, //Nombre de la funcion
        message: message || null, //mensaje de log si es que existe
        parameters: parameters || null, //Parametros que recibio la funcion si es que sirve
        error: error || null, //mensaje de error si es que existe
        result: result || null, //Resultado de la funcion si es que se necesita
        ms: startAt ? new Date() - new Date(startAt) + "ms" : null, //Tiempo de ejecucion en ms
    }
};
const Log = (processName) => {

    PROCESS_NAME = processName;
    const l = {
        newCtx: (task, uuid) => {
            const trackId = uuid ? uuid : uuidv4();
            l.info(_getStructure({ trackId, task }), 'Start Process');
            return JSON.parse(JSON.stringify(_getStructure({
                trackId
            })));
        },
        setCtx: (ctx, task, parameters) => {
            let params = ''
            try {
                params = JSON.stringify(parameters) || null
            } catch (e) { console.log(e) };
            ctx.task = task || 'Not Set';
            ctx.parameters = params;
            ctx.startAt = new Date();
            ctx.message = null;
            ctx.result = null;
            return JSON.parse(JSON.stringify(ctx));
        },
        catch: (ctx, exception) => {
            return {
                task: ctx.task,
                ex: exception
            };
        },
        info: (ctx, message, result) => {
            let resu = ''
            try {
                resu = JSON.stringify(result) || null
            } catch (e) { console.log(e) };
            ctx.message = message || '';
            ctx.result = resu;
            console.log(_getStructure(ctx));
        },
        error: (ctx, error) => {
            ctx.error = error || null;
            console.error(_getStructure(ctx));
            process.exit(1);
        }
    };
    return l;
};
process.on('uncaughtException', (err) => {
    const log = Log('uncaughtException');
    const ctx = log.setCtx(log.newCtx(), 'uncaughtException', {
        cpuUsage:  process.cpuUsage(),
        memoryUsage: process.memoryUsage(),
        uptime: process.uptime(),
        resourceUsage: process.resourceUsage()
    });
    log.error(ctx, err);
    process.exit(1);
});
module.exports = Log;

//import ExtendableError from 'es6-error'; // awaiting fix for es6-error

export class ExtendableError extends (<typeof Error>require('es6-error'))
{
    constructor(...args: any[]) {
        super(...args);
    }
}

///////////////////////////////////////////////////////////////////////////////

export class CommandError extends ExtendableError
{
    /**
     * Error that prevents the command from running.
     *
     * @param message Description of the error.
     */
     
    constructor(message: string) {
        super(message);
    }
}

///////////////////////////////////////////////////////////////////////////////

export class CommandUsageError extends CommandError
{
    /**
     * Command line usage error
     *
     * @param message Description of the usage error.
     */
     
    constructor(message: string) {
        super(message);
    }
}

///////////////////////////////////////////////////////////////////////////////

export class UnexpectedArgError extends CommandUsageError
{
    /**
     * Error for providing more non-option arguments than the command accepts.
     *
     * @param arg The unexpected argument
     */
     
    constructor(arg: string) {
        super('UnexpectedArgument: "'+ arg +'"');
    }
}


///////////////////////////////////////////////////////////////////////////////

export class CommandError extends Error
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

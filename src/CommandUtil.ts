
import Minimist = require("minimist");
const Prompt: any = require("prompt"); // TBD: define these typings

/**
 * Utility functions for assisting with command line processing.
 */

export class CommandUtil
{
    /**
     * Add minimist configuration options from one options set to another. The options are merged so that none are lost from either set.
     * 
     * @param toOptions Set to which to add options.
     * @param fromOptions Set from which to draw options for adding.
     */

    static addOptions(
        toOptions: Minimist.Opts,
        fromOptions: Minimist.Opts
    ) : void {
        for (let key in fromOptions) {
            let value = (<any[string]>fromOptions)[key];
            switch (key) {
                case 'alias':
                    // alias already initialized for --help as an object
                    Object.assign(toOptions.alias, value);
                    break;
                case 'boolean':
                    // boolean already initialized for -h as an array
                    let boolNames = <string[]>toOptions.boolean;
                    if (Array.isArray(value))
                        toOptions.boolean = boolNames.concat(value);
                    else
                        boolNames.push(value);
                    break;
                case 'default':
                    if (!toOptions.default)
                        toOptions.default = {};
                    Object.assign(toOptions.default, value);
                    break;
                case 'string':
                    if (!toOptions.string)
                        toOptions.string = [];
                    let stringNames = <string[]>toOptions.string;
                    if (typeof value === 'string')
                        stringNames.push(value);
                    else
                        toOptions.string = stringNames.concat(value);
                    break;
                default:
                    (<any[string]>fromOptions)[key] = value;
            }
        }
    }

    /**
     * Displays the provided message to stdout and waits for the user to respond and hit enter. If the user types "y" or "yes" (in any letter case), the second parameter of `next()` will be true, otherwise false.
     * This is a support method for implementations of `doCommand()`.
     *
     * @param message Message to present to the user.
     * @param next The next `function (err, confirmed)` to call, where `confirmed` is a boolean taking the value `true` when confirmed.
     */
        
    static confirm(
        message: string,
        next: (err: Error|null, confirmed?: boolean) => void
    ): void {
        Prompt.start();
        Prompt.get({
            name: 'yesno',
            message: message +" (y/n)",
            default: 'n'
        }, function(err: Error|null, result: { yesno: string }) {
            let answer = result.yesno.toLowerCase();
            next(null, (answer === 'y' || answer === 'yes'));
        });
    }

    /**
     * Sequentially retrieves the command line arguments that are not command line options. Each call returns the left-most such argument and then removes it from the provided argument list. Repeated calls to this function will retrieve the entire list as it depletes it.
     * 
     * @param args Minimist arguments, including '_', which is an array of strings, one for each provided non-option argument.
     * @returns the next non-option argument, found at `args._[0]`; null when there are no (more) such arguments.
     */

    static nextNonOptionArg(args: Minimist.ParsedArgs): string|null {
        if (args._.length === 0)
            return null;
        return args._.shift()!;
    }
}

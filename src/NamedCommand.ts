import Util = require("util");
import Minimist = require("minimist");
import { CommandRunner } from './CommandRunner';
import { CommandSpec } from './CommandSpec';
import * as Errors from './errors';

/******************************************************************************
NamedCommand is an abstract class representing a named command. When the first argument of the command line is a non-option argument (i.e. doesn't begin with a dash), this argument is expected to be the name of a named command. The remaining arguments are the arguments of the named command. CommandRunner passes these remaining arguments to the instance of NamedCommand that handles the named command, delegating execution of the command line to the instance.
******************************************************************************/

/**
 * NamedCommand is an abstract class representing a named command. After constructing an instance of a concrete subclass of NamedCommand, CommandRunner initializes the instance with the following properties:
 *
 * Property | Description
 * --- | ---
 * runner | The calling CommandRunner instance
 * spec | The CommandSpec specification for the command.
 * name | The name of this command, as appears in the first term of the syntax
 */

export abstract class NamedCommand
{
    //// CONFIGURATION ////////////////////////////////////////////////////////
    
    protected runner: CommandRunner; // the calling CommandRunner
    protected spec: CommandSpec; // the creating CommandSpec
    protected name: string; // the name of the command, per the CommandSpec
    
    //// PUBLIC INSTANCE METHODS //////////////////////////////////////////////
    // subclasses may override these methods
    
    /**
     * Adds command line options to the two already supported, `-h` and `--help`. Command line options are arguments that begin with one or two dashes. The method receives a minimist configuration options object, as described above, and optionally extends this object. To add options to the configuration, call `options.add(moreOptions)` with a minimist configuration options object `moreOptions` that defines the additional options. `options.add()` may be called any number of times, with each call adding any number of options. This feature is particularly useful for passing `options` up an inheritance tree to allow each ancestor class to separately extend the options.
     *
     * `addOptions()` does nothing by default. A subclass need only override this method to provide support for option arguments, which begin with one or two dashes.
     *
     * @param options A configuration object of options for minimist, as described above. Call `options.add(moreOptions)` to define more options.
     */
    
    addOptions(options: Minimist.Opts): void {
        // assume no arguments by default
    }
    
    /**
     * Parses and validates the command line arguments. The arguments are provided in the form of the output of minimist, as described above. The modified arguments subsequently pass to `doDefaultCommand()`.
     *
     * The `args` parameter contains the values of the defined options, and `args._` contains an array of all provided non-option arguments. `parseArgs()` must copy and remove from `args._` all of the non-option arguments it recognizes. CommandRunner will report the presence of unrecognized arguments if `parseArgs()` leaves `args._` non-empty. You may use `args._.shift()` or the convenience method `args.getNext()` to remove arguments, the latter of which returns null when there are no more non-option arguments. You may store the extracted values either as instance variables of `this` object or as additional properties of `args`.
     *
     * This method should throw CommandUsageError if any arguments are invalid. This is also the place where the command should check for the proper presence or absence of arguments. If this method returns without throwing and with `args._` empty, `doCommand()` is called next with this method's final value of `args`.
     *
     * `parseArgs()` does nothing by default.
     *
     * @param args The command line arguments as output by minimist and processed by `addOptions()`. Feel free to modify this object or copy values to instance variables of the named command. `args._` must be empty on return in order for CommandRunner to run the command.
     */
     
    parseArgs(args: Minimist.ParsedArgs): void {
        // assume no arguments by default
    }
    
    /**
     * Performs the command. The method is called with the arguments object that `parseArgs()` processed. Behavior may be a function of these arguments and a function of any instance variables that `parseArg()` established. The method must call the `next()` callback when done and may pass an instance of CommandError to `next()` to report an error to the calling application.
     *
     * @param args An object containing the arguments output of minimist after processing by `parseArgs()`, including the command line options that `addOptions()` defined. `args._` is not available to this method.
     * @param next The next `function (err)` to call. The method must call this function when done and must not call it more than once.
     */
    
    abstract doCommand(
        args: Minimist.ParsedArgs,
        next: (err?: Error) => void
    ): void;
    
    /**
     * Returns help when `-h` or `--help` follows the command name on the command line. By default, the method returns only the syntax and summary lines that `getInfo()` provides. Override this method to produce more extensive help for the command. The output gets wrapped at a width configured for CommandRunner.
     *
     * @param rightMargin The character column after which CommandRunner will wrap the return value. Useful here for overriding default wrapping behavior.
     * @return String providing help for this particular command, possibly extensive multiline help.
     */
    
    getHelp(rightMargin: number): string {
        return this.runner.getHelpSummaryEntry(this.spec, rightMargin);
    }

    //// PROTECTED INSTANCE METHODS ///////////////////////////////////////////
    // subclasses may call these methods
    
    /**
     * Shorthand method for creating CommandError exceptions. The method accepts `Util.format()` arguments. That is, the first argument is a string that may contain `%` formatting codes, and the following arguments replace the codes in the string.
     *
     * This is a support method for implementations of `doCommand()`.
     *
     * @param message An error message, optionally using the `%` formatting codes of `Util.format()`.
     * @param formatArgs Optional arguments that replace `%` formatting codes in `message`.
     */
    
    error(message: string, ...formatArgs: any[]): Errors.CommandError {
        return new Errors.CommandError(Util.format(message, ...formatArgs));
    }
    
    /**
     * Shorthand method for creating CommandUsageError exceptions. The method accepts `Util.format()` arguments. That is, the first argument is a string that may contain `%` formatting codes, and the following arguments replace the codes in the string.
     *
     * This is a support method for implementations of `parseArgs()`.
     *
     * @param message An error message, optionally using the `%` formatting codes of `Util.format()`.
     * @param formatArgs Optional arguments that replace `%` formatting codes in `message`.
     */
    
    usageError(message: string, ...formatArgs: any[]): Errors.CommandUsageError
    {
        return new Errors.CommandUsageError(
                Util.format(message, ...formatArgs));
    }
    
    //// RESERVED INSTANCE METHODS ////////////////////////////////////////////
    // these methods are reserved for use by the framework

    _init(runner: CommandRunner, spec: CommandSpec): void {
        // this simplifies CommandSpec::createCommand()
        this.runner = runner;
        this.spec = spec;
        this.name = spec._name;
    }
}

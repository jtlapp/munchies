
import Minimist = require("minimist");
import OptionHelp = require("option-help");
import { CommandSpec } from './CommandSpec';
import { NamedCommand } from './NamedCommand';
import * as Errors from './errors';

//// CONSTANTS ////////////////////////////////////////////////////////////////

const DEFAULT_WRAP_WIDTH = 80; // default with at char which to wrap help output

//// TYPES ////////////////////////////////////////////////////////////////////

export namespace CommandRunner {
    export interface Options {
        helpWrapWidth?: number; // width in characters at which to wrap help output
    }
}

/******************************************************************************
CommandRunner is a class that implements a command line, taking arguments and performing a command. The class supports naming a command as the first argument. Different named commands are implemented via subclasses of NamedCommand. When no command name argument occurs, the class performs a default command.
******************************************************************************/

export class CommandRunner
{
    //// CONFIGURATION ////////////////////////////////////////////////////////
    
    protected commandSpecs: CommandSpec[]; // array of info about the commands available, at most one of which runs
    protected helpWrapWidth: number; // width in characters at which to wrap help output

    //// CONSTRUCTION /////////////////////////////////////////////////////////
    
    /**
     * CommandRunner is the base class for tools that implement CLIs supporting multiple commands. The `options` configuration parameter accepts the following properties:
     *
     * - `helpWrapWidth`: Width in characters at which to wrap help output. Defaults to 80.
     *
     * @param options The configuration options
     */
    
    constructor(options?: CommandRunner.Options) {
        options = options || {};
        this.helpWrapWidth = options.helpWrapWidth || DEFAULT_WRAP_WIDTH;
        this.commandSpecs = [];
    }
    
    //// PUBLIC METHODS ///////////////////////////////////////////////////////
    
    /**
     * Adds named commands, which are subclasses of NamedCommand. May be called multiple times. If the first argument of the command line is the name of one of these added commands, that named command is performed instead of the default command, calling `doCommand()` on the NamedCommand rather than `doDefaultCommand()` on this MultiCommand.
     *
     * @param group Group of command specifications to add. Each group is considered related. Groups are spaced from other groups in help.
     */
    
    addCommands(group: CommandSpec[]) {
        let firstOfGroup = true;
        group.forEach(spec => {

            this.commandSpecs.forEach(priorSpec => {

                if (spec._normName === priorSpec._normName) {
                    throw new Error("duplicate command name '"+
                            spec._normName +"'");
                }
            });
            spec._firstOfGroup = firstOfGroup;
            firstOfGroup = false;
            this.commandSpecs.push(spec);
        });
    }
    
    /**
     * Run the command line, including processing command line arguments. One of the methods MultiCommand::doDefaultCommand() and NamedCommand::doCommand() is responsible for performing the command after arguments have been processed. See NamedCommand for an explanation of how named commands are processed.
     *
     * @param argv An array of command line arguments to process. This array must exclude the arguments for executing the command. For example, if "node filename" executes the command, the caller can provide process.argv.slice(2).
     * @param next The next function to call. The caller should handle the error if it is an instance of CommandError.
     */
    
    run(argv: string[], next: (err?: Error) => void): void {
    
        // Create basic minimist configuration options for all commands.
        
        const configOptions = { boolean: ['h'], alias: { h: 'help' } };
        let args; // argument output of minimist, then further processed
        let command: NamedCommand|null = null;
        
        // Load a named command. The command must be the first argument.
        
        if (argv.length > 0 && argv[0][0] !== '-') {
            const commandName = String(argv[0]).toLowerCase();
            let commandSpec: CommandSpec|null = null;
            this.commandSpecs.forEach(spec => {

                if (spec._normName === commandName)
                    commandSpec = spec;
            });
            if (commandSpec === null) {
                return next(new Errors.CommandUsageError(
                        "unrecognized command '"+ commandName +"'"));
            }
            command = commandSpec!.createCommand();
            command._init(this, commandSpec);
            command.addOptions(configOptions);
            args = Minimist(argv.slice(1), configOptions);
        }
        
        // Load the default, unnamed command.
        
        else {
            this.addDefaultOptions(configOptions);
            args = Minimist(argv, configOptions);
            // allows MultiCommand to have more specific method names
        }
        
        // Show help if requested. (Additional args likely left out.)
        
        if (args.help) {
            let text = (command ? command.getHelp(this.helpWrapWidth) :
                    this.getHelp(this.helpWrapWidth));
            process.stdout.write(
                    OptionHelp.wrapText(text, this.helpWrapWidth, true));
            return next();
        }

        // Parse the arguments, throwing CommandUsageError when a problem
        // is found with the user input.
        
        args._ = args._.map(arg => {
            return String(arg); // minimist shouldn't decide non-option types
        });
        try {
            if (command)
                command.parseArgs(args);
            else
                this.parseDefaultArgs(args);
            if (args._.length > 0)
                return next(new Errors.UnexpectedArgError(args._[0]));
        }
        catch(err) {
            if (err instanceof Errors.CommandError)
                return next(err);
            throw err;
        }
        
        // Perform the command.

        if (command)
            command.doCommand(args, next);
        else
            this.doDefaultCommand(args, next);
    }
    
    //// PROTECTED METHODS ////////////////////////////////////////////////////
    // subclasses may override these methods
    
    /**
     * Adds command line options to the two already supported, `-h` and `--help`, for the case where the command line does not include a command name. Command line options are arguments that begin with one or two dashes. The method receives a minimist configuration options object and optionally extends this object. See NamedCommand::addOptions() for a fuller explanation of the purpose and behavior of this method.
     *
     * `addDefaultOptions()` does nothing by default. A subclass overrides this method to provide support for option arguments (arguments beginning with one or two dashes).
     *
     * @param options A configuration object of options for minimist. Call `CommandUtil.addOptions(options, moreOptions)` to define more options.
     */
    
    addDefaultOptions(options: Minimist.Opts): void {
        // there are no additional options by default
    }

    /**
     * Parses and validates command line arguments for the case where the command line does not include a command name. The arguments are provided in the form of the output of minimist. The modified arguments subsequently pass to `doDefaultCommand()`. See `NamedCommand#parseArgs` for a fuller explanation of the purpose and behavior of this method.
     *
     * This method should throw CommandUsageError if any arguments are invalid. This method's final value of `args` passes to `doDefaultCommand()`.
     *
     * `parseDefaultArgs()` does nothing by default. Override this method in a subclass to preprocess any provided argument options.
     *
     * @param args The command line arguments as output by minimist and processed by `addDefaultOptions()`. Feel free to modify this object or copy values to instance variables of the named command. `args._` will be empty.
     */
    
    parseDefaultArgs(args: Minimist.ParsedArgs): void {
        // nothing to parse by default
    }
    
    /**
     * Performs the default command. The default command is the command that MultiCommand represents when the first command line argument is not a command name. The method is called with the arguments object that `parseDefaultArgs()` processed. Behavior may be a function of these arguments and a function of any instance variables that `parseDefaultArgs()` established. The method must call the `next()` callback when done and may pass an instance of CommandError to `next()` to report an error to the calling application.
     *
     * @param args An object containing the arguments output of minimist after processing by `parseDefaultArgs()`, including the command line options that `addDefaultOptions()` defined. `args._` is not available to this method.
     * @param next The next to call. The method must call this function when done and must not call it more than once.
     */
    
    doDefaultCommand(args: Minimist.ParsedArgs, next: (err?: Error) => void) {
        if (this.commandSpecs.length > 0)
            next(new Errors.CommandUsageError("Missing command argument"));
        else
            next(new Error("Default command not implemented"));
    }
    
    /**
     * Returns a help summary of all of the commands. The default implementation prepends the output of `getHelpIntro()`, appends the output of `getHelpSummaryEntry()` for each named command, and finally appends the output of `getHelpTrailer()`. Override any of those methods to refine the default behavior, or override this method to completely replace this behavior. The output gets wrapped at a width configured for MultiCommand.
     *
     * @param rightMargin The character column after which CommandRunner will wrap the return value. Useful here for overriding default wrapping behavior.
     * @returns help output summarizing all of the commands.
     */
         
    getHelp(rightMargin: number): string {
        if (this.commandSpecs.length === 0)
            return "Help is not available.";
            
        let help = this.getHelpIntro(rightMargin);
        this.commandSpecs.forEach(spec => {

            if (spec._firstOfGroup)
                help += "\n";
            help += this.getHelpSummaryEntry(spec, rightMargin);
        });
        return help + this.getHelpTrailer(rightMargin);
    }
    
    /**
     * Returns the introduction for the help page that summarizes all of the available commands. A list of the available commands immediately follows this introduction, so the introduction may wish to introduce them.
     *
     * @param rightMargin The character column after which CommandRunner will wrap the return value. Useful here for overriding default wrapping behavior.
     * @returns an overall introduction to the general help page.
     */
    
    getHelpIntro(rightMargin: number): string {
        return "This tool supports the following commands:\n";
    }
    
    /**
     * Returns the summary help for a particular command as it should appear within the general help page.
     *
     * @param spec The specification for the command.
     * @param rightMargin The character column after which CommandRunner will wrap the return value. Useful here for overriding default wrapping behavior.
     * @return a summary of the indicated command.
     */
    
    getHelpSummaryEntry(spec: CommandSpec, rightMargin: number): string {
        let syntax = spec._syntax.substr(spec._name.length);
        let summary = OptionHelp.wrapText('  '+ spec._summary,
                            rightMargin, true)
        return `${spec._name.toUpperCase()}${syntax}\n${summary}\n`;        
    }
    
    /**
     * Returns text that should follow the summaries of all of the commands on the general help page. Returns only a blank line by default.
     *
     * @param rightMargin The character column after which CommandRunner will wrap the return value. Useful here for overriding default wrapping behavior.
     * @returns the text that ends the general help.
     */
    
    getHelpTrailer(rightMargin: number): string {
        return "\n";
    }
}

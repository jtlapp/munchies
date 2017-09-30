
import { NamedCommand } from './NamedCommand';

/**
 * CommandSpec is an abstract base class for specifying and creating named commands. It includes a factory method for creating commands so that a single configuration of CommandRunner can be run multiple times.
 */

export abstract class CommandSpec
{
    _name: string; // name of the command; inferred from syntax
    _normName: string; // name of the command in lowercase
    _syntax: string; // illustration of command's argument syntax
    _summary: string; // single line summarizing command
    _firstOfGroup: boolean; // whether command is first of a group of commands
    
    /**
     * @param syntax Illustration of the command's argument syntax. The first term of this string is the command name. The command name must neither begin with a dash nor contain spaces. The name may be in any letter case, but a user may provide the name in any letter case to run the command.
     * @param summary A single line that summarizes the command, for display when providing help for all of the commands.
     */

    constructor(syntax: string, summary: string) {
        this._syntax = syntax;
        this._summary = summary;
        let matches = syntax.match(/[^ ]+/);
        if (!matches) {
            throw new Error(`'${syntax}' is missing a command name`);
        }
        this._name = matches[0];
        if (this._name[0] === '-') {
            throw new Error("Command name '"+ this._name +
                                " cannot start with a dash");
        }
        this._normName = this._name.toLowerCase();
    }

    /**
     * Provides the name of the command, as given by the syntax.
     */

    getName(): string {
        return this._name;
    }

    /**
     * Provides the command's syntax.
     */

    getSyntax(): string {
        return this._syntax;
    }

    /**
     * Provides a single line summary of the command.
     */

    getSummary(): string {
        return this._summary;
    }

    /**
     * Create the instance of NamedCommand that runs the command.
     */

    abstract createCommand(): NamedCommand;
}

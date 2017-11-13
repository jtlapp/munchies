
import Minimist = require('minimist');
import {
    CommandRunner,
    CommandSpec,
    NamedCommand,
    CommandError,
    CommandUsageError
} from '../src/index';

class Demo extends CommandRunner {

    constructor() {
        super();
        this.addCommands([
            new SayHelloSpec()
        ]);
    }
}

class SayHelloSpec extends CommandSpec {

    constructor() {
        super("HELLO", "Says hello back to you");
    }

    createCommand() {
        return new SayHelloCmd();
    }
}

class SayHelloCmd extends NamedCommand {

    doCommand(
        args: Minimist.ParsedArgs,
        next: (err?: Error) => void
    ) {
        this.printLn("Well hello there!");
        next();
    }
}

new Demo().run(process.argv.slice(2), err => {
    if (err) {
        if (err instanceof CommandUsageError)
            process.stderr.write(err.message + " (-h for help)\n");
        else if (err instanceof CommandError)
            process.stderr.write(err.message + "\n");
        else
            throw err;
    }
});

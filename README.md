# Multi-projects management tool

![CircleCI](https://img.shields.io/circleci/build/github/throskam/eko)
![Codecov](https://img.shields.io/codecov/c/github/throskam/eko)
![npm-version](https://img.shields.io/npm/v/@throskam/eko)
![npm-license](https://img.shields.io/npm/l/@throskam/eko)

A **CLI** tool to manage multiple projects as a single meta project.

## Features

- **generic**: run any commands
- **performant**: run commands in parallel
- **shareable**: local configuration file

## Installation

`npm install -g @throskam/eko`

## Usage

See `eko --help` for details.

### Managing the project

If you already have a directory containing multiple projects you can use the
command `discover` to search recursively for git repositories.

`eko discover`

Otherwise, you can manually add repositories with `add`.

`eko add <repository> [directory]`

You can optionally create a repository for your *eko* project itself.
That way, anyone would be able to clone it using the `clone` command.

`eko clone <ekoable-repository> [directory]`

You can use the `sync` command to synchronize your project with its `.eko` file.

`eko sync`

Note that this command is only additive and won't remove any file.

### Executing Commands

`eko exec -- echo "Hi from \$PWD"`

Note that without the double dashes (`--`), conflicting flags will be interpreted
as *eko* flags.

You can create aliases to save commands under shorter names.

`eko alias greeting -- echo "echo "Hi from \$PWD""`

And then use them in `exec`.

`eko exec greeting`

## Colors

Colors in commands output are unfortunately not preserved because most command
line tools, like *git*, only activate colors if the output stream is the TTY itself
and not a pipe.
For instance `git status | cat` will print no colors.

In many cases, you can circumvent this issue by adding flags to the command.

`git -c color.status=always status | cat`

This method can be apply with *eko* too

`eko exec -- git -c color.status=always status`

## Roadmap

- Support for recursive project (execute *clone*, *sync*, *exec* and *status* recursively)
- Support for calling *eko* from a child directory like *git* does
- Support for tags as a grouping mechanism

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md)

## Related projects

- [gits](http://gitslave.sourceforge.net/gits-man-page.html)
- [gr](https://github.com/mixu/gr)
- [meta](https://github.com/mateodelnorte/meta)
- [mu-repo](https://github.com/fabioz/mu-repo/)
- [myrepos](http://myrepos.branchable.com/)
- [rgit](https://metacpan.org/pod/rgit)

# eko

Multiple projects management tool.

*eko* allows you to manage multiple projects as a single meta project.

## Installation

`npm install -g @throskam/eko`

## Usage

See `eko --help` for details.

**Creating a new eko project**

```
eko create
eko add <repository> [directory]

git init
git add .eko .gitignore
git commit
```

**Migrating to eko**

```
eko create
eko discover

git add .eko
git commit
```

**Cloning an existing eko project**

`eko clone <repository> [directory]`

**Updating the project**

```
eko sync
eko exec -- git pull
```

**Executing commands**

`eko exec -- echo "Hi from \$PWD"`

Note that without the double dashes (`--`), conflicting flags will be interpreted
as *eko* flags.

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
- Support for branch fixing

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md)

## Related projects

- [meta](https://github.com/mateodelnorte/meta)
- [gr](https://github.com/mixu/gr)
- [gits](http://gitslave.sourceforge.net/gits-man-page.html)
- [rgit](https://metacpan.org/pod/rgit)
- [mu-repo](https://github.com/fabioz/mu-repo/)
- [myrepos](http://myrepos.branchable.com/)
# Keyscript

Given this source:

```
save chord ctrl shift (s)
```

Keyscript can create observables that emit when combinations of keys are
pressed at once (a `chord`) or when key combos are pressed in a specific
sequence (a `seq`). These are **matchers** and specify how the list of keycodes
should be combined.

```ts
type Bindings = Map<string, Observable<KeyboardEvent[]> 

const bindings: Bindings = new Keyscript().compile(source);

bindings.get("save").pipe(() => console.log("save")); // press ctrl+s, "save" prints
```

## Examples

*I haven't done much testing since the last round of upgrades but these are guaranteed to at least compile.*

[alpine](examples/alpine/src/main.ts)

## Future

This is just a way for me to play with `peggy` and think about patterns for
handling keybindings -- probably. There are a few improvements that would
really make this genuinely useful as a global keyhandler. Contributions on any
of these are welcome! In particular I'm very open to revisions or additions to
the grammar -- I'm very much still learning about them.

### Roadmap (roughly in order)

#### Formal Tweaks

There's no duplicate checking and the grammar is kinda sloppy which makes
debugging hard. It's a lovely proof of concept but extending the grammar at all
will require a good foundation.

Keywords should be reserved.

Lists will only use `()`. Blocks (see below) use `{}`. And I'm reserving `[]`.

Mods need to move inside the list with the other keys -- I would like to
enforce that they be at the start, though.

Oh and comments with `--` (or another token).

#### Alternatives *(easy)*

Nesting a second list of keys inside the main matcher list should let any of
those keys act as an alternative. This is the same behavior used to enable the
mods with variants like `ShiftLeft` and `ShiftRight`. 

#### Matcher params

The use case I have in mind is `seq(100)` so that seqs can handle keyups as
long as you're fast enough. In this case, a 100 millisecond timeout is added.

#### Blocks

Declare a block with an "anonymous statement" like:

```
-- match when someone yells any of these words without capslock
_ _ (shift _) {
  some seq (s o m e)
  binds seq (b i n d s)
}

-- match words
_ seq(10) (_) {
  konami (k o n a m i c o d e)
  supercal (s u p e r c a l i f r a g i l i s t i c e x p i a l i d o c i o u s)
}
```

This would allow grouping things by defaults.

#### Macro matcher *(easy)*

While I plan to provide `Shift`, `ShiftLeft`, and `ShiftRight` as mods it would
be nice to say things like:

```
bothShift   macro (lshift rshift)
capitalS    chord $bothShift (s)
```

#### Meta streams

I'd like the order of statements to be relevant (hence the `Map`) but it's
going to take a lot of planning. Here's what I know so far:

Meta statements have their own set of matchers and are declared like a
statement with a block instead of a list of keys.

```
optimist choke(100) {
  full    chord (f)
  empty   chord (e)
}
```

Key streams within the meta block share an observable that combines their
output somehow. In the case of `choke` only one may emit (with a
cooldown/window time) and the first statement defined wins. One could also use
this to create a sequence of chords, for example.

```ts
bindings.get("optimist").events.pipe(console.log);
// press 'e' => 'empty'
// press 'f' => 'full'
// press 'ef' => 'full'
```

I'm thinking that `bufferTime` could enable `choke`. Just compare the array of
matched events against the list of events in the choke meta and return the
first match.

I'm undecided as to whether the raw streams would be available like:

```ts
bindings.get("optimist").get("empty").pipe(() => console.debug('but also empty'))
```

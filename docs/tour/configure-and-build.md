---
id: configure-and-build
title: 1 Configure and Build
---

We'll start our tour by configuring `buf` and building the `.proto` files that define
the pet store API, which specifies a way to create, get, and delete pets in the store.

You're expected to be in the `start` directory of the [https://github.com/bufbuild/buf-tour.git](https://github.com/bufbuild/buf-tour.git)
repository. From here, move into the `petapis` directory, which contains the pet store's
`.proto` files.

```terminal
$ cd petapis
```

## 1.1 Configure `buf` {#configure-buf}

`buf` is configured with a [`buf.yaml`](../configuration/v1/buf-yaml.md) file, which is easily
created with the following command:

```terminal
$ buf config init
```

After you run this command, you'll notice a `buf.yaml` in the current directory with the
following content:

```yaml title="buf.yaml"
version: v1
lint:
  use:
    - DEFAULT
breaking:
  use:
    - FILE
```

In `buf`'s default input mode, it assumes there is a `buf.yaml` in your current directory, or uses
the default values in lieu of a `buf.yaml` file. We recommend always having a `buf.yaml` file at the
root of your `.proto` files hierarchy, as this is how `.proto` import paths are resolved.

For those of you that have used `protoc`, the placement of the `buf.yaml` is analogous to a `protoc`
include (`-I`) path. **With `buf`, there is no `-I` flag** - each `protoc` `-I` path maps to a directory
that contains a `buf.yaml` (called a [module](../bsr/overview.md#module) in Buf parlance), and multiple modules
are stitched together with a [`buf.work.yaml`](../configuration/v1/buf-work-yaml.md), which defines a
[workspace](../reference/workspaces.md).

We'll cover workspaces when working with multiple roots later in the tour, but to illustrate how all these pieces
fit together here's a quick example using `protoc` and its equivalent in `buf`:

```terminal
$ protoc \
    -I proto \
    -I vendor/protoc-gen-validate \
    -o /dev/null \
    $(find proto -name '*.proto')
```

A `buf.yaml` would be placed in the `proto` and `vendor/protoc-gen-validate` directories, and you would define
a `buf.work.yaml` that contains the following:

```sh
.
├── buf.work.yaml
├── proto
│   ├── acme
│   │   └── weather
│   │       └── v1
│   │           └── weather.proto
│   └── buf.yaml
└── vendor
    └── protoc-gen-validate
        ├── buf.yaml
        └── validate
            └── validate.proto
```

```yaml title="buf.work"
version: v1
directories:
  - proto
  - vendor/protoc-gen-validate
```

For now, we'll stick to the `buf.yaml` we created above.

## 1.2 Build the API {#build-the-api}

Before we continue, let's verify that everything is set up properly:

```terminal
$ buf build
```

The above command should have exit code 0 and no output. This means that all of the `.proto` files
defined in the current directory successfully compile.

Plus, you can see some interesting details about the compiled artifact with a few flags and
[jq](https://stedolan.github.io/jq):

```terminal
$ buf build --exclude-source-info -o -#format=json | jq '.file[] | .package' | sort | uniq | head
"google.protobuf"
"google.type"
"pet.v1"
```

In this case, we see three packages: the [Well-Known Types](https://developers.google.com/protocol-buffers/docs/reference/google.protobuf),
a dependency on a `google` API, and the `pet.v1` API itself. We'll come back to this later.

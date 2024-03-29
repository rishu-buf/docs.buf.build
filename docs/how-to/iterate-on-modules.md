---
id: iterate-on-modules
title: Iterate on Modules
---

> For a comprehensive guide on working with [modules](../bsr/overview.md#module) and the Buf
> Schema Registry ([BSR](../bsr/overview.md)), please check out [the tour](../tour/introduction.md)!

As requirements change, you'll inevitably need to evolve your Protobuf APIs,
and potentially update your dependencies. As much as `buf`'s breaking change detection
gives you confidence that you'll be evolving your module in a backwards
compatible way, there can still be situations in which you want to validate a change
locally before pushing a new version to the BSR.

This guide assumes that you've used and/or familiarized yourself with the following:

  - [Modules](../bsr/overview.md#module)
  - [BSR](../bsr/overview.md)
  - [Workspaces](../reference/workspaces.md)

## Edit and push

The typical `buf` workflow involves editing your `.proto` files, and verifying
the changes continue to conform to the configured [lint rules](../lint/rules.md).

Once you've made your edits, you can manually verify your changes with the `buf` CLI,
or by [configuring your editor](../editor-integration.mdx) to automatically
report errors on save.

On the command line, this will look something along the lines of the following:

```sh
$ buf lint
$ buf generate
```

Once you're satisfied with the changes, save the change in your VCS (e.g. a Git repository)
like you would with regular code. If the module is published to the BSR, you can push a new
version using the following command:

```sh
$ buf push --tag "$(git rev-parse HEAD)"
```

The `--tag` flag isn't required, but we recommend tagging BSR commits with
version control references as a way to track corresponding revisions.

> All of these steps (and more) ought to be configured in [CI/CD](../ci-cd/setup.md). If you're a
> GitHub Actions user, make sure to check out the [GitHub Actions guide](../ci-cd/github-actions.md)
> to learn more.

## Update dependencies

If your module has any dependencies, you can update your dependencies to their latest versions
with the `buf mod update` command. This command will resolve the latest commit on the repository
, and update the contents of your module's [`buf.lock`](../configuration/v1/buf-lock.md).

For example, if a [`buf.yaml`](../configuration/v1/buf-yaml.md) is in the current directory,
updating your dependencies to their latest version is as simple as:

```sh
$ buf mod update
```

When your dependencies conform to `buf`'s default [lint](../lint/rules.md) and [breaking](../breaking/rules.md) rules,
updating is straightforward. However, despite `buf`'s best effort, dependencies might make changes that can break
compatibility, so you might encounter errors when you try to `buf push` a new version of your module to BSR.

With that said, we encourage you to validate compatibility with `buf build` after any call to `buf mod update`
like so:

```sh
$ buf mod update
$ buf build
```

## Edit multiple modules

As you develop `buf` modules, you might find yourself in a situation where you own multiple modules
that depend on each other. When you want to make a change to one of your modules, you normally need
to push the update up to the BSR so that the other module can update its dependency and use it
locally. This workflow incurs a frustrating feedback loop, and invites more opportunities for simple
mistakes in each pushed module commit.

The `buf` module [workspace](../reference/workspaces.md) was created to solve exactly this problem (and more).

For example, if you have two modules checked out in sibling directories:

```sh
.
├── paymentapis
│   ├── acme
│   │   └── payment
│   │       └── v2
│   │           └── payment.proto
│   ├── buf.lock
│   └── buf.yaml
└── petapis
    ├── acme
    │   └── pet
    │       └── v1
    │           └── pet.proto
    ├── buf.lock
    └── buf.yaml
```

```yaml title="petapis/buf.yaml"
version: v1
name: buf.build/acme/petapis
deps:
  - buf.build/acme/paymentapis
```

```yaml title="paymentapis/buf.yaml"
version: v1
name: buf.build/acme/paymentapis
```

You can add a [`buf.work.yaml`](../configuration/v1/buf-work-yaml.md) file in their parent directory like so:

```sh
.
├── buf.work.yaml
├── paymentapis
│   ├── acme
│   │   └── payment
│   │       └── v2
│   │           └── payment.proto
│   ├── buf.lock
│   └── buf.yaml
└── petapis
    ├── acme
    │   └── pet
    │       └── v1
    │           └── pet.proto
    ├── buf.lock
    └── buf.yaml
```

```yaml title="buf.work.yaml"
version: v1
directories:
  - paymentapis
  - petapis
```

Now when running `buf build petapis` the existence of the `buf.work.yaml` file will cause `buf`
to resolve the imports of `buf.build/acme/paymentapis` with the module defined in the `paymentapis`
directory, rather than by using the version fetched from the BSR according to the `buf.lock` specified
in the `petapis` directory.

Thus, you can make edits across both modules and immediately see the changes reflected between each module.
It's important to note that **workspaces only apply to local operations**. When you are ready to push
updates you've made in a local workspace, you'll need to push each module independently, starting with
the upstream modules first (`buf.build/acme/paymentapis` in this case). Once the upstream module's changes
are published, you can run the `buf mod update` command in the downstream module to fetch the latest version,
and continue to push each of your modules until all of your local changes are published to the BSR.

For more on workspaces, please refer to the [workspace documentation](../reference/workspaces.md).

`buf` provides a variety of powerful tools that help you develop your APIs and iterate on one or more
modules at a time. Make sure to check out more of the how-to guides to learn more!

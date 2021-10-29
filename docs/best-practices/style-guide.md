---
id: style-guide
title: Style Guide
---

This style guide is a concise reference for developers to refer to while writing Protobuf schema.

This Style Guide is designed to provide consistency and maintainability across a Protobuf schema of any size and any purpose. This Style Guide does not restrict organizations from making the design decisions they need to make for their individual APIs.

## Requirements

The requirements follow the set of rules from the [`DEFAULT`](../lint/rules.md#default) lint category.

> **NOTE:**
>
> These recommendations are not enforced by the BSR, although these are for your reference.All files should have a package defined. [(Why?)](../lint/rules.md#package_defined)

### Files and Packages

* All files should:
 * Have a package defined.
 * Be in the same directory and matches their package name.

  For example, if we have a [module](../bsr/overview.md#module) defined in the `proto` directory, we
expect the following `package` values:

```sh
.
└── proto
    ├── buf.yaml
    └── foo
        └── bar
            ├── bat
            │   └── v1
            │       └── bat.proto // package foo.bar.bat.v1
            └── baz
                └── v1
                    ├── baz.proto         // package foo.bar.baz.v1
                    └── baz_service.proto // package foo.bar.baz.v1
```

* Packages should follow the `lower.snake_case` convention.

* The last component of a package should be a version.

* File names should follow the `lower_snake_case.proto` convention.

The following file options should have the same value, or all be unset, for all files that have the same package:

- `csharp_namespace`
- `go_package`
- `java_multiple_files`
- `java_package`
- `php_namespace`
- `ruby_package`
- `swift_prefix`

For example, if we have file `foo_one.proto`:

```protobuf title="foo_one.proto"
syntax = "proto3";

package foo.v1;

option go_package = "foov1";
option java_multiple_files = true;
option java_package = "com.foo.v1";
```

Another file `foo_two.proto` with package `foo.v1` must have these three options set to the same value, and the other options unset:

```protobuf title="foo_two.proto"
syntax = "proto3";

package foo.v1;

option go_package = "foov1";
option java_multiple_files = true;
option java_package = "com.foo.v1";
```

For more information on rules of Files and Packages [click here](../lint/rules.md#package_lower_snake_case)

### Imports

No imports should be declared as `public` or `weak`. For more information on rules of Imports [click here](../lint/rules.md#import_no_weak).

### Enums

* Enums should not have the `allow_alias` option set.

* Enum names should follow the `PascalCase` convention.

* Enum value names should follow the `UPPER_SNAKE_CASE` convention.

* Enum value names should be prefixed with the `UPPER_SNAKE_CASE` of the enum name. For example, given the enum `FooBar`, all enum value names should be prefixed with `FOO_BAR_`.

* The zero value for all enums should be suffixed with `_UNSPECIFIED`.
The suffix is configurable for `buf` linting. For example, given the enum `FooBar`, the zero value should be
`FOO_BAR_UNSPECIFIED = 0;`.

For more information on rules of Enums [click here](../lint/rules.md#enum_no_allow_alias).

### Messages

* Message names should follow the `PascalCase` convention.

* Field names should follow the `lower_snake_case` convention.

* Oneof names should follow the `lower_snake_case` convention.

For more infomration on rules of Messages [click here](../lint/rules.md#message_pascal_case).

### Services

* Service names should follow the `PascalCase` convention.

* Service names should be suffixed with `Service`. The
suffix is configurable for `buf` linting.

* RPC names should follow the `PascalCase` convention.

* All RPC request and responses messages should be unique across your Protobuf schema.

* All RPC request and response messages should be named after the RPC, either by naming them `MethodNameRequest`, `MethodNameResponse` or `ServiceNameMethodNameRequest`, `ServiceNameMethodNameResponse`.

For more information on rules of Services [click here](../lint/rules.md#service_suffix).

## Recommendations

The following recommendations are exceptional style to avoid and set up breaking change detection for your Protobuf schema. Refer to the [breaking change detector documentation](../breaking/overview.md) to enforce with `buf`.

* Use `//` instead of `/* */` for comments.

* Provide all the information and use complete sentences in the comments. Put documentation above the type, instead of inline.

* Avoid widely-used keywords for all types, especially packages. For example, if your package name is `foo.internal.bar`, the `internal` component will block importing the generated stubs in other packages for Golang.

* Files should be ordered in the following manner (this matches [Google's current recommendations](https://developers.google.com/protocol-buffers/docs/style#file-structure)):

  - License header (if applicable)
  - File overview
  - Syntax
  - Package
  - Imports (sorted)
  - File options
  - Everything else

* Used pluralized names for repeated fields.

* Name fields after their type as much as possible. For example, for a field of message type `FooBar`, name the field `foo_bar` unless there is a specific reason to do otherwise.

* Avoid using nested enums and nested messages. You may end up wanting to use them outside of their context message in the future, even if you do not think so at the moment.

* Avoiding RPCs streaming as it is an obstacle to push RPC framework logic up the stack and it usually prevent developing more reliable architectures. Although they certainly have specific use cases that make them extremely valuable.
